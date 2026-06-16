import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth';
import { upload, setUploadType } from '../lib/upload';

const router = Router();
const uploadController = new UploadController();

router.use(authMiddleware);

// Profile avatar upload
router.post(
  '/profile',
  setUploadType('profiles'),
  upload.single('image'),
  uploadController.uploadProfileImage.bind(uploadController)
);

// Portfolio image upload
router.post(
  '/portfolio',
  setUploadType('portfolios'),
  upload.single('image'),
  uploadController.uploadPortfolioImage.bind(uploadController)
);

// Certificate image upload
router.post(
  '/certificate',
  setUploadType('certificates'),
  upload.single('image'),
  uploadController.uploadCertificateImage.bind(uploadController)
);

// Generic image upload (returns URL only)
router.post(
  '/image',
  setUploadType('profiles'),
  upload.single('image'),
  uploadController.uploadGenericImage.bind(uploadController)
);

export default router;
