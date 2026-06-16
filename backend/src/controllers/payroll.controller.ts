import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll.service';

const payrollService = new PayrollService();

export class PayrollController {
  async getClientPayrolls(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const status = req.query.status as string;
      const payrolls = await payrollService.getClientPayrolls(clientId, status);
      res.status(200).json({ success: true, data: payrolls });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async getPayrollById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payroll = await payrollService.getPayrollById(id as string);
      res.status(200).json({ success: true, data: payroll });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async runPayroll(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const { month } = req.body;
      const payrolls = await payrollService.runPayroll(clientId, month);
      res.status(200).json({ success: true, data: payrolls });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payroll = await payrollService.markAsPaid(id as string);
      res.status(200).json({ success: true, data: payroll });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }
}
