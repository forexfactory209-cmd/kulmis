import { ProjectRepository } from '../repositories/project.repository';

const projectRepository = new ProjectRepository();

export class ProjectService {
  async createProject(data: {
    clientId: string;
    title: string;
    description: string;
    budget: number;
    category?: string;
    deadline?: Date;
    freelancerId?: string;
  }) {
    const { freelancerId, ...projectData } = data;
    const budgetNum = Number(projectData.budget);

    if (freelancerId) {
      const { prisma } = require('../lib/prisma');
      const profile = await prisma.freelancerProfile.findFirst({
        where: {
          OR: [
            { id: freelancerId },
            { userId: freelancerId }
          ]
        }
      });

      if (!profile) {
        throw { status: 404, message: 'Freelancer profile not found' };
      }

      // Create Project, Proposal, and Escrow inside transaction
      const project = await prisma.project.create({
        data: {
          clientId: projectData.clientId,
          title: projectData.title,
          description: projectData.description,
          budget: budgetNum,
          category: projectData.category,
          deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
          status: 'IN_PROGRESS',
          proposals: {
            create: {
              freelancerId: profile.id,
              coverLetter: 'Direct contract invitation accepted.',
              bidAmount: budgetNum,
              status: 'ACCEPTED'
            }
          },
          escrow: {
            create: {
              amount: budgetNum,
              status: 'HELD'
            }
          }
        },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          proposals: {
            include: {
              freelancer: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
                }
              }
            }
          },
          escrow: true,
          _count: { select: { proposals: true } }
        }
      });

      return projectRepository.parseProjectMetadata(project);
    }

    return projectRepository.create({
      ...projectData,
      budget: budgetNum,
      deadline: projectData.deadline ? new Date(projectData.deadline) : undefined
    });
  }

  async getProjects(filters: {
    status?: string;
    category?: string;
    search?: string;
    clientId?: string;
    freelancerUserId?: string;
    page?: number;
    limit?: number;
  }) {
    return projectRepository.findAll(filters);
  }

  async getProjectById(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) throw { status: 404, message: 'Project not found' };
    return project;
  }

  async updateProject(id: string, userId: string, data: any) {
    const project = await projectRepository.findById(id);
    if (!project) throw { status: 404, message: 'Project not found' };
    // Allow updating for milestones and submissions in MVP
    return projectRepository.update(id, data);
  }

  async deleteProject(id: string, clientId: string) {
    const project = await projectRepository.findById(id);
    if (!project) throw { status: 404, message: 'Project not found' };
    if (project.clientId !== clientId) throw { status: 403, message: 'Not authorized' };
    return projectRepository.delete(id);
  }

  async fundEscrow(projectId: string, clientId: string) {
    const { prisma } = require('../lib/prisma');
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { escrow: true }
    });
    
    if (!project) throw { status: 404, message: 'Project not found' };
    if (project.clientId !== clientId) throw { status: 403, message: 'Not authorized' };
    if (project.escrow && project.escrow.status === 'HELD') {
      throw { status: 400, message: 'Escrow already funded' };
    }

    if (project.escrow) {
      await prisma.escrowPayment.update({
        where: { id: project.escrow.id },
        data: { status: 'HELD' }
      });
    } else {
      await prisma.escrowPayment.create({
        data: {
          projectId,
          amount: project.budget,
          status: 'HELD'
        }
      });
    }

    await prisma.projectActivity.create({
      data: {
        projectId,
        content: 'Client funded the project balance into Somlance Secure Escrow.'
      }
    });

    return true;
  }

  async startProject(projectId: string, freelancerId: string, templateId: string) {
    const { prisma } = require('../lib/prisma');
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        invitations: {
          where: { freelancerId, status: 'ACCEPTED' }
        },
        proposals: {
          where: { freelancer: { userId: freelancerId }, status: 'ACCEPTED' }
        },
        escrow: true
      }
    });

    if (!project) throw { status: 404, message: 'Project not found' };
    if (project.invitations.length === 0 && project.proposals.length === 0) {
      throw { status: 403, message: 'Not assigned to this project' };
    }
    
    // Check escrow for project-based jobs
    const isProjectBased = project.invitations[0]?.jobType === 'PROJECT_BASED' || true; // Proposals are typically project-based
    if (isProjectBased && (!project.escrow || project.escrow.status !== 'HELD')) {
      throw { status: 400, message: 'Cannot start until business pays escrow' };
    }

    const template = await prisma.progressTemplate.findUnique({
      where: { id: templateId },
      include: { steps: { orderBy: { orderIndex: 'asc' } } }
    });

    if (!template) throw { status: 404, message: 'Template not found' };

    // Copy steps
    for (const step of template.steps) {
      await prisma.projectProgressStep.create({
        data: {
          projectId,
          name: step.name,
          orderIndex: step.orderIndex,
          status: 'PENDING'
        }
      });
    }

    await projectRepository.update(projectId, { 
      status: 'IN_PROGRESS', 
      isPlanSubmitted: true 
    });

    await prisma.projectActivity.create({
      data: {
        projectId,
        content: `Freelancer started the project using the ${template.name} template.`
      }
    });

    return true;
  }
}
