import { ProposalRepository } from '../repositories/proposal.repository';
import { ProjectRepository } from '../repositories/project.repository';

const proposalRepository = new ProposalRepository();
const projectRepository = new ProjectRepository();

export class ProposalService {
  async createProposal(data: {
    projectId: string;
    freelancerId: string;
    coverLetter: string;
    bidAmount: number;
    duration?: string;
  }) {
    const project = await projectRepository.findById(data.projectId);
    if (!project) throw { status: 404, message: 'Project not found' };
    if (project.status !== 'OPEN') throw { status: 400, message: 'Project is not open for proposals' };
    return proposalRepository.create(data);
  }

  async getProjectProposals(projectId: string) {
    return proposalRepository.findByProject(projectId);
  }

  async getFreelancerProposals(freelancerId: string) {
    return proposalRepository.findByFreelancer(freelancerId);
  }

  async acceptProposal(proposalId: string, clientId: string) {
    const proposal = await proposalRepository.findById(proposalId);
    if (!proposal) throw { status: 404, message: 'Proposal not found' };
    if (proposal.project.clientId !== clientId) throw { status: 403, message: 'Not authorized' };

    await proposalRepository.updateStatus(proposalId, 'ACCEPTED');
    await projectRepository.update(proposal.projectId, { status: 'IN_PROGRESS' });
    return proposalRepository.findById(proposalId);
  }

  async rejectProposal(proposalId: string, clientId: string) {
    const proposal = await proposalRepository.findById(proposalId);
    if (!proposal) throw { status: 404, message: 'Proposal not found' };
    if (proposal.project.clientId !== clientId) throw { status: 403, message: 'Not authorized' };
    return proposalRepository.updateStatus(proposalId, 'REJECTED');
  }
}
