import { prisma } from '../lib/prisma';
import { PayrollStatus } from '@prisma/client';

export class PayrollRepository {
  async getClientPayrolls(clientId: string, status?: string) {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: clientId },
    });

    if (!business) {
      throw new Error('Business profile not found');
    }

    return prisma.payroll.findMany({
      where: {
        contract: {
          businessId: business.id,
        },
        ...(status ? { status: status as PayrollStatus } : {}),
      },
      include: {
        contract: {
          include: {
            worker: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { periodStart: 'desc' },
    });
  }

  async getPayrollById(id: string) {
    return prisma.payroll.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            worker: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
            business: {
              select: { companyName: true, industry: true },
            },
          },
        },
      },
    });
  }

  async runPayroll(clientId: string, month: string) {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: clientId },
    });

    if (!business) {
      throw new Error('Business profile not found');
    }

    // Parse month (e.g., "May 2024")
    const date = new Date(Date.parse(`${month} 1`));
    if (isNaN(date.getTime())) throw new Error('Invalid month format');

    const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const activeContracts = await prisma.contract.findMany({
      where: {
        businessId: business.id,
        status: 'ACTIVE',
      },
    });

    const payrolls = [];
    for (const contract of activeContracts) {
      // Check if payroll already exists for this contract and month
      const existing = await prisma.payroll.findFirst({
        where: {
          contractId: contract.id,
          periodStart: periodStart,
        },
      });

      if (!existing) {
        const payroll = await prisma.payroll.create({
          data: {
            contractId: contract.id,
            periodStart,
            periodEnd,
            baseSalary: contract.monthlySalary,
            deductions: 0,
            bonuses: 0,
            totalAmount: contract.monthlySalary, // Base for now
            status: PayrollStatus.UNPAID,
          },
          include: {
            contract: {
              include: { worker: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
            }
          }
        });
        payrolls.push(payroll);
      }
    }
    return payrolls;
  }

  async markAsPaid(id: string) {
    return prisma.payroll.update({
      where: { id },
      data: { status: PayrollStatus.PAID },
      include: {
        contract: {
          include: { worker: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
        }
      }
    });
  }
}
