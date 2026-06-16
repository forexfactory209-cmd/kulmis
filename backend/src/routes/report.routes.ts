import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ReportService } from '../services/report.service';

const router = Router();
const reportService = new ReportService();

// GET /api/v1/reports — list user's reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reports = await reportService.getUserReports(req.user!.userId);
    res.json({ success: true, data: reports });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/v1/reports/generate — generate a new report
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'Finance', 'HR', or 'Operations'
    const report = await reportService.generateReport(req.user!.userId, type || 'Finance');
    res.status(201).json({ success: true, data: report });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

// DELETE /api/v1/reports/:id — delete a report
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    await reportService.deleteReport(id);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

export default router;
