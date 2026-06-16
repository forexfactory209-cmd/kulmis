"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = require("../lib/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Settings file path
const SETTINGS_FILE = path_1.default.join(__dirname, '../../settings.json');
const getSettings = () => {
    if (fs_1.default.existsSync(SETTINGS_FILE)) {
        try {
            return JSON.parse(fs_1.default.readFileSync(SETTINGS_FILE, 'utf-8'));
        }
        catch (e) {
            console.error("Error reading settings.json", e);
        }
    }
    return {
        platformName: 'Somlance',
        supportEmail: 'support@somlance.com',
        defaultCurrency: 'USD',
        commissionRate: 15,
        maintenanceMode: false
    };
};
const saveSettings = (data) => {
    fs_1.default.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
};
class AdminController {
    // 1. Stats endpoint
    async getStats(req, res) {
        try {
            const totalUsers = await prisma_1.prisma.user.count({ where: { deletedAt: null } });
            const totalFreelancers = await prisma_1.prisma.user.count({ where: { role: 'FREELANCER', deletedAt: null } });
            const totalClients = await prisma_1.prisma.user.count({ where: { role: 'CLIENT', deletedAt: null } });
            // Calculate earnings from completed transactions or project budgets
            const completedTransactions = await prisma_1.prisma.transaction.findMany({
                where: { status: 'COMPLETED' }
            });
            const totalEarnings = completedTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
            const completedProjects = await prisma_1.prisma.project.count({ where: { status: 'COMPLETED', deletedAt: null } });
            const pendingDisputes = await prisma_1.prisma.dispute.count({ where: { status: 'PENDING' } });
            // Recent projects
            const recentProjects = await prisma_1.prisma.project.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                where: { deletedAt: null },
                include: {
                    client: { select: { firstName: true, lastName: true } }
                }
            });
            // Recent transactions
            const recentTransactions = await prisma_1.prisma.transaction.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
                }
            });
            res.json({
                success: true,
                data: {
                    stats: {
                        totalUsers,
                        totalFreelancers,
                        totalClients,
                        totalEarnings,
                        completedProjects,
                        pendingDisputes
                    },
                    recentProjects,
                    recentTransactions
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    // 2. Charts endpoint
    async getCharts(req, res) {
        try {
            // 2.1 Earning overview chart data (group by date)
            const transactions = await prisma_1.prisma.transaction.findMany({
                where: { status: 'COMPLETED' },
                orderBy: { createdAt: 'asc' }
            });
            const earningsByDate = {};
            transactions.forEach(t => {
                const dateStr = t.createdAt.toISOString().split('T')[0];
                earningsByDate[dateStr] = (earningsByDate[dateStr] || 0) + Number(t.amount);
            });
            const earningsOverview = Object.entries(earningsByDate).map(([date, amount]) => ({
                date,
                amount
            }));
            // 2.2 Transaction statuses chart data
            const completedTx = await prisma_1.prisma.transaction.count({ where: { status: 'COMPLETED' } });
            const pendingTx = await prisma_1.prisma.transaction.count({ where: { status: 'PENDING' } });
            const failedTx = await prisma_1.prisma.transaction.count({ where: { status: 'FAILED' } });
            const transactionStats = [
                { name: 'Completed', value: completedTx },
                { name: 'In Progress', value: pendingTx },
                { name: 'Cancelled', value: failedTx }
            ];
            // 2.3 Top Categories chart data
            const projects = await prisma_1.prisma.project.findMany({
                where: { deletedAt: null }
            });
            const categoryCounts = {};
            projects.forEach(p => {
                const cat = p.category || 'Other';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
            const totalProjectsCount = projects.length || 1;
            const topCategories = Object.entries(categoryCounts).map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / totalProjectsCount) * 100)
            })).sort((a, b) => b.count - a.count);
            res.json({
                success: true,
                data: {
                    earningsOverview,
                    transactionStats,
                    topCategories
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    // 3. User lists and actions
    async getUsers(req, res) {
        try {
            const { role, status, search } = req.query;
            const users = await prisma_1.prisma.user.findMany({
                where: {
                    deletedAt: null,
                    role: role ? role : undefined,
                    status: status ? status : undefined,
                    OR: search ? [
                        { email: { contains: search } },
                        { firstName: { contains: search } },
                        { lastName: { contains: search } }
                    ] : undefined
                },
                include: {
                    freelancerProfile: {
                        include: { skills: true }
                    },
                    clientProfile: true
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({ success: true, data: users });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateUserStatus(req, res) {
        try {
            const id = req.params.id;
            const { status } = req.body; // e.g. ACTIVE, SUSPENDED
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id },
                data: { status: status }
            });
            res.json({ success: true, data: updatedUser, message: 'User status updated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async verifyUser(req, res) {
        try {
            const id = req.params.id;
            const { isVerified } = req.body;
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id },
                data: { isVerified: Boolean(isVerified) }
            });
            res.json({ success: true, data: updatedUser, message: 'User verification status updated' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    // 4. Project actions
    async getProjects(req, res) {
        try {
            const { status, category, search } = req.query;
            const projects = await prisma_1.prisma.project.findMany({
                where: {
                    deletedAt: null,
                    status: status ? status : undefined,
                    category: category ? category : undefined,
                    OR: search ? [
                        { title: { contains: search } },
                        { description: { contains: search } }
                    ] : undefined
                },
                include: {
                    client: { select: { firstName: true, lastName: true, email: true } },
                    proposals: {
                        include: {
                            freelancer: {
                                include: { user: { select: { firstName: true, lastName: true } } }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({ success: true, data: projects });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateProjectStatus(req, res) {
        try {
            const id = req.params.id;
            const { status } = req.body;
            const updatedProject = await prisma_1.prisma.project.update({
                where: { id },
                data: { status: status }
            });
            res.json({ success: true, data: updatedProject, message: 'Project status updated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    // 5. Payment ledger & escrow
    async getTransactions(req, res) {
        try {
            const transactions = await prisma_1.prisma.transaction.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true, email: true, role: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            const escrows = await prisma_1.prisma.escrowPayment.findMany({
                include: {
                    project: {
                        include: {
                            client: { select: { firstName: true, lastName: true } }
                        }
                    }
                }
            });
            res.json({
                success: true,
                data: {
                    transactions,
                    escrows
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    // 6. Disputes management
    async getDisputes(req, res) {
        try {
            const disputes = await prisma_1.prisma.dispute.findMany({
                include: {
                    project: {
                        include: {
                            client: { select: { firstName: true, lastName: true, email: true } }
                        }
                    },
                    initiator: { select: { firstName: true, lastName: true, email: true, role: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({ success: true, data: disputes });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateDispute(req, res) {
        try {
            const id = req.params.id;
            const { status, resolution } = req.body;
            const updatedDispute = await prisma_1.prisma.dispute.update({
                where: { id },
                data: {
                    status: status,
                    resolution: resolution,
                    ...(status === 'RESOLVED' ? { project: { update: { status: 'COMPLETED' } } } : {})
                }
            });
            res.json({ success: true, data: updatedDispute, message: 'Dispute status updated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    // 7. Settings general
    async getSettings(req, res) {
        try {
            const settings = getSettings();
            res.json({ success: true, data: settings });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateSettings(req, res) {
        try {
            const settings = getSettings();
            const updatedSettings = {
                ...settings,
                ...req.body
            };
            saveSettings(updatedSettings);
            res.json({ success: true, data: updatedSettings, message: 'Settings saved successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
}
exports.AdminController = AdminController;
