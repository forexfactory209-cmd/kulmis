import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const business = await prisma.businessProfile.findUnique({
        where: { userId: req.user!.userId }
      });

      if (!business) {
        return res.status(404).json({ success: false, error: { message: 'Business profile not found' } });
      }

      const tasks = await prisma.task.findMany({
        where: { businessId: business.id },
        include: {
          assignee: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const business = await prisma.businessProfile.findUnique({
        where: { userId: req.user!.userId }
      });

      if (!business) {
        return res.status(404).json({ success: false, error: { message: 'Business profile not found' } });
      }

      const { title, description, status, priority, assigneeId, category, dueDate } = req.body;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          businessId: business.id,
          assigneeId: assigneeId || null,
          category,
          dueDate: dueDate ? new Date(dueDate) : null
        },
        include: {
          assignee: true
        }
      });

      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, status, priority, assigneeId, category, dueDate } = req.body;

      const task = await prisma.task.update({
        where: { id: id as string },
        data: {
          title,
          description,
          status,
          priority,
          assigneeId,
          category,
          dueDate: dueDate ? new Date(dueDate) : null
        },
        include: {
          assignee: true
        }
      });

      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.task.delete({
        where: { id: id as string }
      });

      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
