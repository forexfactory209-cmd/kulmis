import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { NotificationService } from '../services/notification.service';

const notifService = new NotificationService();

export class ProjectInteractionController {
  async uploadFile(req: Request, res: Response) {
    try {
      const projectId = req.params.id as string;
      const uploaderId = req.user!.userId;
      const { name, fileUrl } = req.body;

      if (!name || !fileUrl) {
        return res.status(400).json({ success: false, error: { message: 'Missing name or fileUrl' } });
      }

      const file = await prisma.projectFile.create({
        data: { projectId, uploaderId, name, fileUrl }
      });

      await prisma.projectActivity.create({
        data: {
          projectId,
          content: `New file uploaded: ${name}`,
          description: `Uploaded file URL: ${fileUrl}`
        } as any
      });

      res.status(201).json({ success: true, data: file });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async addDiscussion(req: Request, res: Response) {
    try {
      const projectId = req.params.id as string;
      const authorId = req.user!.userId;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ success: false, error: { message: 'Content is required' } });
      }

      const discussion = await prisma.projectDiscussion.create({
        data: { projectId, authorId, content },
        include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
      });

      await prisma.projectActivity.create({
        data: {
          projectId,
          content: `${(discussion as any).author.firstName} posted a new discussion comment.`,
          description: content
        } as any
      });

      // Fetch project + accepted invitation to find who to notify
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { invitations: { where: { status: 'ACCEPTED' } } }
      });

      if (project) {
        const inv = (project as any).invitations?.[0];
        const targetUserId = project.clientId === authorId
          ? inv?.freelancerId
          : project.clientId;

        if (targetUserId) {
          await notifService.triggerNotification({
            userId: targetUserId,
            title: 'New Discussion Message',
            content: `You have a new message on project: ${project.title}`,
            type: `PROJECT|${project.id}`
          });
        }
      }

      res.status(201).json({ success: true, data: discussion });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async submitStep(req: Request, res: Response) {
    try {
      const projectId = req.params.id as string;
      const stepId = req.params.stepId as string;

      const step = await prisma.projectProgressStep.update({
        where: { id: stepId },
        data: { status: 'COMPLETED' }
      });

      const project = await prisma.project.findUnique({ where: { id: projectId } });

      await prisma.projectActivity.create({
        data: {
          projectId,
          content: `Milestone submitted for review: ${step.name}`,
          description: req.body.message || req.body.submissionMessage || req.body.notes || 'No description provided.'
        } as any
      });

      if (project) {
        await notifService.triggerNotification({
          userId: project.clientId,
          title: 'Milestone Submitted',
          content: `A milestone has been submitted for review on project: ${project.title}`,
          type: `PROJECT|${project.id}`
        });
      }

      res.json({ success: true, data: step });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async requestRevision(req: Request, res: Response) {
    try {
      const projectId = req.params.id as string;
      const stepId = req.params.stepId as string;
      const authorId = req.user!.userId;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ success: false, error: { message: 'Revision content is required' } });
      }

      // 1. Revert step status to IN_PROGRESS
      const step = await prisma.projectProgressStep.update({
        where: { id: stepId },
        data: { status: 'IN_PROGRESS' }
      });

      // 2. Add revision comment
      const revision = await prisma.projectStepRevision.create({
        data: { stepId, authorId, content },
        include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
      });

      await prisma.projectActivity.create({
        data: {
          projectId,
          content: `Revision requested on milestone: ${step.name}`,
          description: content
        } as any
      });

      // 3. Notify Freelancer
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { invitations: { where: { status: 'ACCEPTED' } } }
      });

      const inv = (project as any)?.invitations?.[0];
      if (project && inv) {
        await notifService.triggerNotification({
          userId: inv.freelancerId,
          title: 'Revision Requested',
          content: `Changes were requested on milestone: ${step.name}`,
          type: `PROJECT|${project.id}`
        });
      }

      res.status(201).json({ success: true, data: revision });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
