import { AttendanceRepository } from '../repositories/attendance.repository';

const attendanceRepository = new AttendanceRepository();

export class AttendanceService {
  async getClientAttendances(clientId: string, date?: string) {
    return attendanceRepository.getClientAttendances(clientId, date);
  }

  async clockIn(workerId: string) {
    return attendanceRepository.clockIn(workerId);
  }

  async clockOut(workerId: string) {
    return attendanceRepository.clockOut(workerId);
  }
}
