import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { freelancerQuerySchema } from '../validation/freelancer.validator';
import multer from 'multer';
import path from 'path';

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = Router();
const userController = new UserController();

// ─── STATIC routes MUST come BEFORE the wildcard /:id ───

router.get('/freelancers', validate(freelancerQuerySchema, 'query'), (req, res) => userController.getFreelancers(req, res));

// Profile updates
router.put('/profile', authMiddleware, (req, res) => userController.updateProfile(req, res));
router.put('/freelancer-profile', authMiddleware, (req, res) => userController.updateFreelancerProfile(req, res));

// Favorites
router.get('/favorites', authMiddleware, (req, res) => userController.getFavorites(req, res));
router.post('/favorites/:freelancerId', authMiddleware, (req, res) => userController.toggleFavorite(req, res));

// Settings
router.post('/settings/change-password', authMiddleware, (req, res) => userController.changePassword(req, res));
router.post('/settings/toggle-2fa', authMiddleware, (req, res) => userController.toggleTwoFactor(req, res));
router.delete('/settings/delete-account', authMiddleware, (req, res) => userController.deleteAccount(req, res));

// User upload endpoint
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/public/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url: fileUrl } });
});

// ─── WILDCARD route LAST ───
router.get('/:id', (req, res) => userController.getUserById(req, res));

export default router;
