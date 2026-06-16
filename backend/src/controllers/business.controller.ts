import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export class BusinessController {
  // Get overview statistics for the business dashboard
  async getDashboardOverview(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const cacheKey = `dashboard:overview:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const businessProfile = await prisma.businessProfile.findUnique({
        where: { userId }
      });

      if (!businessProfile) {
        return res.status(404).json({ success: false, error: { message: 'Business profile not found' } });
      }

      // 1. Calculate Total Spend (from Payrolls linked to Business's Contracts)
      const contracts = await prisma.contract.findMany({
        where: { businessId: businessProfile.id },
        include: {
          payrolls: {
            where: { status: 'PAID' } // assuming PAID
          }
        }
      });

      let totalSpend = 0;
      contracts.forEach(contract => {
        contract.payrolls.forEach(payroll => {
          totalSpend += payroll.totalAmount;
        });
      });

      // 2. Active Projects (Active Contracts)
      const activeContractsCount = await prisma.contract.count({
        where: { businessId: businessProfile.id, status: 'ACTIVE' }
      });

      // 3. Team Members (Unique Workers with ACTIVE contracts)
      const uniqueWorkers = await prisma.contract.findMany({
        where: { businessId: businessProfile.id, status: 'ACTIVE' },
        select: { workerId: true },
        distinct: ['workerId']
      });
      const teamMembersCount = uniqueWorkers.length;

      // 4. Hours Tracked
      // Calculate total hours from attendance clockIn to clockOut for these workers
      let hoursTracked = 0;
      const attendances = await prisma.attendance.findMany({
        where: {
          workerId: { in: uniqueWorkers.map(w => w.workerId) },
          clockIn: { not: null },
          clockOut: { not: null }
        }
      });

      attendances.forEach(att => {
        if (att.clockIn && att.clockOut) {
          const diff = att.clockOut.getTime() - att.clockIn.getTime();
          hoursTracked += diff / (1000 * 60 * 60);
        }
      });

      // 5. Recent Activity
      // For now, fetch recent contracts and payrolls as activities
      const recentContracts = await prisma.contract.findMany({
        where: { businessId: businessProfile.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { worker: true }
      });

      const recentPayrolls = await prisma.payroll.findMany({
        where: { contract: { businessId: businessProfile.id } },
        orderBy: { periodEnd: 'desc' },
        take: 3,
        include: { contract: { include: { worker: true } } }
      });

      const activities = [
        ...recentContracts.map(c => ({
          title: 'Contract Created',
          desc: `Contract with ${c.worker.firstName} ${c.worker.lastName}`,
          time: c.createdAt
        })),
        ...recentPayrolls.map(p => ({
          title: `Payroll ${p.status}`,
          desc: `$${p.totalAmount} for ${p.contract.worker.firstName} ${p.contract.worker.lastName}`,
          time: p.periodEnd
        }))
      ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5).map(a => ({
        ...a,
        time: a.time.toLocaleDateString() + ' ' + a.time.toLocaleTimeString()
      }));

      const responseData = {
        success: true,
        data: {
          stats: [
            { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, change: '+0%', positive: true },
            { label: 'Active Projects', value: activeContractsCount.toString(), change: '+0', positive: true },
            { label: 'Team Members', value: teamMembersCount.toString(), change: '0', positive: true },
            { label: 'Hours Tracked', value: `${Math.round(hoursTracked)}h`, change: '0%', positive: true }
          ],
          activities
        }
      };

      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);

      res.json(responseData);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Get Team Members (Freelancers hired by the business)
  async getTeam(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const businessProfile = await prisma.businessProfile.findUnique({
        where: { userId }
      });

      if (!businessProfile) {
        return res.status(404).json({ success: false, error: { message: 'Business profile not found' } });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
          where: { businessId: businessProfile.id },
          include: {
            worker: {
              include: {
                freelancerProfile: true
              }
            }
          },
          skip,
          take: limit
        }),
        prisma.contract.count({ where: { businessId: businessProfile.id } })
      ]);

      // Format team members
      const team = contracts.map(contract => ({
        id: contract.worker.id,
        contractId: contract.id,
        name: `${contract.worker.firstName} ${contract.worker.lastName}`,
        email: contract.worker.email,
        role: contract.worker.freelancerProfile?.title || contract.employmentType,
        avatarUrl: contract.worker.avatarUrl,
        status: contract.status,
        monthlySalary: contract.monthlySalary,
        startDate: contract.startDate
      }));

      res.json({
        success: true,
        data: team,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Get analytics data for the business
  async getAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const businessProfile = await prisma.businessProfile.findUnique({
        where: { userId }
      });

      if (!businessProfile) {
        return res.status(404).json({ success: false, error: { message: 'Business profile not found' } });
      }

      // Revenue data from payrolls
      const payrolls = await prisma.payroll.findMany({
        where: { contract: { businessId: businessProfile.id }, status: 'PAID' },
        orderBy: { periodEnd: 'desc' }
      });

      const totalRevenue = payrolls.reduce((sum, p) => sum + p.totalAmount, 0);

      // Projects completed
      const contracts = await prisma.contract.findMany({
        where: { businessId: businessProfile.id }
      });
      const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;

      // Team members with performance data
      const teamContracts = await prisma.contract.findMany({
        where: { businessId: businessProfile.id, status: 'ACTIVE' },
        include: {
          worker: {
            include: { freelancerProfile: true }
          }
        }
      });

      // Attendance rate per worker
      const topPerformers = await Promise.all(
        teamContracts.map(async (c) => {
          const totalAtt = await prisma.attendance.count({ where: { workerId: c.workerId } });
          const presentAtt = await prisma.attendance.count({
            where: { workerId: c.workerId, status: { in: ['PRESENT', 'present'] } }
          });
          const score = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;
          return {
            name: `${c.worker.firstName} ${c.worker.lastName}`,
            role: c.worker.freelancerProfile?.title || c.employmentType,
            avatarUrl: c.worker.avatarUrl,
            score
          };
        })
      );

      topPerformers.sort((a, b) => b.score - a.score);

      // Monthly revenue breakdown (last 12 months)
      const monthlyRevenue: number[] = new Array(12).fill(0);
      payrolls.forEach(p => {
        const month = new Date(p.periodEnd).getMonth();
        monthlyRevenue[month] += p.totalAmount;
      });

      // Tasks overview
      const tasks = await prisma.task.findMany({
        where: { businessId: businessProfile.id }
      });
      const completedTasks = tasks.filter(t => t.status === 'DONE').length;

      // Hours tracked
      const workerIds = teamContracts.map(c => c.workerId);
      const attendances = await prisma.attendance.findMany({
        where: { workerId: { in: workerIds }, clockIn: { not: null }, clockOut: { not: null } }
      });
      let totalHours = 0;
      attendances.forEach(a => {
        if (a.clockIn && a.clockOut) {
          totalHours += (a.clockOut.getTime() - a.clockIn.getTime()) / 3600000;
        }
      });

      res.json({
        success: true,
        data: {
          kpis: [
            { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+0%', up: true },
            { label: 'Active Contracts', value: activeContracts.toString(), change: '+0', up: true },
            { label: 'Tasks Completed', value: `${completedTasks}/${tasks.length}`, change: '+0%', up: true },
            { label: 'Hours Tracked', value: `${Math.round(totalHours)}h`, change: '+0%', up: true },
          ],
          monthlyRevenue,
          topPerformers: topPerformers.slice(0, 5)
        }
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
