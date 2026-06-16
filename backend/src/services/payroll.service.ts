import { PayrollRepository } from '../repositories/payroll.repository';

const payrollRepository = new PayrollRepository();

export class PayrollService {
  async getClientPayrolls(clientId: string, status?: string) {
    return payrollRepository.getClientPayrolls(clientId, status);
  }

  async getPayrollById(id: string) {
    const payroll = await payrollRepository.getPayrollById(id);
    if (!payroll) {
      throw { status: 404, message: 'Payroll not found' };
    }
    return payroll;
  }

  async runPayroll(clientId: string, month: string) {
    if (!month) throw { status: 400, message: 'Month is required' };
    return payrollRepository.runPayroll(clientId, month);
  }

  async markAsPaid(id: string) {
    return payrollRepository.markAsPaid(id);
  }
}
