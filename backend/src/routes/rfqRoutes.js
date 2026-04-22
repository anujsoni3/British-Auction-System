import { Router } from 'express';
import {
  closeCheckController,
  createRfqController,
  getLogsController,
  getRfqController,
  listRfqsController,
  placeBidController
} from '../controllers/rfqController.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

const router = Router();

router.post('/', requireAuth, requireRole('BUYER'), createRfqController);
router.get('/', requireAuth, listRfqsController);
router.get('/:id', requireAuth, getRfqController);
router.post('/:id/bid', requireAuth, requireRole('SUPPLIER'), placeBidController);
router.post('/:id/bids', requireAuth, requireRole('SUPPLIER'), placeBidController);
router.get('/:id/logs', requireAuth, getLogsController);
router.post('/:id/close-check', requireAuth, requireRole('BUYER'), closeCheckController);

export default router;
