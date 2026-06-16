import { Request, Response, NextFunction } from 'express';
import { getSettings } from '../utils/settings';

export const maintenanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Allow admin routes even in maintenance mode so the admin can manage settings
  if (req.path.startsWith('/admin')) {
    return next();
  }

  // Allow auth routes maybe? No, let's just allow admin routes and maybe basic static files
  // If the admin needs to log in, it's on /auth/login, so we should allow that
  if (req.path.startsWith('/auth')) {
    return next();
  }

  const settings = getSettings();
  
  if (settings.maintenanceMode) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'The platform is currently undergoing maintenance. Please check back later.'
      }
    });
  }

  next();
};
