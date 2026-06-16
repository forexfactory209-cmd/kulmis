import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const businessController = new BusinessController();

router.use(authMiddleware);
router.use(checkRole(['CLIENT'])); // For business users, role is CLIENT (with businessProfile)

// Dashboard endpoints
router.get('/dashboard/overview', (req, res) => businessController.getDashboardOverview(req, res));
router.get('/team', (req, res) => businessController.getTeam(req, res));
router.get('/analytics', (req, res) => businessController.getAnalytics(req, res));

export default router;
