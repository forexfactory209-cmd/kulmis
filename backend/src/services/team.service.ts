import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class TeamService {
  async getMyTeam(clientId: string, query: any) {
    const { status, search, page = 1, limit = 20 } = query;

    // Get the client's business profile
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { businessProfile: true }
    });

    if (!client || !client.businessProfile) {
      throw { status: 404, message: 'Business profile not found' };
    }

    const businessId = client.businessProfile.id;

    // Fetch contracts for this business
    const where: Prisma.ContractWhereInput = {
      businessId,
      ...(status && status !== 'All' ? { status: status as any } : {}),
    };

    if (search) {
      where.worker = {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } }
        ]
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          worker: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, status: true, email: true, freelancerProfile: { select: { title: true } } }
          },
          payrolls: {
            orderBy: { periodEnd: 'desc' },
            take: 1
          }
        },
        skip,
        take: Number(limit)
      }),
      prisma.contract.count({ where })
    ]);

    // Also get retainers if any
    const retainers = await prisma.retainerContract.findMany({
      where: {
        clientId,
        ...(status && status !== 'All' ? { status: status as any } : {})
      },
      include: {
        freelancer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, status: true, email: true, freelancerProfile: { select: { title: true } } }
        }
      }
    });

    // Format to a unified team list
    const team = [
      ...contracts.map(c => ({
        id: c.worker.id,
        contractId: c.id,
        member: {
          name: `${c.worker.firstName} ${c.worker.lastName}`,
          avatar: c.worker.avatarUrl,
          email: c.worker.email,
        },
        role: c.worker.freelancerProfile?.title || 'Team Member',
        department: c.employmentType, // Map employmentType to department for now
        status: c.status === 'ACTIVE' ? 'Active' : 'Pending', // Adjust based on your UI needs
        attendance: '100%', // Mocked for now, would need aggregation from Attendance model
        salary: `$${c.monthlySalary}/mo`
      })),
      ...retainers.map(r => ({
        id: r.freelancer.id,
        contractId: r.id,
        member: {
          name: `${r.freelancer.firstName} ${r.freelancer.lastName}`,
          avatar: r.freelancer.avatarUrl,
          email: r.freelancer.email,
        },
        role: r.freelancer.freelancerProfile?.title || 'Freelancer',
        department: 'External',
        status: r.status === 'ACTIVE' ? 'Active' : 'Pending',
        attendance: '-',
        salary: `$${r.monthlyRate}/mo`
      }))
    ];

    return {
      team,
      pagination: {
        total: total + retainers.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total + retainers.length) / Number(limit))
      }
    };
  }

  async getTeamStats(clientId: string) {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { businessProfile: true }
    });

    if (!client || !client.businessProfile) {
      return { totalMembers: 0, activeToday: 0, onLeave: 0, totalCost: 0 };
    }

    const businessId = client.businessProfile.id;

    const contracts = await prisma.contract.findMany({
      where: { businessId, status: 'ACTIVE' },
    });

    const retainers = await prisma.retainerContract.findMany({
      where: { clientId, status: 'ACTIVE' },
    });

    const totalCost = contracts.reduce((sum, c) => sum + c.monthlySalary, 0) + 
                      retainers.reduce((sum, r) => sum + Number(r.monthlyRate), 0);

    return {
      totalMembers: contracts.length + retainers.length,
      activeToday: contracts.length + retainers.length, // Mock
      onLeave: 0,
      totalCost
    };
  }

  async getWorkerDetails(clientId: string, workerId: string) {
    const worker = await prisma.user.findUnique({
      where: { id: workerId },
      include: { freelancerProfile: { include: { skills: true } } }
    });

    if (!worker) throw { status: 404, message: 'Worker not found' };

    // Get attendance
    const attendances = await prisma.attendance.findMany({
      where: { workerId },
      orderBy: { date: 'desc' },
      take: 7
    });

    // Get recent files
    const recentFiles = await prisma.projectFile.findMany({
      where: { uploaderId: workerId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent reviews or discussions (mocking actual project completion events or something similar)
    const recentDiscussions = await prisma.projectDiscussion.findMany({
      where: { authorId: workerId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const activities = [
      ...attendances.map((a: any) => ({
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: '#8B5CF6',
        title: `Checked in at ${new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        time: new Date(a.date).toLocaleDateString(),
        timestamp: new Date(a.date).getTime()
      })),
      ...recentFiles.map((f: any) => ({
        icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
        bg: '#3B82F6',
        title: `Uploaded file: ${f.name}`,
        time: new Date(f.createdAt).toLocaleDateString(),
        timestamp: new Date(f.createdAt).getTime()
      })),
      ...recentDiscussions.map((d: any) => ({
        icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
        bg: '#F59E0B',
        title: `Posted a project update`,
        time: new Date(d.createdAt).toLocaleDateString(),
        timestamp: new Date(d.createdAt).getTime()
      }))
    ];

    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Get Payroll / Contracts
    const clientUser = await prisma.user.findUnique({ where: { id: clientId }, include: { businessProfile: true } });
    const businessId = clientUser?.businessProfile?.id || '';

    const contracts = await prisma.contract.findMany({
      where: { businessId, workerId },
      include: { payrolls: { orderBy: { periodEnd: 'desc' } } }
    });

    // Get assigned Projects/Tasks
    const projects = await prisma.project.findMany({
      where: {
        clientId,
        invitations: { some: { freelancerId: workerId, status: 'ACCEPTED' } }
      },
      include: { progressSteps: true }
    });

    const performance = {
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      tasksCompleted: projects.flatMap(p => p.progressSteps).filter(s => s.status === 'COMPLETED').length,
      rating: 4.9 // Mocking actual reviews aggregation
    };

    return {
      worker: {
        id: worker.id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        avatarUrl: worker.avatarUrl,
        role: worker.freelancerProfile?.title,
        skills: worker.freelancerProfile?.skills
      },
      attendances,
      recentActivity: activities.slice(0, 5),
      payroll: {
        contracts,
        payrolls: contracts.flatMap(c => c.payrolls).sort((a, b) => b.periodEnd.getTime() - a.periodEnd.getTime())
      },
      tasks: projects,
      files: recentFiles,
      performance
    };
  }
}
