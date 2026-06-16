import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/v1/billing/summary — get wallet balance + payment info
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    const balance = businessProfile?.balance ?? 0;

    // Get total paid from payrolls
    const payrolls = await prisma.payroll.findMany({
      where: {
        contract: {
          business: { userId: req.user!.userId },
        },
      },
      include: {
        contract: {
          include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { periodStart: 'desc' },
    });

    const totalPaid = payrolls
      .filter((p: any) => p.status === 'PAID')
      .reduce((acc: number, p: any) => acc + p.totalAmount, 0);

    const pendingAmount = payrolls
      .filter((p: any) => p.status === 'PENDING')
      .reduce((acc: number, p: any) => acc + p.totalAmount, 0);

    res.json({
      success: true,
      data: {
        balance,
        totalPaid,
        pendingAmount,
        billingHistory: payrolls,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/v1/billing/add-funds — add funds to wallet
router.post('/add-funds', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: { message: 'Invalid amount' } });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Business profile not found' } });
    }

    const updated = await prisma.businessProfile.update({
      where: { userId: req.user!.userId },
      data: { balance: profile.balance + Number(amount) },
    });

    res.json({ success: true, data: { balance: updated.balance } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

export default router;
