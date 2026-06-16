import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const invitationController = new InvitationController();

router.use(authMiddleware);

// Client: create invitation
router.post('/', checkRole(['CLIENT']), (req, res) => invitationController.inviteFreelancer(req, res));

// Client: list their sent invitations
router.get('/client', checkRole(['CLIENT']), (req, res) => invitationController.getMyInvitationsAsClient(req, res));

// Freelancer: list their received invitations
router.get('/freelancer', checkRole(['FREELANCER']), (req, res) => invitationController.getMyInvitationsAsFreelancer(req, res));

// Both: get a single invitation by ID (for notification tap-to-open)
router.get('/:id', (req, res) => invitationController.getInvitationById(req, res));

// Both: generic status update
router.patch('/:id/status', (req, res) => invitationController.updateInvitationStatus(req, res));

// Freelancer: accept an invitation
router.post('/:id/accept', checkRole(['FREELANCER']), (req, res) => invitationController.acceptInvitation(req, res));

// Freelancer: reject an invitation
router.post('/:id/reject', checkRole(['FREELANCER']), (req, res) => invitationController.rejectInvitation(req, res));

// Freelancer: withdraw from an accepted business (terminate from freelancer side)
router.delete('/:id/withdraw', checkRole(['FREELANCER']), (req, res) => invitationController.withdrawFromBusiness(req, res));

// Client: retract/delete a PENDING or REJECTED invitation (also removes freelancer's notification)
router.delete('/:id', checkRole(['CLIENT']), (req, res) => invitationController.deleteInvitation(req, res));

// Client: remove an ACCEPTED worker (terminates contract)
router.delete('/:id/remove-worker', checkRole(['CLIENT']), (req, res) => invitationController.removeWorker(req, res));

export default router;
