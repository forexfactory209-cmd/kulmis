import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { cacheService } from '../lib/cache';

export class UserRepository {
  async findAll(filters: { role?: string; page?: number; limit?: number }) {
    const { role, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          freelancerProfile: { include: { skills: true } },
          clientProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findFreelancers(filters: {
    search?: string;
    skill?: string;
    minRate?: number;
    maxRate?: number;
    page?: number;
    limit?: number;
  }) {
    // Generate a unique cache key based on the filter stringification
    const cacheKey = `freelancers:list:${JSON.stringify(filters)}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const { search, skill, minRate, maxRate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
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
        skills: { some: { name: skill } },
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
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          freelancerProfile: {
            include: {
              skills: true,
              portfolios: true,
              certificates: true,
            },
          },
          // Only fetch the rating column, not entire review rows
          reviewsReceived: { select: { rating: true } },
          // Use _count for efficient total review count without loading rows
          _count: { select: { reviewsReceived: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const freelancers = users.map((u) => {
      const ratings = u.reviewsReceived.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const { password, reviewsReceived, _count, ...rest } = u;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, totalReviews: _count.reviewsReceived };
    });

    const result = { freelancers, total, page, limit, totalPages: Math.ceil(total / limit) };
    
    // Set cache with a 5-minute TTL (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        freelancerProfile: { 
          include: { 
            skills: true, 
            portfolios: true, 
            certificates: true,
            proposals: {
              where: { status: 'ACCEPTED', project: { status: 'COMPLETED' } },
              include: { project: { include: { client: { select: { firstName: true, lastName: true, avatarUrl: true } } } } }
            }
          } 
        },
        clientProfile: true,
        freelancerInvitations: {
          where: { status: 'ACCEPTED', project: { status: 'COMPLETED' } },
          include: { project: { include: { client: { select: { firstName: true, lastName: true, avatarUrl: true } } } } }
        },
        reviewsReceived: {
          include: { reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!user) return null;
    const ratings = user.reviewsReceived.map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const { password, ...rest } = user;
    return { ...rest, avgRating: Math.round(avgRating * 10) / 10, totalReviews: ratings.length };
  }

  async updateProfile(userId: string, data: any) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
      },
      include: { freelancerProfile: { include: { skills: true } }, clientProfile: true },
    });
    
    // Invalidate caches
    await cacheService.invalidateFreelancerCache(userId);
    return updated;
  }

  async updateFreelancerProfile(userId: string, data: any) {
    const updateData: any = {
      title: data.title,
      bio: data.bio,
      hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
      availability: data.availability,
      portfolioUrl: data.portfolioUrl,
    };

    if (data.skills) {
      updateData.skills = {
        set: [],
        connectOrCreate: data.skills.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    if (data.portfolios) {
      updateData.portfolios = {
        deleteMany: {},
        create: data.portfolios.map((p: any) => ({
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
          link: p.link,
        })),
      };
    }

    if (data.certificates) {
      updateData.certificates = {
        deleteMany: {},
        create: data.certificates.map((c: any) => ({
          name: c.name,
          issuingOrg: c.issuingOrg,
          issueDate: c.issueDate ? new Date(c.issueDate) : null,
          imageUrl: c.imageUrl || null,
        })),
      };
    }

    const updated = await prisma.freelancerProfile.update({
      where: { userId },
      data: updateData,
      include: {
        skills: true,
        portfolios: true,
        certificates: true,
      }
    });
    
    // Invalidate caches
    await cacheService.invalidateFreelancerCache(userId);
    return updated;
  }

  async toggleFavorite(clientId: string, freelancerId: string) {
    const existing = await prisma.favoriteFreelancer.findUnique({
      where: {
        clientId_freelancerId: { clientId, freelancerId }
      }
    });

    if (existing) {
      await prisma.favoriteFreelancer.delete({
        where: { id: existing.id }
      });
      return { isFavorite: false, message: 'Removed from favorites' };
    } else {
      await prisma.favoriteFreelancer.create({
        data: { clientId, freelancerId }
      });
      return { isFavorite: true, message: 'Added to favorites' };
    }
  }

  async getFavorites(clientId: string) {
    const favorites = await prisma.favoriteFreelancer.findMany({
      where: { clientId },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            freelancerProfile: {
              include: { skills: true }
            },
            reviewsReceived: { select: { rating: true } },
            _count: { select: { reviewsReceived: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return favorites.map(fav => {
      const u = fav.freelancer as any;
      const ratings = u.reviewsReceived.map((r: any) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a: any, b: any) => a + b, 0) / ratings.length : 0;
      const { reviewsReceived, _count, ...rest } = u;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, totalReviews: _count.reviewsReceived };
    });
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const bcrypt = require('bcrypt');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw { status: 400, message: 'Invalid current password' };

    const hashed = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });
    return true;
  }

  async toggleTwoFactor(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };

    const newValue = !user.twoFactorEnabled;
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: newValue }
    });
    return newValue;
  }

  async deleteAccount(userId: string) {
    // Soft delete to preserve historical data
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'DELETED'
      }
    });
    return true;
  }
}
