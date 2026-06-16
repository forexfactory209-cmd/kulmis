"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ProposalRepository {
    async create(data) {
        return prisma_1.prisma.proposal.create({
            data,
            include: {
                freelancer: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                        skills: true,
                    },
                },
                project: { select: { id: true, title: true, budget: true } },
            },
        });
    }
    async findByProject(projectId) {
        return prisma_1.prisma.proposal.findMany({
            where: { projectId },
            include: {
                freelancer: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                        skills: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByFreelancer(userId) {
        return prisma_1.prisma.proposal.findMany({
            where: { freelancer: { userId } },
            include: {
                project: {
                    include: {
                        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.proposal.findUnique({
            where: { id },
            include: {
                freelancer: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                    },
                },
                project: true,
            },
        });
    }
    async updateStatus(id, status) {
        return prisma_1.prisma.proposal.update({
            where: { id },
            data: { status },
        });
    }
}
exports.ProposalRepository = ProposalRepository;
