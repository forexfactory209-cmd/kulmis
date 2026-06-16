import { Router } from 'express';
import { ProposalController } from '../controllers/proposal.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const proposalController = new ProposalController();

router.post('/', authMiddleware, (req, res) => proposalController.create(req, res));
router.get('/my', authMiddleware, (req, res) => proposalController.getMyProposals(req, res));
router.get('/project/:projectId', authMiddleware, (req, res) => proposalController.getProjectProposals(req, res));
router.put('/:id/accept', authMiddleware, (req, res) => proposalController.accept(req, res));
router.put('/:id/reject', authMiddleware, (req, res) => proposalController.reject(req, res));

export default router;
