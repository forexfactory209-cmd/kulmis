"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ReviewRepository {
    async create(data) {
        return prisma_1.prisma.review.create({
            data,
            include: {
                reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                reviewee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
        });
    }
    async findByUser(userId) {
        return prisma_1.prisma.review.findMany({
            where: { revieweeId: userId },
            include: {
                reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                project: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByProject(projectId) {
        return prisma_1.prisma.review.findMany({
            where: { projectId },
            include: {
                reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
        });
    }
}
exports.ReviewRepository = ReviewRepository;
