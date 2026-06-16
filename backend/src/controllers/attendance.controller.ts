import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';

const attendanceService = new AttendanceService();

export class AttendanceController {
  async getClientAttendances(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const date = req.query.date as string;
      const attendances = await attendanceService.getClientAttendances(clientId, date);
      res.status(200).json({ success: true, data: attendances });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async clockIn(req: Request, res: Response) {
    try {
      const workerId = req.user!.userId;
      const attendance = await attendanceService.clockIn(workerId);
      res.status(200).json({ success: true, data: attendance });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async clockOut(req: Request, res: Response) {
    try {
      const workerId = req.user!.userId;
      const attendance = await attendanceService.clockOut(workerId);
      res.status(200).json({ success: true, data: attendance });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }
}
