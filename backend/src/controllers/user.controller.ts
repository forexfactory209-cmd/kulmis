import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getFreelancers(req: Request, res: Response) {
    try {
      const queryData = res.locals.validatedQuery || req.query;
      const { search, skill, minRate, maxRate, page, limit } = queryData as any;
      const result = await userService.getFreelancers({
        search,
        skill,
        minRate,
        maxRate,
        page,
        limit,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id as string);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: user, message: 'Profile updated' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateFreelancerProfile(req: Request, res: Response) {
    try {
      const profile = await userService.updateFreelancerProfile(req.user!.userId, req.body);
      res.json({ success: true, data: profile, message: 'Freelancer profile updated' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async toggleFavorite(req: Request, res: Response) {
    try {
      const result = await userService.toggleFavorite(req.user!.userId, req.params.freelancerId as string);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getFavorites(req: Request, res: Response) {
    try {
      const favorites = await userService.getFavorites(req.user!.userId);
      res.json({ success: true, data: favorites });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      await userService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async toggleTwoFactor(req: Request, res: Response) {
    try {
      const isEnabled = await userService.toggleTwoFactor(req.user!.userId);
      res.json({ success: true, data: { twoFactorEnabled: isEnabled }, message: `Two-factor authentication ${isEnabled ? 'enabled' : 'disabled'}` });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      await userService.deleteAccount(req.user!.userId);
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }
}
