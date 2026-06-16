import { Request, Response } from 'express';
import { ContractService } from '../services/contract.service';

const contractService = new ContractService();

export class ContractController {
  async getClientContracts(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const status = req.query.status as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await contractService.getClientContracts(clientId, status, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async getContractById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contract = await contractService.getContractById(id as string);
      res.status(200).json({ success: true, data: contract });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }

  async createContract(req: Request, res: Response) {
    try {
      const clientId = req.user!.userId;
      const contract = await contractService.createContract(clientId, req.body);
      res.status(201).json({ success: true, data: contract });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ success: false, error: { message: error.message } });
    }
  }
}
