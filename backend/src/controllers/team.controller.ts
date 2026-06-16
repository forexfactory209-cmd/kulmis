import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';

const teamService = new TeamService();

export class TeamController {
  async getMyTeam(req: Request, res: Response) {
    try {
      const result = await teamService.getMyTeam(req.user!.userId, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getTeamStats(req: Request, res: Response) {
    try {
      const stats = await teamService.getTeamStats(req.user!.userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }

  async getWorkerDetails(req: Request, res: Response) {
    try {
      const details = await teamService.getWorkerDetails(req.user!.userId, req.params.workerId as string);
      res.json({ success: true, data: details });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: { message: error.message } });
    }
  }
}
