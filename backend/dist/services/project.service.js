"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("../repositories/project.repository");
const projectRepository = new project_repository_1.ProjectRepository();
class ProjectService {
    async createProject(data) {
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
    async getProjects(filters) {
        return projectRepository.findAll(filters);
    }
    async getProjectById(id) {
        const project = await projectRepository.findById(id);
        if (!project)
            throw { status: 404, message: 'Project not found' };
        return project;
    }
    async updateProject(id, userId, data) {
        const project = await projectRepository.findById(id);
        if (!project)
            throw { status: 404, message: 'Project not found' };
        // Allow updating for milestones and submissions in MVP
        return projectRepository.update(id, data);
    }
    async deleteProject(id, clientId) {
        const project = await projectRepository.findById(id);
        if (!project)
            throw { status: 404, message: 'Project not found' };
        if (project.clientId !== clientId)
            throw { status: 403, message: 'Not authorized' };
        return projectRepository.delete(id);
    }
}
exports.ProjectService = ProjectService;
