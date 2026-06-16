import { prisma } from '../lib/prisma';

export class ReportRepository {
  async findByUser(userId: string) {
    return prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { userId: string; title: string; type: string; size: string }) {
    return prisma.report.create({ data });
  }

  async delete(id: string) {
    return prisma.report.delete({ where: { id } });
  }
}
