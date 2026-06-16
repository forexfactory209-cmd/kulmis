import { prisma } from '../lib/prisma';
import { cacheService } from '../lib/cache';

export class ReviewRepository {
  async create(data: { projectId: string; reviewerId: string; revieweeId: string; rating: number; comment?: string }) {
    const review = await prisma.review.create({
      data,
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        reviewee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
    
    await cacheService.invalidateFreelancerCache(data.revieweeId);
    return review;
  }

  async findByUser(userId: string) {
    return prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProject(projectId: string) {
    return prisma.review.findMany({
      where: { projectId },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async findGivenByUser(reviewerId: string) {
    return prisma.review.findMany({
      where: { reviewerId },
      include: {
        reviewee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, reviewerId: string, rating: number, comment?: string) {
    const review = await prisma.review.update({
      where: { id, reviewerId },
      data: { rating, comment },
      include: {
        reviewee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, title: true } },
      }
    });
    await cacheService.invalidateFreelancerCache(review.revieweeId);
    return review;
  }

  async delete(id: string, reviewerId: string) {
    const review = await prisma.review.delete({
      where: { id, reviewerId },
    });
    await cacheService.invalidateFreelancerCache(review.revieweeId);
    return review;
  }
}
