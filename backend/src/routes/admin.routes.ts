import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware, checkRole } from '../middleware/auth';
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
const adminController = new AdminController();

// All routes require authentication and 'ADMIN' role
router.use(authMiddleware);
router.use(checkRole(['ADMIN']));

// Upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }
  // Construct URL
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/public/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url: fileUrl } });
});

// Skills endpoint
router.get('/skills', (req, res) => adminController.getSkills(req, res));

// Statistics & Analytics Charts
router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/charts', (req, res) => adminController.getCharts(req, res));

// User management routes
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.post('/users/freelancer', (req, res) => adminController.createFreelancer(req, res));
router.put('/users/freelancer/:id', (req, res) => adminController.updateFreelancer(req, res));
router.post('/users/client', (req, res) => adminController.createClient(req, res));
router.put('/users/client/:id', (req, res) => adminController.updateClient(req, res));
router.post('/users/business', (req, res) => adminController.createBusiness(req, res));
router.put('/users/business/:id', (req, res) => adminController.updateBusiness(req, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));
router.put('/users/:id/status', (req, res) => adminController.updateUserStatus(req, res));
router.put('/users/:id/verify', (req, res) => adminController.verifyUser(req, res));

// Business activity detail
router.get('/users/business/:id/activity', (req, res) => adminController.getBusinessActivity(req, res));

// Project management routes
router.get('/projects', (req, res) => adminController.getProjects(req, res));
router.get('/projects/:id', (req, res) => adminController.getProjectById(req, res));
router.put('/projects/:id/status', (req, res) => adminController.updateProjectStatus(req, res));

// Financial transactions & Escrow ledger routes
router.get('/transactions', authMiddleware, (req, res) => adminController.getTransactions(req, res));
router.post('/escrow/:id/release', authMiddleware, (req, res) => adminController.releaseEscrow(req, res));
router.get('/disputes', authMiddleware, (req, res) => adminController.getDisputes(req, res));
router.put('/disputes/:id', authMiddleware, (req, res) => adminController.updateDispute(req, res));
router.get('/settings', authMiddleware, (req, res) => adminController.getSettings(req, res));
router.put('/settings', authMiddleware, (req, res) => adminController.updateSettings(req, res));
router.get('/skills', authMiddleware, (req, res) => adminController.getSkills(req, res));

// New routes for Full Analytics & Monitoring
router.get('/analytics/full', authMiddleware, (req, res) => adminController.getFullAnalytics(req, res));
router.get('/reviews', authMiddleware, (req, res) => adminController.getReviews(req, res));
router.get('/categories', authMiddleware, (req, res) => adminController.getCategories(req, res));
router.post('/categories', authMiddleware, (req, res) => adminController.createCategory(req, res));
router.delete('/categories/:name', authMiddleware, (req, res) => adminController.deleteCategory(req, res));
router.put('/categories/:name', authMiddleware, (req, res) => adminController.renameCategory(req, res));
router.get('/categories/:name/detail', authMiddleware, (req, res) => adminController.getCategoryDetail(req, res));
router.get('/jobs-monitoring', authMiddleware, (req, res) => adminController.getJobsMonitoring(req, res));

// User activity detail routes
router.get('/users/:id/client-activity', authMiddleware, (req, res) => adminController.getClientActivity(req, res));
router.get('/users/:id/freelancer-activity', authMiddleware, (req, res) => adminController.getFreelancerActivity(req, res));

export default router;
