import { prisma } from '../lib/prisma';

export class AttendanceRepository {
  async getClientAttendances(clientId: string, date?: string) {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: clientId },
    });

    if (!business) {
      throw new Error('Business profile not found');
    }

    // First find all workers associated with this business through contracts
    const contracts = await prisma.contract.findMany({
      where: { businessId: business.id },
      select: { workerId: true },
    });
    
    const workerIds = contracts.map(c => c.workerId);

    // If date is provided, parse it, otherwise get all records (or just default to today?)
    // For now we'll just return all attendances for these workers, optionally filtered by date string
    const whereClause: any = {
      workerId: { in: workerIds },
    };

    if (date) {
      // Assuming date is passed as 'YYYY-MM-DD'
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return prisma.attendance.findMany({
      where: whereClause,
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async clockIn(workerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        workerId,
        date: { gte: today }
      }
    });

    if (existing) {
      throw new Error('Already clocked in today');
    }

    return prisma.attendance.create({
      data: {
        workerId,
        date: new Date(),
        clockIn: new Date(),
        status: 'PRESENT',
      }
    });
  }

  async clockOut(workerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        workerId,
        date: { gte: today }
      }
    });

    if (!existing || existing.clockOut) {
      throw new Error('Not clocked in or already clocked out');
    }

    // Calculate hours worked
    const clockInTime = existing.clockIn?.getTime() || 0;
    const clockOutTime = new Date().getTime();
    const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    return prisma.attendance.update({
      where: { id: existing.id },
      data: {
        clockOut: new Date(),
        hoursWorked,
      }
    });
  }
}
