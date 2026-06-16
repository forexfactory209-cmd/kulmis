import { Request, Response } from 'express';
import { ProposalService } from '../services/proposal.service';
import { NotificationService } from '../services/notification.service';
import { prisma } from '../lib/prisma';

const proposalService = new ProposalService();
const notifService = new NotificationService();

export class ProposalController {
  async create(req: Request, res: Response) {
    try {
      const profile = await prisma.freelancerProfile.findUnique({ where: { userId: req.user!.userId } });
      if (!profile) return res.status(404).json({ success: false, error: { message: 'Freelancer profile not found' } });
      
      const proposal = await proposalService.createProposal({
        freelancerId: profile.id,
        ...req.body,
      });

      // Notify the project owner that a new proposal was submitted
      try {
        const project = await prisma.project.findUnique({ where: { id: req.body.projectId } });
        if (project) {
          await notifService.triggerNotification({
            userId: project.clientId,
            title: 'New Proposal Received',
            content: `A freelancer submitted a proposal for "${project.title}"`,
            type: `PROPOSAL|${project.id}`,
          });
        }
      } catch (notifErr) {
        console.warn('Failed to send proposal notification:', notifErr);
      }

      res.status(201).json({ success: true, data: proposal, message: 'Proposal submitted' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getProjectProposals(req: Request, res: Response) {
    try {
      const proposals = await proposalService.getProjectProposals(req.params.projectId as string);
      res.json({ success: true, data: proposals });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getMyProposals(req: Request, res: Response) {
    try {
      const proposals = await proposalService.getFreelancerProposals(req.user!.userId);
      res.json({ success: true, data: proposals });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const proposal = await proposalService.acceptProposal(req.params.id as string, req.user!.userId);
      
      // Notify the freelancer that their proposal was accepted
      try {
        const fullProposal = await prisma.proposal.findUnique({
          where: { id: req.params.id as string },
          include: { freelancer: true, project: true },
        });
        if (fullProposal) {
          await notifService.triggerNotification({
            userId: fullProposal.freelancer.userId,
            title: 'Proposal Accepted! 🎉',
            content: `Your proposal for "${fullProposal.project.title}" has been accepted!`,
            type: `PROJECT|${fullProposal.projectId}`,
          });
        }
      } catch (notifErr) {
        console.warn('Failed to send accept notification:', notifErr);
      }

      res.json({ success: true, data: proposal, message: 'Proposal accepted' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const proposal = await proposalService.rejectProposal(req.params.id as string, req.user!.userId);
      
      // Notify the freelancer that their proposal was rejected
      try {
        const fullProposal = await prisma.proposal.findUnique({
          where: { id: req.params.id as string },
          include: { freelancer: true, project: true },
        });
        if (fullProposal) {
          await notifService.triggerNotification({
            userId: fullProposal.freelancer.userId,
            title: 'Proposal Update',
            content: `Your proposal for "${fullProposal.project.title}" was not selected.`,
            type: `PROPOSAL|${fullProposal.projectId}`,
          });
        }
      } catch (notifErr) {
        console.warn('Failed to send reject notification:', notifErr);
      }

      res.json({ success: true, data: proposal, message: 'Proposal rejected' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }
}
