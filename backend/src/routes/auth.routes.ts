import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidation, loginValidation } from '../validation/auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerValidation, 'body'), (req: Request, res: Response) => authController.register(req, res));
router.post('/login', validate(loginValidation, 'body'), (req: Request, res: Response) => authController.login(req, res));
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

export default router;
