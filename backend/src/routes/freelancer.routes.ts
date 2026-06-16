import { Router } from 'express';
import { FreelancerController } from '../controllers/freelancer.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const freelancerController = new FreelancerController();

router.get('/', (req, res) => freelancerController.searchFreelancers(req, res));
router.get('/saved/list', authMiddleware, (req, res) => freelancerController.getSavedFreelancers(req, res));
// Business Hub Analytics for Freelancer
router.get('/me/business-hub', authMiddleware, (req, res) => freelancerController.getBusinessHubAnalytics(req, res));

router.post('/:id/save', authMiddleware, (req, res) => freelancerController.saveFreelancer(req, res));
router.delete('/:id/save', authMiddleware, (req, res) => freelancerController.unsaveFreelancer(req, res));
router.get('/:id/business-hub', authMiddleware, (req, res) => freelancerController.getBusinessHubAnalytics(req, res));
router.get('/:id', (req, res) => freelancerController.getFreelancerProfile(req, res));

export default router;
