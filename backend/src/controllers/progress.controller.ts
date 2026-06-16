import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { NotificationRepository } from '../repositories/notification.repository';

const notifyClient = async (userId: string, title: string, content: string) => {
  const repo = new NotificationRepository();
  try {
    await repo.create({ userId, title, content, type: 'PROJECT_UPDATE' });
  } catch (e) {
    console.error('Failed to send notification', e);
  }
};

const getFreelancerProfile = async (userId: string) => {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
  });
  if (!profile) throw new Error('Freelancer profile not found');
  return profile;
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const profile = await getFreelancerProfile(req.user!.userId);
    const templates = await prisma.progressTemplate.findMany({
      where: { freelancerId: profile.id },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, category, steps } = req.body;
    const profile = await getFreelancerProfile(req.user!.userId);
    
    const template = await prisma.progressTemplate.create({
      data: {
        freelancerId: profile.id,
        name,
        category,
        steps: {
          create: steps.map((step: any, idx: number) => ({
            name: step.name,
            orderIndex: idx,
          })),
        },
      },
      include: { steps: true },
    });
    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, category, steps } = req.body;
    const profile = await getFreelancerProfile(req.user!.userId);

    // Verify ownership
    const existing = await prisma.progressTemplate.findFirst({ where: { id, freelancerId: profile.id } });
    if (!existing) return res.status(404).json({ success: false, error: { message: 'Template not found' } });

    // Update steps by replacing them
    await prisma.progressTemplateStep.deleteMany({ where: { templateId: id } });
    
    const updated = await prisma.progressTemplate.update({
      where: { id },
      data: {
        name,
        category,
        steps: {
          create: steps.map((step: any, idx: number) => ({
            name: step.name,
            orderIndex: idx,
          })),
        },
      },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const profile = await getFreelancerProfile(req.user!.userId);
    await prisma.progressTemplate.deleteMany({
      where: { id, freelancerId: profile.id },
    });
    res.json({ success: true, message: 'Template deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const suggestSteps = async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string || '').toLowerCase();
    
    const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
      'web': ['Requirement Gathering', 'Wireframing & UI/UX Design', 'Frontend Development', 'Backend API Integration', 'Testing & QA', 'Deployment'],
      'design': ['Concept Creation', 'Drafting & Sketching', 'Digital Rendering', 'Client Feedback & Revision', 'Final Polish & Export'],
      'writing': ['Topic Research', 'Outline Creation', 'First Draft', 'Editing & Proofreading', 'Final Submission'],
      'seo': ['Website Audit', 'Keyword Research', 'On-Page Optimization', 'Off-Page Link Building', 'Performance Reporting'],
      'mobile': ['UI Prototyping', 'App Architecture', 'Feature Implementation', 'API Integration', 'Beta Testing', 'App Store Submission'],
    };

    let matchedSteps = ['Phase 1', 'Phase 2', 'Phase 3'];
    for (const [key, steps] of Object.entries(DEFAULT_SUGGESTIONS)) {
      if (category.includes(key)) {
        matchedSteps = steps;
        break;
      }
    }

    res.json({ success: true, data: matchedSteps });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const acceptJob = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id as string;
    const { templateId } = req.body;
    
    // Validate project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { proposals: true },
    });
    if (!project) return res.status(404).json({ success: false, error: { message: 'Project not found' } });
    
    const profile = await getFreelancerProfile(req.user!.userId);
    
    // Ensure freelancer has an accepted proposal for this project
    const hasAcceptedProposal = project.proposals.some((p: any) => p.freelancerId === profile.id && p.status === 'ACCEPTED');
    if (!hasAcceptedProposal) {
      return res.status(403).json({ success: false, error: { message: 'You do not have an accepted proposal for this project' } });
    }

    // Get template
    const template = await prisma.progressTemplate.findUnique({
      where: { id: templateId },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!template || template.freelancerId !== profile.id) {
      return res.status(400).json({ success: false, error: { message: 'Invalid template' } });
    }

    // Calculate budget per step
    const stepCount = template.steps.length || 1;
    const pricePerStep = Number(project.budget) / stepCount;

    // Create JSON milestones for the frontend fallback
    const jsonMilestones = template.steps.map((s) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: s.name,
      status: s.orderIndex === 0 ? 'In Progress' : 'Pending',
      price: pricePerStep,
    }));

    // Set project status to IN_PROGRESS and create steps
    await prisma.$transaction(async (tx) => {
      // 1. Create DB progress steps
      await tx.projectProgressStep.createMany({
        data: template.steps.map((s) => ({
          projectId: projectId,
          name: s.name,
          orderIndex: s.orderIndex,
          status: 'PENDING' as const,
        })),
      });
    });

    // 2. Update project status and metadata via ProjectService
    const { ProjectService } = await import('../services/project.service');
    const projectService = new ProjectService();
    await projectService.updateProject(projectId, project.clientId, {
      status: 'IN_PROGRESS',
      isPlanSubmitted: true,
      milestones: jsonMilestones,
      timeline: [
        {
          title: 'Project Plan Accepted',
          time: new Date().toISOString(),
          desc: `Freelancer accepted the project using template: "${template.name}".`,
        },
        ...(project as any).timeline || []
      ]
    });

    // Notify Client
    await notifyClient(
      project.clientId,
      'Job Accepted & Progress Steps Defined',
      `A freelancer has accepted the job for "${project.title}" and set up progress tracking steps.`
    );

    res.json({ success: true, message: 'Job accepted and steps defined' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const submitStep = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const stepId = req.params.stepId as string;
    const { message, fileUrl } = req.body;
    const profile = await getFreelancerProfile(req.user!.userId);

    const project = await prisma.project.findFirst({
      where: { 
        id: projectId, 
        OR: [
          { proposals: { some: { freelancerId: profile.id, status: 'ACCEPTED' } } },
          { invitations: { some: { freelancerId: req.user!.userId, status: 'ACCEPTED' } } }
        ]
      },
      include: { progressSteps: true },
    });

    if (!project) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const step = project.progressSteps.find((s: any) => s.id === stepId);
    if (!step) return res.status(404).json({ success: false, error: { message: 'Step not found' } });

    await prisma.projectProgressStep.update({
      where: { id: stepId },
      data: { 
        status: 'IN_REVIEW',
        submissionMsg: message || null,
        submissionUrl: fileUrl || null
      },
    });

    // Notify Client
    await notifyClient(
      project.clientId,
      'Work Submitted for Review',
      `Freelancer submitted work for step "${step.name}" on project "${project.title}".`
    );

    res.json({ success: true, message: 'Step submitted for review' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const approveStep = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const stepId = req.params.stepId as string;

    const project = await prisma.project.findFirst({
      where: { id: projectId, clientId: req.user!.userId },
      include: { progressSteps: true },
    });

    if (!project) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const step = project.progressSteps.find((s: any) => s.id === stepId);
    if (!step) return res.status(404).json({ success: false, error: { message: 'Step not found' } });

    await prisma.projectProgressStep.update({
      where: { id: stepId },
      data: { status: 'COMPLETED' },
    });

    // Check if all steps are now completed
    const allSteps = await prisma.projectProgressStep.findMany({
      where: { projectId }
    });
    const allCompleted = allSteps.every((s: any) => s.status === 'COMPLETED');

    if (allCompleted) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' }
      });
    }

    // Notify Freelancer
    const acceptedProposal = await prisma.proposal.findFirst({
      where: { projectId, status: 'ACCEPTED' },
      include: { freelancer: { include: { user: true } } }
    });

    const acceptedInvitation = await prisma.projectInvitation.findFirst({
      where: { projectId, status: 'ACCEPTED' }
    });
    
    const targetUserId = acceptedProposal?.freelancer.user.id || acceptedInvitation?.freelancerId;
    
    if (targetUserId) {
      const repo = new NotificationRepository();
      try {
        await repo.create({ 
          userId: targetUserId, 
          title: 'Step Approved', 
          content: `Your work for step "${step.name}" has been approved!`, 
          type: `PROJECT|${projectId}` 
        });
      } catch (e) {
        console.error('Failed to send notification', e);
      }
    }

    res.json({ success: true, message: 'Step approved successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const getProjectProgress = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const steps = await prisma.projectProgressStep.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });
    res.json({ success: true, data: steps });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
