import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const attendanceController = new AttendanceController();

router.use(authMiddleware);

router.get(
  '/',
  checkRole(['CLIENT']),
  attendanceController.getClientAttendances.bind(attendanceController)
);

router.post(
  '/clock-in',
  checkRole(['FREELANCER']),
  attendanceController.clockIn.bind(attendanceController)
);

router.post(
  '/clock-out',
  checkRole(['FREELANCER']),
  attendanceController.clockOut.bind(attendanceController)
);

export default router;
