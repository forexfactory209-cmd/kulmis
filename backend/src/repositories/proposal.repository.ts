import { prisma } from '../lib/prisma';

export class ProposalRepository {
  async create(data: {
    projectId: string;
    freelancerId: string;
    coverLetter: string;
    bidAmount: number;
    duration?: string;
  }) {
    return prisma.proposal.create({
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

  async findByProject(projectId: string) {
    return prisma.proposal.findMany({
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

  async findByFreelancer(userId: string) {
    return prisma.proposal.findMany({
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

  async findById(id: string) {
    return prisma.proposal.findUnique({
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

  async updateStatus(id: string, status: 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN') {
    return prisma.proposal.update({
      where: { id },
      data: { status },
    });
  }
}
