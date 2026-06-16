import { prisma } from '../lib/prisma';
import { ContractStatus } from '@prisma/client';

export class ContractRepository {
  async getClientContracts(clientId: string, status?: string, page = 1, limit = 20) {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: clientId },
    });

    if (!business) {
      throw new Error('Business profile not found');
    }

    const where = {
      businessId: business.id,
      ...(status ? { status: status as ContractStatus } : {}),
    };

    const skip = (page - 1) * limit;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          worker: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return {
      data: contracts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContractById(id: string) {
    return prisma.contract.findUnique({
      where: { id },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        business: {
          select: { companyName: true, industry: true },
        },
      },
    });
  }

  async createContract(clientId: string, data: {
    workerId: string;
    employmentType: string;
    monthlySalary: number;
    schedule: string;
    startDate: Date;
  }) {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: clientId },
    });

    if (!business) {
      throw new Error('Business profile not found');
    }

    return prisma.contract.create({
      data: {
        businessId: business.id,
        workerId: data.workerId,
        employmentType: data.employmentType,
        monthlySalary: data.monthlySalary,
        platformFee: data.monthlySalary * 0.1, // 10% platform fee
        status: ContractStatus.ACTIVE,
        schedule: data.schedule,
        startDate: data.startDate,
      },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
      },
    });
  }
}
