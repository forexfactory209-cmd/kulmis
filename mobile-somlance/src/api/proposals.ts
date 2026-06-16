import apiClient from './client';
import { Project } from './projects';

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: string | number;
  duration?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  project?: Project;
}

export const getMyProposals = async (): Promise<Proposal[]> => {
  const response = await apiClient.get('/proposals/my');
  return response.data.data;
};

export const createProposal = async (data: {
  projectId: string;
  coverLetter: string;
  bidAmount: number;
  duration?: string;
}): Promise<Proposal> => {
  const response = await apiClient.post('/proposals', data);
  return response.data.data;
};
