import { Router } from 'express';
import { authMiddleware, checkRole } from '../middleware/auth';
import * as progressController from '../controllers/progress.controller';

const router = Router();

// Progress Templates (Freelancer specific)
router.get('/templates', authMiddleware, checkRole(['FREELANCER']), progressController.getTemplates);
router.post('/templates', authMiddleware, checkRole(['FREELANCER']), progressController.createTemplate);
router.put('/templates/:id', authMiddleware, checkRole(['FREELANCER']), progressController.updateTemplate);
router.delete('/templates/:id', authMiddleware, checkRole(['FREELANCER']), progressController.deleteTemplate);

// AI Recommendation
router.get('/suggest', authMiddleware, checkRole(['FREELANCER']), progressController.suggestSteps);

// Job Acceptance & Progress
router.post('/projects/:id/accept', authMiddleware, checkRole(['FREELANCER']), progressController.acceptJob);
router.put('/projects/:projectId/steps/:stepId/submit', authMiddleware, checkRole(['FREELANCER']), progressController.submitStep);
router.put('/projects/:projectId/steps/:stepId/approve', authMiddleware, checkRole(['CLIENT']), progressController.approveStep);

// Client view progress
router.get('/projects/:projectId', authMiddleware, progressController.getProjectProgress);

export default router;
