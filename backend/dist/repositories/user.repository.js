"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../lib/prisma");
class UserRepository {
    async findAll(filters) {
        const { role, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (role)
            where.role = role;
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    freelancerProfile: { include: { skills: true } },
                    clientProfile: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findFreelancers(filters) {
        const { search, skill, minRate, maxRate, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            role: 'FREELANCER',
            deletedAt: null,
            freelancerProfile: { isNot: null },
        };
        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { freelancerProfile: { title: { contains: search } } },
            ];
        }
        if (skill) {
            where.freelancerProfile = {
                ...where.freelancerProfile,
                skills: { some: { name: { contains: skill } } },
            };
        }
        if (minRate || maxRate) {
            where.freelancerProfile = {
                ...where.freelancerProfile,
                hourlyRate: {
                    ...(minRate ? { gte: minRate } : {}),
                    ...(maxRate ? { lte: maxRate } : {}),
                },
            };
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    freelancerProfile: { include: { skills: true, portfolios: true } },
                    reviewsReceived: { select: { rating: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        const freelancers = users.map((u) => {
            const ratings = u.reviewsReceived.map((r) => r.rating);
            const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            const { password, reviewsReceived, ...rest } = u;
            return { ...rest, avgRating: Math.round(avgRating * 10) / 10, totalReviews: ratings.length };
        });
        return { freelancers, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findById(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                freelancerProfile: { include: { skills: true, portfolios: true, certificates: true } },
                clientProfile: true,
                reviewsReceived: {
                    include: { reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!user)
            return null;
        const ratings = user.reviewsReceived.map((r) => r.rating);
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        const { password, ...rest } = user;
        return { ...rest, avgRating: Math.round(avgRating * 10) / 10, totalReviews: ratings.length };
    }
    async updateProfile(userId, data) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                avatarUrl: data.avatarUrl,
            },
            include: { freelancerProfile: { include: { skills: true } }, clientProfile: true },
        });
    }
    async updateFreelancerProfile(userId, data) {
        const updateData = {
            title: data.title,
            bio: data.bio,
            hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
            availability: data.availability,
            portfolioUrl: data.portfolioUrl,
        };
        if (data.skills) {
            updateData.skills = {
                set: [],
                connectOrCreate: data.skills.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            };
        }
        if (data.portfolios) {
            updateData.portfolios = {
                deleteMany: {},
                create: data.portfolios.map((p) => ({
                    title: p.title,
                    description: p.description,
                    imageUrl: p.imageUrl,
                    link: p.link,
                })),
            };
        }
        return prisma_1.prisma.freelancerProfile.update({
            where: { userId },
            data: updateData,
            include: {
                skills: true,
                portfolios: true,
            }
        });
    }
}
exports.UserRepository = UserRepository;
