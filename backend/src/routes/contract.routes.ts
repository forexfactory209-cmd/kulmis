import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();
const contractController = new ContractController();

router.use(authMiddleware);

router.get(
  '/',
  checkRole(['CLIENT']),
  contractController.getClientContracts.bind(contractController)
);

router.get(
  '/:id',
  checkRole(['CLIENT']),
  contractController.getContractById.bind(contractController)
);

router.post(
  '/',
  checkRole(['CLIENT']),
  contractController.createContract.bind(contractController)
);

export default router;
