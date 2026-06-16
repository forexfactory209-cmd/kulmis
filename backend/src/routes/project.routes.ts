import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { ProjectInteractionController } from '../controllers/project-interaction.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const projectController = new ProjectController();
const interactionController = new ProjectInteractionController();

router.get('/', (req, res) => projectController.getAll(req, res));
router.get('/my', authMiddleware, (req, res) => projectController.getMyProjects(req, res));
router.get('/:id', (req, res) => projectController.getById(req, res));
router.post('/', authMiddleware, (req, res) => projectController.create(req, res));
router.put('/:id', authMiddleware, (req, res) => projectController.update(req, res));
router.post('/:id/fund-escrow', authMiddleware, (req, res) => projectController.fundEscrow(req, res));
router.post('/:id/start', authMiddleware, (req, res) => projectController.startProject(req, res));
router.delete('/:id', authMiddleware, (req, res) => projectController.delete(req, res));

// Project Interactions
router.post('/:id/files', authMiddleware, (req, res) => interactionController.uploadFile(req, res));
router.post('/:id/discussions', authMiddleware, (req, res) => interactionController.addDiscussion(req, res));
router.patch('/:id/steps/:stepId/submit', authMiddleware, (req, res) => interactionController.submitStep(req, res));
router.post('/:id/steps/:stepId/revisions', authMiddleware, (req, res) => interactionController.requestRevision(req, res));

export default router;
