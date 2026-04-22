import { Router } from 'express';
import {
  closeCheckController,
  createRfqController,
  getLogsController,
  getRfqController,
  listRfqsController,
  placeBidController
} from '../controllers/rfqController.js';

const router = Router();

router.post('/', createRfqController);
router.get('/', listRfqsController);
router.get('/:id', getRfqController);
router.post('/:id/bid', placeBidController);
router.post('/:id/bids', placeBidController);
router.get('/:id/logs', getLogsController);
router.post('/:id/close-check', closeCheckController);

export default router;
