import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const { assignedWorkerId, documentUrl, description, ...rest } = req.body;
      
      let finalDescription = description || '';
      if (documentUrl) {
        finalDescription += `\n\n---METADATA---\n{"documentUrl": "${documentUrl}"}`;
      }

      const project = await projectService.createProject({
        clientId: req.user!.userId,
        description: finalDescription,
        freelancerId: assignedWorkerId,
        ...rest,
      });
      res.status(201).json({ success: true, data: project, message: 'Project created' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { status, category, search, page, limit } = req.query as Record<string, string | undefined>;
      const result = await projectService.getProjects({
        status,
        category,
        search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getMyProjects(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query as Record<string, string | undefined>;
      const role = req.user!.role;
      const filters: any = {
        status,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      };

      if (role === 'FREELANCER') {
        filters.freelancerUserId = req.user!.userId;
      } else {
        filters.clientId = req.user!.userId;
      }

      const result = await projectService.getProjects(filters);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const project = await projectService.getProjectById(req.params.id as string);
      res.json({ success: true, data: project });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const project = await projectService.updateProject(req.params.id as string, req.user!.userId, req.body);
      res.json({ success: true, data: project, message: 'Project updated' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await projectService.deleteProject(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: 'Project deleted' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async fundEscrow(req: Request, res: Response) {
    try {
      await projectService.fundEscrow(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: 'Escrow funded successfully' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async startProject(req: Request, res: Response) {
    try {
      const { templateId } = req.body;
      if (!templateId) {
        return res.status(400).json({ success: false, error: { message: 'Template ID is required' } });
      }
      await projectService.startProject(req.params.id as string, req.user!.userId, templateId);
      res.json({ success: true, message: 'Project started successfully' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }
}
