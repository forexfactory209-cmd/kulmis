import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class FreelancerService {
  async searchFreelancers(query: any) {
    const { search, skills, minRate, maxRate, availability, category, experience, location, page = 1, limit = 20 } = query;

    const where: Prisma.FreelancerProfileWhereInput = {
      user: {
        status: 'ACTIVE',
      }
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { bio: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s: string) => s.trim());
      where.skills = {
        some: {
          name: { in: skillsArray }
        }
      };
    }

    if (minRate || maxRate) {
      where.hourlyRate = {};
      if (minRate) (where.hourlyRate as any).gte = parseFloat(minRate);
      if (maxRate) (where.hourlyRate as any).lte = parseFloat(maxRate);
    }

    if (availability) {
      where.availability = availability;
    }

    if (category) {
      where.title = { contains: category };
    }

    if (experience) {
      // Map experience to hourly rate logic as a proxy if we don't have a direct field
      if (experience === 'Entry Level') {
        if (!where.hourlyRate) where.hourlyRate = {};
        (where.hourlyRate as any).lte = 25;
      } else if (experience === 'Intermediate') {
        if (!where.hourlyRate) where.hourlyRate = {};
        (where.hourlyRate as any).gte = 25;
        (where.hourlyRate as any).lte = 75;
      } else if (experience === 'Expert') {
        if (!where.hourlyRate) where.hourlyRate = {};
        (where.hourlyRate as any).gte = 75;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [freelancers, total] = await Promise.all([
      prisma.freelancerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, status: true } },
          skills: true,
        },
        skip,
        take: Number(limit),
      }),
      prisma.freelancerProfile.count({ where })
    ]);

    return {
      freelancers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getFreelancerProfile(id: string) {
    const profile = await prisma.freelancerProfile.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
        skills: true,
        portfolios: true,
        certificates: true,
      }
    });

    if (!profile) {
      throw { status: 404, message: 'Freelancer not found' };
    }

    // Fetch work history (completed projects from accepted invitations)
    const workHistoryQuery = await prisma.projectInvitation.findMany({
      where: {
        freelancerId: profile.userId,
        status: 'ACCEPTED',
        project: { status: 'COMPLETED' }
      },
      include: {
        project: {
          include: {
            client: { include: { businessProfile: true } },
            progressSteps: true,
          }
        }
      }
    });

    const workHistory = workHistoryQuery.map(inv => inv.project).filter(Boolean);

    return { ...profile, workHistory };
  }

  async saveFreelancer(clientId: string, freelancerId: string) {
    // Check if freelancer exists
    const freelancer = await prisma.user.findUnique({
      where: { id: freelancerId }
    });

    if (!freelancer || freelancer.role !== 'FREELANCER') {
      throw { status: 404, message: 'Freelancer not found' };
    }

    await prisma.favoriteFreelancer.upsert({
      where: {
        clientId_freelancerId: {
          clientId,
          freelancerId
        }
      },
      update: {},
      create: {
        clientId,
        freelancerId
      }
    });
  }

  async unsaveFreelancer(clientId: string, freelancerId: string) {
    await prisma.favoriteFreelancer.delete({
      where: {
        clientId_freelancerId: {
          clientId,
          freelancerId
        }
      }
    });
  }

  async getSavedFreelancers(clientId: string) {
    const favorites = await prisma.favoriteFreelancer.findMany({
      where: { clientId },
      include: {
        freelancer: {
          include: {
            freelancerProfile: {
              include: {
                skills: true
              }
            }
          }
        }
      }
    });

    return favorites.map(f => ({
      ...f.freelancer.freelancerProfile,
      user: {
        id: f.freelancer.id,
        firstName: f.freelancer.firstName,
        lastName: f.freelancer.lastName,
        avatarUrl: f.freelancer.avatarUrl
      }
    }));
  }
  async getBusinessAnalytics(freelancerId: string) {
    // A freelancer is linked to businesses via Contracts
    const contracts = await prisma.contract.findMany({
      where: { workerId: freelancerId, status: 'ACTIVE' },
      include: {
        business: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
          }
        },
        payrolls: true
      }
    });

    // Also get all projects assigned via Invitations that are ACCEPTED
    const invitations = await prisma.projectInvitation.findMany({
      where: { freelancerId, status: 'ACCEPTED', projectId: { not: null } },
      include: {
        project: {
          include: {
            client: { include: { businessProfile: true } },
            progressSteps: true
          }
        }
      }
    });

    // Group by business
    const businessMap = new Map<string, any>();

    for (const contract of contracts) {
      const bId = contract.business.id;
      if (!businessMap.has(bId)) {
        businessMap.set(bId, {
          business: contract.business,
          contract,
          stats: { totalEarned: 0, pendingPayroll: 0, activeProjects: 0, completedProjects: 0 },
          projects: []
        });
      }
      
      const bData = businessMap.get(bId);
      contract.payrolls.forEach(p => {
        if (p.status === 'PAID') bData.stats.totalEarned += p.totalAmount;
        if (p.status === 'UNPAID') bData.stats.pendingPayroll += p.totalAmount;
      });
    }

    // Attach projects
    for (const inv of invitations) {
      if (inv.project && inv.project.client && inv.project.client.businessProfile) {
        const bId = inv.project.client.businessProfile.id;
        
        // If they have a project but no contract, add the business anyway
        if (!businessMap.has(bId)) {
          businessMap.set(bId, {
            business: inv.project.client.businessProfile,
            stats: { totalEarned: 0, pendingPayroll: 0, activeProjects: 0, completedProjects: 0 },
            projects: []
          });
        }
        
        const bData = businessMap.get(bId);
        bData.projects.push(inv.project);
        
        if (inv.project.status === 'COMPLETED') bData.stats.completedProjects++;
        else if (inv.project.status !== 'CANCELLED') bData.stats.activeProjects++;
      }
    }

    return Array.from(businessMap.values());
  }
}
