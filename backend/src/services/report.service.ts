import { ReportRepository } from '../repositories/report.repository';

const reportRepo = new ReportRepository();

const REPORT_TITLES: Record<string, string[]> = {
  Finance: [
    'Monthly Financial Summary',
    'Revenue & Expenses Report',
    'Payment Transactions Report',
    'Freelancer Payout Summary',
    'Outstanding Invoices Report',
  ],
  HR: [
    'Team Performance Report',
    'Attendance Summary',
    'Worker Onboarding Report',
    'Contract Status Report',
    'Workforce Analytics Report',
  ],
  Operations: [
    'Project Delivery Timeline',
    'Milestone Completion Report',
    'Active Projects Overview',
    'Task Completion Report',
    'Client Satisfaction Report',
  ],
};

function randomSize(): string {
  const kb = Math.floor(Math.random() * 4000) + 200;
  if (kb >= 1000) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

export class ReportService {
  async getUserReports(userId: string) {
    return reportRepo.findByUser(userId);
  }

  async generateReport(userId: string, type: string) {
    const titles = REPORT_TITLES[type] || REPORT_TITLES['Finance'];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const size = randomSize();

    return reportRepo.create({
      userId,
      title,
      type,
      size,
    });
  }

  async deleteReport(id: string) {
    return reportRepo.delete(id);
  }
}
