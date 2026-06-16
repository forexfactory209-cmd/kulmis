import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { NotificationService } from '../services/notification.service';

const notifService = new NotificationService();

export class InvitationController {
  async inviteFreelancer(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const { freelancerId, projectId, jobType, paymentAmount, message } = req.body;

      if (!freelancerId) {
        return res.status(400).json({ success: false, error: { message: 'Freelancer ID is required' } });
      }

      // Get business name for notification
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        include: { businessProfile: true }
      });

      const invitation = await prisma.projectInvitation.create({
        data: {
          clientId,
          freelancerId,
          projectId: projectId || null,
          jobType: jobType || null,
          paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
          message: message || null
        }
      });

      // Send real-time notification to the freelancer
      const businessName = client?.businessProfile?.companyName || `${client?.firstName} ${client?.lastName}`;
      const jobLabel = jobType === 'MONTHLY_WORKER' ? 'Monthly Retainer' : 'Project';
      await notifService.triggerNotification({
        userId: freelancerId,
        title: `New Invitation from ${businessName}`,
        content: message
          ? `"${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`
          : `You've been invited for a ${jobLabel} opportunity.`,
        type: `INVITATION|${invitation.id}`
      });

      res.status(201).json({ success: true, data: invitation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getMyInvitationsAsClient(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const { status } = req.query;

      const where: any = { clientId };
      if (status && status !== 'All') {
        where.status = status;
      }

      const invitations = await prisma.projectInvitation.findMany({
        where,
        include: {
          freelancer: {
            include: {
              freelancerProfile: true
            }
          },
          project: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: invitations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getMyInvitationsAsFreelancer(req: Request, res: Response) {
    try {
      const freelancerId = req.user!.userId;

      const invitations = await prisma.projectInvitation.findMany({
        where: { freelancerId },
        include: {
          client: {
            include: {
              businessProfile: true,
              clientProfile: true
            }
          },
          project: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: invitations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getInvitationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: id as string },
        include: {
          client: { include: { businessProfile: true } },
          freelancer: { include: { freelancerProfile: true } },
          project: true
        }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
      }

      // Ensure only the client or freelancer involved can view it
      if (invitation.clientId !== userId && invitation.freelancerId !== userId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }

      res.json({ success: true, data: invitation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateInvitationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const invitation = await prisma.projectInvitation.update({
        where: { id: id as string },
        data: { status }
      });

      res.json({ success: true, data: invitation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async acceptInvitation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const freelancerId = req.user!.userId;

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: id as string },
        include: { client: { include: { businessProfile: true } }, freelancer: true }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
      }
      if (invitation.freelancerId !== freelancerId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }

      let projectId = invitation.projectId;

      if (!projectId) {
        const project = await prisma.project.create({
          data: {
            clientId: invitation.clientId,
            title: `${invitation.jobType === 'MONTHLY_WORKER' ? 'Monthly Retainer' : 'Project'} with ${invitation.client.businessProfile?.companyName || 'Business'}`,
            description: invitation.message || 'No description provided.',
            budget: invitation.paymentAmount || 0,
            status: 'OPEN',
            category: invitation.jobType === 'MONTHLY_WORKER' ? 'Retainer' : 'General',
          }
        });
        projectId = project.id;
      }

      const updatedInvitation = await prisma.projectInvitation.update({
        where: { id: id as string },
        data: { status: 'ACCEPTED', projectId }
      });

      // If monthly worker, create a Contract automatically
      if (invitation.jobType === 'MONTHLY_WORKER' && invitation.client.businessProfile) {
        await prisma.contract.create({
          data: {
            businessId: invitation.client.businessProfile.id,
            workerId: freelancerId,
            employmentType: 'MONTHLY',
            monthlySalary: invitation.paymentAmount || 0,
            platformFee: 0,
            status: 'ACTIVE',
            schedule: 'Full-time',
            startDate: new Date(),
          }
        });
      }

      // Notify the business client that the freelancer accepted
      const freelancerName = `${invitation.freelancer.firstName} ${invitation.freelancer.lastName}`;
      await notifService.triggerNotification({
        userId: invitation.clientId,
        title: `${freelancerName} Accepted Your Invitation`,
        content: `Great news! ${freelancerName} has accepted your ${invitation.jobType === 'MONTHLY_WORKER' ? 'Monthly Retainer' : 'Project'} invitation.`,
        type: `INVITATION_ACCEPTED|${invitation.id}`
      });

      res.json({ success: true, data: updatedInvitation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async rejectInvitation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const freelancerId = req.user!.userId;

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: id as string },
        include: { freelancer: true }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
      }
      if (invitation.freelancerId !== freelancerId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const updatedInvitation = await prisma.projectInvitation.update({
        where: { id: id as string },
        data: { status: 'REJECTED' }
      });

      // Notify the business client that the freelancer rejected
      const freelancerName = `${invitation.freelancer.firstName} ${invitation.freelancer.lastName}`;
      await notifService.triggerNotification({
        userId: invitation.clientId,
        title: `${freelancerName} Declined Your Invitation`,
        content: `${freelancerName} has declined your invitation. You can send another invitation to a different freelancer.`,
        type: `INVITATION_REJECTED|${invitation.id}`
      });

      res.json({ success: true, data: updatedInvitation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Business retracts a PENDING or REJECTED invitation (also deletes the freelancer's notification)
  async deleteInvitation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clientId = req.user!.userId;

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: id as string }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
      }
      if (invitation.clientId !== clientId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }
      if (invitation.status === 'ACCEPTED') {
        return res.status(400).json({ success: false, error: { message: 'Cannot retract an accepted invitation. Use "Remove Worker" instead.' } });
      }

      // Delete associated notification from the freelancer's feed
      await prisma.notification.deleteMany({
        where: {
          userId: invitation.freelancerId,
          type: { startsWith: `INVITATION|${invitation.id}` }
        }
      });

      // Delete the invitation
      await prisma.projectInvitation.delete({ where: { id: id as string } });

      res.json({ success: true, message: 'Invitation retracted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Business terminates an accepted worker (deletes the contract)
  async removeWorker(req: Request, res: Response) {
    try {
      const { id } = req.params; // This is the invitation ID
      const clientId = req.user!.userId;

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: id as string },
        include: { client: { include: { businessProfile: true } }, freelancer: true }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
      }
      if (invitation.clientId !== clientId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }
      if (invitation.status !== 'ACCEPTED') {
        return res.status(400).json({ success: false, error: { message: 'Invitation is not accepted' } });
      }

      // Terminate the active contract (if any)
      if (invitation.client.businessProfile) {
        await prisma.contract.deleteMany({
          where: {
            businessId: invitation.client.businessProfile.id,
            workerId: invitation.freelancerId
          }
        });
      }

      // Delete the invitation itself
      await prisma.projectInvitation.delete({ where: { id: id as string } });

      // Notify the freelancer they've been removed
      const businessName = invitation.client.businessProfile?.companyName || clientId;
      await notifService.triggerNotification({
        userId: invitation.freelancerId,
        title: 'Contract Terminated',
        content: `Your contract with ${businessName} has been terminated. This business has been removed from your workspace.`,
        type: `CONTRACT_TERMINATED|${invitation.clientId}`
      });

      res.json({ success: true, message: 'Worker removed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Freelancer withdraws from an accepted invitation (terminate from their side)
  async withdrawFromBusiness(req: Request, res: Response) {
    try {
      const { id } = req.params; // Invitation ID
      const freelancerId = req.user!.userId;

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: id as string },
        include: { client: { include: { businessProfile: true } }, freelancer: true }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
      }
      if (invitation.freelancerId !== freelancerId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }
      if (invitation.status !== 'ACCEPTED') {
        return res.status(400).json({ success: false, error: { message: 'You can only withdraw from an accepted invitation' } });
      }

      // Terminate the contract
      if (invitation.client.businessProfile) {
        await prisma.contract.deleteMany({
          where: {
            businessId: invitation.client.businessProfile.id,
            workerId: freelancerId
          }
        });
      }

      // Delete the invitation so business disappears from their workspace
      await prisma.projectInvitation.delete({ where: { id: id as string } });

      // Notify the business
      const freelancerName = `${invitation.freelancer.firstName} ${invitation.freelancer.lastName}`;
      await notifService.triggerNotification({
        userId: invitation.clientId,
        title: `${freelancerName} Withdrew from Contract`,
        content: `${freelancerName} has withdrawn from their contract with you.`,
        type: `CONTRACT_WITHDRAWN|${freelancerId}`
      });

      res.json({ success: true, message: 'Successfully withdrawn from business' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
