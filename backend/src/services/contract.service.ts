import { ContractRepository } from '../repositories/contract.repository';

const contractRepository = new ContractRepository();

export class ContractService {
  async getClientContracts(clientId: string, status?: string, page = 1, limit = 20) {
    return contractRepository.getClientContracts(clientId, status, page, limit);
  }

  async getContractById(id: string) {
    const contract = await contractRepository.getContractById(id);
    if (!contract) {
      throw { status: 404, message: 'Contract not found' };
    }
    return contract;
  }

  async createContract(clientId: string, data: any) {
    if (!data.workerId || !data.monthlySalary || !data.employmentType) {
      throw { status: 400, message: 'Missing required contract fields' };
    }

    return contractRepository.createContract(clientId, {
      ...data,
      monthlySalary: Number(data.monthlySalary),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      schedule: data.schedule || 'Flexible',
    });
  }
}
