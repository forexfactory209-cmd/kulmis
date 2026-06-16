"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ProjectRepository {
    async create(data) {
        return prisma_1.prisma.project.create({
            data,
            include: {
                client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                _count: { select: { proposals: true } },
            },
        });
    }
    async findAll(filters) {
        const { status, category, search, clientId, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (status)
            where.status = status;
        if (category)
            where.category = { contains: category };
        if (clientId)
            where.clientId = clientId;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }
        const [projects, total] = await Promise.all([
            prisma_1.prisma.project.findMany({
                where,
                skip,
                take: limit,
                include: {
                    client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                    _count: { select: { proposals: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.project.count({ where }),
        ]);
        return { projects, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    parseProjectMetadata(project) {
        if (!project)
            return null;
        let cleanDescription = project.description;
        let progress = 0;
        let milestones = [];
        let timeline = [];
        let files = [];
        let isPlanSubmitted = false;
        if (project.description && project.description.includes('---METADATA---')) {
            const parts = project.description.split('---METADATA---');
            cleanDescription = parts[0].trim();
            try {
                const metadata = JSON.parse(parts[1].trim());
                progress = metadata.progress || 0;
                milestones = metadata.milestones || [];
                timeline = metadata.timeline || [];
                files = metadata.files || [];
                isPlanSubmitted = metadata.isPlanSubmitted || false;
            }
            catch (e) {
                console.error('Failed to parse project metadata JSON', e);
            }
        }
        const isMock = !project.id || !isNaN(Number(project.id)) || String(project.id).startsWith('proj_') || String(project.id).startsWith('p');
        if (isMock) {
            isPlanSubmitted = true;
        }
        // Fallback/Default metadata if empty (for in-progress or completed projects)
        if (milestones.length === 0 && (project.status === 'IN_PROGRESS' || project.status === 'COMPLETED')) {
            milestones = [
                { id: '1', title: 'Concept & Brief', status: 'Pending', price: Number(project.budget) * 0.2 },
                { id: '2', title: 'Initial Draft & Wireframes', status: 'Pending', price: Number(project.budget) * 0.4 },
                { id: '3', title: 'UI Design & Prototyping', status: 'Pending', price: Number(project.budget) * 0.3 },
                { id: '4', title: 'Final Delivery', status: 'Pending', price: Number(project.budget) * 0.1 },
            ];
            progress = 0;
            timeline = [
                { title: 'Contract Initiated', time: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(), desc: 'Client and Freelancer successfully connected for the project.' },
                { title: 'Escrow Deposited', time: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(), desc: 'Client funded the project balance into Somlance Secure Escrow.' },
            ];
            files = [
                { name: 'Brand_Briefing.pdf', size: '1.8 MB', type: 'client', url: 'https://somlance-assets.s3.amazonaws.com/brief.pdf' }
            ];
        }
        return {
            ...project,
            description: cleanDescription,
            progress,
            milestones,
            timeline,
            files,
            isPlanSubmitted,
        };
    }
    async findById(id) {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                proposals: {
                    include: {
                        freelancer: {
                            include: {
                                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                escrow: true,
                reviews: { include: { reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
                _count: { select: { proposals: true } },
            },
        });
        return this.parseProjectMetadata(project);
    }
    async update(id, data) {
        const existing = await prisma_1.prisma.project.findUnique({ where: { id } });
        if (!existing)
            throw new Error('Project not found');
        let cleanDescription = existing.description;
        if (existing.description.includes('---METADATA---')) {
            cleanDescription = existing.description.split('---METADATA---')[0].trim();
        }
        let progress = data.progress;
        let milestones = data.milestones;
        let timeline = data.timeline;
        let files = data.files;
        let isPlanSubmitted = data.isPlanSubmitted;
        if (existing.description.includes('---METADATA---')) {
            try {
                const oldMetadata = JSON.parse(existing.description.split('---METADATA---')[1].trim());
                if (progress === undefined)
                    progress = oldMetadata.progress;
                if (milestones === undefined)
                    milestones = oldMetadata.milestones;
                if (timeline === undefined)
                    timeline = oldMetadata.timeline;
                if (files === undefined)
                    files = oldMetadata.files;
                if (isPlanSubmitted === undefined)
                    isPlanSubmitted = oldMetadata.isPlanSubmitted;
            }
            catch (e) { }
        }
        const hasMetadata = progress !== undefined || milestones !== undefined || timeline !== undefined || files !== undefined || isPlanSubmitted !== undefined;
        let finalDescription = cleanDescription;
        if (hasMetadata) {
            const metadata = {
                progress: progress || 0,
                milestones: milestones || [],
                timeline: timeline || [],
                files: files || [],
                isPlanSubmitted: isPlanSubmitted || false
            };
            finalDescription = `${cleanDescription} ---METADATA--- ${JSON.stringify(metadata)}`;
        }
        const prismaUpdateData = {};
        if (data.status)
            prismaUpdateData.status = data.status;
        if (data.title)
            prismaUpdateData.title = data.title;
        if (data.budget)
            prismaUpdateData.budget = data.budget;
        if (data.category)
            prismaUpdateData.category = data.category;
        if (data.deadline)
            prismaUpdateData.deadline = data.deadline;
        if (hasMetadata || data.description !== undefined) {
            prismaUpdateData.description = hasMetadata ? finalDescription : data.description;
        }
        const updated = await prisma_1.prisma.project.update({
            where: { id },
            data: prismaUpdateData,
            include: {
                client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                _count: { select: { proposals: true } },
            },
        });
        return this.parseProjectMetadata(updated);
    }
    async delete(id) {
        return prisma_1.prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
exports.ProjectRepository = ProjectRepository;
