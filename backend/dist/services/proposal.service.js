"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalService = void 0;
const proposal_repository_1 = require("../repositories/proposal.repository");
const project_repository_1 = require("../repositories/project.repository");
const proposalRepository = new proposal_repository_1.ProposalRepository();
const projectRepository = new project_repository_1.ProjectRepository();
class ProposalService {
    async createProposal(data) {
        const project = await projectRepository.findById(data.projectId);
        if (!project)
            throw { status: 404, message: 'Project not found' };
        if (project.status !== 'OPEN')
            throw { status: 400, message: 'Project is not open for proposals' };
        return proposalRepository.create(data);
    }
    async getProjectProposals(projectId) {
        return proposalRepository.findByProject(projectId);
    }
    async getFreelancerProposals(freelancerId) {
        return proposalRepository.findByFreelancer(freelancerId);
    }
    async acceptProposal(proposalId, clientId) {
        const proposal = await proposalRepository.findById(proposalId);
        if (!proposal)
            throw { status: 404, message: 'Proposal not found' };
        if (proposal.project.clientId !== clientId)
            throw { status: 403, message: 'Not authorized' };
        await proposalRepository.updateStatus(proposalId, 'ACCEPTED');
        await projectRepository.update(proposal.projectId, { status: 'IN_PROGRESS' });
        return proposalRepository.findById(proposalId);
    }
    async rejectProposal(proposalId, clientId) {
        const proposal = await proposalRepository.findById(proposalId);
        if (!proposal)
            throw { status: 404, message: 'Proposal not found' };
        if (proposal.project.clientId !== clientId)
            throw { status: 403, message: 'Not authorized' };
        return proposalRepository.updateStatus(proposalId, 'REJECTED');
    }
}
exports.ProposalService = ProposalService;
