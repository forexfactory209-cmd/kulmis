import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const teamController = new TeamController();

router.use(authMiddleware);
router.use(checkRole(['CLIENT']));

router.get('/', (req, res) => teamController.getMyTeam(req, res));
router.get('/stats', (req, res) => teamController.getTeamStats(req, res));
router.get('/:workerId', (req, res) => teamController.getWorkerDetails(req, res));

export default router;
