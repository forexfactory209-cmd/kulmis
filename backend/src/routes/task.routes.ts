import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const taskController = new TaskController();

router.use(authMiddleware);

router.get('/', checkRole(['CLIENT']), (req, res) => taskController.getTasks(req, res));
router.post('/', checkRole(['CLIENT']), (req, res) => taskController.createTask(req, res));
router.put('/:id', checkRole(['CLIENT']), (req, res) => taskController.updateTask(req, res));
router.delete('/:id', checkRole(['CLIENT']), (req, res) => taskController.deleteTask(req, res));

export default router;
