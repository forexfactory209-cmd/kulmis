import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      const result = await authService.register({ email, password, firstName, lastName, role });
      res.status(201).json({ success: true, data: result, message: 'Registration successful' });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message || 'Registration failed' } });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({ success: true, data: result, message: 'Login successful' });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message || 'Login failed' } });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getMe(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: { message: 'Refresh token required' } });
        return;
      }
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }
}
