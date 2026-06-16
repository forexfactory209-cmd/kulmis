import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ReviewRepository } from '../repositories/review.repository';

const router = Router();
const reviewRepo = new ReviewRepository();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body;
    const review = await reviewRepo.create({
      projectId, reviewerId: req.user!.userId, revieweeId, rating, comment,
    });
    res.status(201).json({ success: true, data: review, message: 'Review submitted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/me/received', authMiddleware, async (req, res) => {
  try {
    const reviews = await reviewRepo.findByUser(req.user!.userId);
    res.json({ success: true, data: reviews });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/me/given', authMiddleware, async (req, res) => {
  try {
    const reviews = await reviewRepo.findGivenByUser(req.user!.userId);
    res.json({ success: true, data: reviews });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await reviewRepo.update(req.params.id as string, req.user!.userId, rating, comment);
    res.json({ success: true, data: review, message: 'Review updated' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await reviewRepo.delete(req.params.id as string, req.user!.userId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await reviewRepo.findByUser(req.params.userId);
    res.json({ success: true, data: reviews });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const reviews = await reviewRepo.findByProject(req.params.projectId);
    res.json({ success: true, data: reviews });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

export default router;
