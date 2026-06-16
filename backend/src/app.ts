import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import proposalRoutes from './routes/proposal.routes';
import notificationRoutes from './routes/notification.routes';
import reviewRoutes from './routes/review.routes';
import messageRoutes from './routes/message.routes';
import adminRoutes from './routes/admin.routes';
import staffingRoutes from './routes/staffing.routes';
import contractRoutes from './routes/contract.routes';
import payrollRoutes from './routes/payroll.routes';
import progressRoutes from './routes/progress.routes';
import freelancerRoutes from './routes/freelancer.routes';
import teamRoutes from './routes/team.routes';
import attendanceRoutes from './routes/attendance.routes';
import uploadRoutes from './routes/upload.routes';
import businessRoutes from './routes/business.routes';
import invitationRoutes from './routes/invitation.routes';
import taskRoutes from './routes/task.routes';
import reportRoutes from './routes/report.routes';
import billingRoutes from './routes/billing.routes';

import { logger } from './lib/logger';

const app: Application = express();

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });
  next();
});

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, 
  legacyHeaders: false, 
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 login/register requests per hour
  message: 'Too many authentication attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow loading images cross-origin
app.use(compression());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    const checks = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
    ]);

    const [db, cache] = checks;
    const healthy = checks.every((c) => c.status === 'fulfilled');

    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'degraded',
      db: db.status === 'fulfilled' ? 'ok' : 'down',
      cache: cache.status === 'fulfilled' ? 'ok' : 'down',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({ status: 'error' });
  }
});

import { maintenanceMiddleware } from './middleware/maintenance';

// API Routes (v1)
app.use('/api/v1/', apiLimiter);
app.use('/api/v1', maintenanceMiddleware);
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/staffing', staffingRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/freelancers', freelancerRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/business', businessRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/billing', billingRoutes);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: config.env === 'production' ? 'Internal Server Error' : err.message,
    },
  });
});

export default app;
