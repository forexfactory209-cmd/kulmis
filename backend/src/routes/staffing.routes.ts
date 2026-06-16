import { Router } from 'express';
import { StaffingController } from '../controllers/staffing.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const staffingController = new StaffingController();

router.use(authMiddleware);

// Client & Freelancer routes
router.post('/request', checkRole(['CLIENT']), (req, res) => staffingController.requestStaffing(req, res));
router.get('/contracts', checkRole(['CLIENT', 'FREELANCER']), (req, res) => staffingController.getMyContracts(req, res));
router.put('/:id/freelancer-accept', checkRole(['FREELANCER']), (req, res) => staffingController.freelancerAcceptContract(req, res));

// Admin routes for staffing mediation
router.get('/admin', checkRole(['ADMIN']), (req, res) => staffingController.getAllContracts(req, res));
router.put('/admin/:id/approve', checkRole(['ADMIN']), (req, res) => staffingController.adminApproveContract(req, res));

export default router;
