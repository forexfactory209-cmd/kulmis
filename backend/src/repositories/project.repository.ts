import { prisma } from '../lib/prisma';

export class ProjectRepository {
  async create(data: {
    clientId: string;
    title: string;
    description: string;
    budget: number;
    category?: string;
    deadline?: Date;
  }) {
    return prisma.project.create({
      data,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { proposals: true } },
      },
    });
  }

  async findAll(filters: {
    status?: string;
    category?: string;
    search?: string;
    clientId?: string;
    freelancerUserId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, category, search, clientId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (category) where.category = { contains: category };
    if (clientId) where.clientId = clientId;

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ]
      });
    }

    if (filters.freelancerUserId) {
      andConditions.push({
        OR: [
          {
            proposals: {
              some: {
                freelancer: { userId: filters.freelancerUserId },
                status: 'ACCEPTED'
              }
            }
          },
          {
            invitations: {
              some: {
                freelancerId: filters.freelancerUserId,
                status: 'ACCEPTED'
              }
            }
          }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { proposals: true } },
          progressSteps: {
            include: { revisions: { include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
            orderBy: { orderIndex: 'asc' }
          },
          activities: {
            orderBy: { createdAt: 'desc' }
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects: projects.map((p: any) => this.parseProjectMetadata(p)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  parseProjectMetadata(project: any) {
    if (!project) return null;
    let cleanDescription = project.description;
    let progress = 0;
    let milestones: any[] = [];
    let timeline: any[] = [];
    let files: any[] = [];
    let isPlanSubmitted = false;

    if (project.description && project.description.includes('---METADATA---')) {
      const parts = project.description.split('---METADATA---');
      cleanDescription = parts[0].trim();
      try {
        const metadata = JSON.parse(parts[1].trim());
        progress = metadata.progress || 0;
        milestones = metadata.milestones || [];
        timeline = metadata.timeline || [];
        files = metadata.files || [];
        isPlanSubmitted = metadata.isPlanSubmitted || false;
      } catch (e) {
        console.error('Failed to parse project metadata JSON', e);
      }
    }

    const isMock = !project.id || !isNaN(Number(project.id)) || String(project.id).startsWith('proj_') || String(project.id).startsWith('p');
    if (isMock) {
      isPlanSubmitted = true;
    }

    // Use actual progress steps if they exist in the project include
    if (project.progressSteps && project.progressSteps.length > 0) {
      milestones = project.progressSteps.map((step: any) => {
        let mappedStatus = 'Pending';
        if (step.status === 'COMPLETED') mappedStatus = 'Completed';
        else if (step.status === 'IN_PROGRESS') {
          mappedStatus = step.revisions && step.revisions.length > 0 ? 'Revision Requested' : 'In Progress';
        }
        else if (step.status === 'IN_REVIEW') mappedStatus = 'In Review';
        
        // If the step is IN_PROGRESS and has revisions, it means a revision was requested
        const latestRevision = step.revisions && step.revisions.length > 0
          ? step.revisions[step.revisions.length - 1]
          : null;

        return {
          id: step.id,
          title: step.name,
          status: mappedStatus,
          price: Number(project.budget) / project.progressSteps.length,
          submissionMessage: step.submissionMsg || null,
          submissionUrl: step.submissionUrl || null,
          feedback: latestRevision?.content || null,
          feedbackAuthor: latestRevision?.author
            ? `${latestRevision.author.firstName} ${latestRevision.author.lastName}`
            : null,
          feedbackDate: latestRevision?.createdAt || null,
          revisions: (step.revisions || []).map((r: any) => ({
            id: r.id,
            content: r.content,
            author: r.author ? `${r.author.firstName} ${r.author.lastName}` : 'Unknown',
            createdAt: r.createdAt,
          })),
        };
      });

      // Build timeline from revision & activity history
      if (project.activities && project.activities.length > 0) {
        timeline = project.activities.map((a: any) => ({
          title: a.content,
          time: a.createdAt ? a.createdAt.toISOString() : new Date().toISOString(),
          desc: a.description || '',
        }));
      }
    } else if (milestones.length === 0 && (project.status === 'IN_PROGRESS' || project.status === 'COMPLETED')) {
      // Fallback/Default metadata if empty (for in-progress or completed projects)
      milestones = [
        { id: '1', title: 'Concept & Brief', status: project.status === 'COMPLETED' ? 'Completed' : 'Completed', price: Number(project.budget) * 0.2 },
        { id: '2', title: 'Initial Draft & Wireframes', status: project.status === 'COMPLETED' ? 'Completed' : 'Pending', price: Number(project.budget) * 0.4 },
        { id: '3', title: 'UI Design & Prototyping', status: project.status === 'COMPLETED' ? 'Completed' : 'Pending', price: Number(project.budget) * 0.3 },
        { id: '4', title: 'Final Delivery', status: project.status === 'COMPLETED' ? 'Completed' : 'Pending', price: Number(project.budget) * 0.1 },
      ];
      timeline = [
        { title: 'Contract Initiated', time: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(), desc: 'Client and Freelancer successfully connected for the project.' },
        { title: 'Escrow Deposited', time: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(), desc: 'Client funded the project balance into Somlance Secure Escrow.' },
      ];
      files = [
        { name: 'Brand_Briefing.pdf', size: '1.8 MB', type: 'client', url: 'https://somlance-assets.s3.amazonaws.com/brief.pdf' }
      ];
    }

    // Dynamic Progress Calculation
    if (project.status === 'COMPLETED') {
      progress = 100;
    } else if (project.status === 'IN_PROGRESS') {
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter((m: any) => m.status === 'Completed').length;
        progress = Math.round((completed / milestones.length) * 100);
      } else {
        progress = 0;
      }
    } else {
      progress = 0; // OPEN, CANCELED, etc.
    }

    return {
      ...project,
      description: cleanDescription,
      progress,
      milestones,
      timeline,
      files,
      isPlanSubmitted,
    };
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        proposals: {
          include: {
            freelancer: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        invitations: {
          include: {
            freelancer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          }
        },
        escrow: true,
        progressSteps: {
          include: { revisions: { include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
          orderBy: { orderIndex: 'asc' }
        },
        files: {
          include: { uploader: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' }
        },
        discussions: {
          include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        reviews: { include: { reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        _count: { select: { proposals: true } },
      },
    });
    return this.parseProjectMetadata(project);
  }

  async update(id: string, data: any) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new Error('Project not found');

    let cleanDescription = existing.description;
    if (existing.description.includes('---METADATA---')) {
      cleanDescription = existing.description.split('---METADATA---')[0].trim();
    }

    let progress = data.progress;
    let milestones = data.milestones;
    let timeline = data.timeline;
    let files = data.files;
    let isPlanSubmitted = data.isPlanSubmitted;

    if (data.description !== undefined) {
      cleanDescription = data.description;
    }

    const hasMetadata = progress !== undefined || milestones !== undefined || timeline !== undefined || files !== undefined || isPlanSubmitted !== undefined;
    let finalDescription = cleanDescription;
    
    if (existing.description.includes('---METADATA---') || hasMetadata) {
      const metadata = {
        progress: progress || 0,
        milestones: milestones || [],
        timeline: timeline || [],
        files: files || [],
        isPlanSubmitted: isPlanSubmitted || false
      };
      
      try {
        if (existing.description.includes('---METADATA---')) {
          const oldMetadata = JSON.parse(existing.description.split('---METADATA---')[1].trim());
          if (progress === undefined) metadata.progress = oldMetadata.progress || 0;
          if (milestones === undefined) metadata.milestones = oldMetadata.milestones || [];
          if (timeline === undefined) metadata.timeline = oldMetadata.timeline || [];
          if (files === undefined) metadata.files = oldMetadata.files || [];
          if (isPlanSubmitted === undefined) metadata.isPlanSubmitted = oldMetadata.isPlanSubmitted || false;
        }
      } catch (e) {}

      finalDescription = `${cleanDescription}\n\n---METADATA---\n${JSON.stringify(metadata)}`;
    }

    const prismaUpdateData: any = {};
    if (data.status) prismaUpdateData.status = data.status;
    if (data.title) prismaUpdateData.title = data.title;
    if (data.budget !== undefined) prismaUpdateData.budget = Number(data.budget);
    if (data.category) prismaUpdateData.category = data.category;
    if (data.deadline) prismaUpdateData.deadline = new Date(data.deadline);
    
    prismaUpdateData.description = finalDescription;

    const updated = await prisma.project.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { proposals: true } },
      },
    });

    return this.parseProjectMetadata(updated);
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx: any) => {
      // Manually delete related records to simulate CASCADE
      await tx.proposal.deleteMany({ where: { projectId: id } });
      await tx.projectInvitation.deleteMany({ where: { projectId: id } });
      await tx.review.deleteMany({ where: { projectId: id } });
      await tx.dispute.deleteMany({ where: { projectId: id } });
      
      const escrow = await tx.escrowPayment.findUnique({ where: { projectId: id } });
      if (escrow) {
        await tx.escrowPayment.delete({ where: { id: escrow.id } });
      }

      await tx.projectProgressStep.deleteMany({ where: { projectId: id } });
      await tx.projectFile.deleteMany({ where: { projectId: id } });
      await tx.projectDiscussion.deleteMany({ where: { projectId: id } });
      await tx.projectActivity.deleteMany({ where: { projectId: id } });

      return tx.project.delete({
        where: { id }
      });
    });
  }
}
