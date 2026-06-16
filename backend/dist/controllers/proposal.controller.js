"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalController = void 0;
const proposal_service_1 = require("../services/proposal.service");
const proposalService = new proposal_service_1.ProposalService();
class ProposalController {
    async create(req, res) {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const profile = await prisma.freelancerProfile.findUnique({ where: { userId: req.user.userId } });
            if (!profile)
                return res.status(404).json({ success: false, error: { message: 'Freelancer profile not found' } });
            const proposal = await proposalService.createProposal({
                freelancerId: profile.id,
                ...req.body,
            });
            res.status(201).json({ success: true, data: proposal, message: 'Proposal submitted' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async getProjectProposals(req, res) {
        try {
            const proposals = await proposalService.getProjectProposals(req.params.projectId);
            res.json({ success: true, data: proposals });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async getMyProposals(req, res) {
        try {
            const proposals = await proposalService.getFreelancerProposals(req.user.userId);
            res.json({ success: true, data: proposals });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async accept(req, res) {
        try {
            const proposal = await proposalService.acceptProposal(req.params.id, req.user.userId);
            res.json({ success: true, data: proposal, message: 'Proposal accepted' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async reject(req, res) {
        try {
            const proposal = await proposalService.rejectProposal(req.params.id, req.user.userId);
            res.json({ success: true, data: proposal, message: 'Proposal rejected' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
}
exports.ProposalController = ProposalController;
