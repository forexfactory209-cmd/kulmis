import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class StaffingController {
  // Client requests to hire a freelancer on a retainer
  async requestStaffing(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const { freelancerId, workerRate, platformFee } = req.body;

      if (!freelancerId || !workerRate || !platformFee) {
        return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
      }

      const totalRate = Number(workerRate) + Number(platformFee);

      const contract = await prisma.retainerContract.create({
        data: {
          clientId,
          freelancerId,
          monthlyRate: totalRate,
          workerRate: Number(workerRate),
          platformFee: Number(platformFee),
          status: 'PENDING_ADMIN_REVIEW'
        }
      });

      res.json({ success: true, data: contract });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Get contracts for a user (Client or Freelancer)
  async getMyContracts(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;

      const whereClause = role === 'CLIENT' ? { clientId: userId } : { freelancerId: userId };

      const contracts = await prisma.retainerContract.findMany({
        where: whereClause,
        include: {
          client: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          freelancer: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          payrollCycles: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: contracts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Freelancer accepts the contract
  async freelancerAcceptContract(req: Request, res: Response) {
    try {
      const freelancerId = req.user!.userId;
      const id = req.params.id as string;

      const contract = await prisma.retainerContract.findFirst({
        where: { id, freelancerId }
      });

      if (!contract) {
        return res.status(404).json({ success: false, error: { message: 'Contract not found' } });
      }

      if (contract.status !== 'PENDING_FREELANCER_APPROVAL') {
        return res.status(400).json({ success: false, error: { message: 'Contract is not pending your approval' } });
      }

      const updatedContract = await prisma.retainerContract.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          startDate: new Date()
        }
      });

      res.json({ success: true, data: updatedContract, message: 'Contract accepted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Admin endpoints
  async getAllContracts(req: Request, res: Response) {
    try {
      const contracts = await prisma.retainerContract.findMany({
        include: {
          client: { select: { firstName: true, lastName: true, email: true } },
          freelancer: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: contracts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async adminApproveContract(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const contract = await prisma.retainerContract.findUnique({
        where: { id }
      });

      if (!contract) {
        return res.status(404).json({ success: false, error: { message: 'Contract not found' } });
      }

      const updatedContract = await prisma.retainerContract.update({
        where: { id },
        data: {
          status: 'PENDING_FREELANCER_APPROVAL'
        }
      });

      res.json({ success: true, data: updatedContract, message: 'Contract sent to freelancer for approval' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
