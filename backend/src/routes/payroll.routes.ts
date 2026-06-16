import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const payrollController = new PayrollController();

router.use(authMiddleware);

router.get(
  '/',
  checkRole(['CLIENT']),
  payrollController.getClientPayrolls.bind(payrollController)
);

router.get(
  '/:id',
  checkRole(['CLIENT']),
  payrollController.getPayrollById.bind(payrollController)
);

router.post(
  '/run',
  checkRole(['CLIENT']),
  payrollController.runPayroll.bind(payrollController)
);

router.put(
  '/:id/pay',
  checkRole(['CLIENT']),
  payrollController.markAsPaid.bind(payrollController)
);

export default router;
