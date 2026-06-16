import { Request, Response } from 'express';
import { FreelancerService } from '../services/freelancer.service';

const freelancerService = new FreelancerService();

export class FreelancerController {
  async searchFreelancers(req: Request, res: Response) {
    try {
      const result = await freelancerService.searchFreelancers(req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getFreelancerProfile(req: Request, res: Response) {
    try {
      const profile = await freelancerService.getFreelancerProfile(req.params.id as string);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async saveFreelancer(req: Request, res: Response) {
    try {
      await freelancerService.saveFreelancer(req.user!.userId, req.params.id as string);
      res.json({ success: true, message: 'Freelancer saved successfully' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async unsaveFreelancer(req: Request, res: Response) {
    try {
      await freelancerService.unsaveFreelancer(req.user!.userId, req.params.id as string);
      res.json({ success: true, message: 'Freelancer unsaved successfully' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getSavedFreelancers(req: Request, res: Response) {
    try {
      const result = await freelancerService.getSavedFreelancers(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getBusinessHubAnalytics(req: Request, res: Response) {
    try {
      const freelancerId = (req.params.id as string) || req.user!.userId;
      const result = await freelancerService.getBusinessAnalytics(freelancerId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }
}
