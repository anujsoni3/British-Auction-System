import {
  closeCheck,
  createRfq,
  getLogs,
  getRfqDetails,
  listRfqs,
  placeBid
} from '../services/rfqService.js';
import { prisma } from '../prisma/client.js';

export async function createRfqController(req, res, next) {
  try {
    const rfq = await createRfq(req.body, req.user.userId);
    res.status(201).json(rfq);
  } catch (err) {
    next(err);
  }
}

export async function listRfqsController(_req, res, next) {
  try {
    res.json(await listRfqs());
  } catch (err) {
    next(err);
  }
}

export async function getRfqController(req, res, next) {
  try {
    res.json(await getRfqDetails(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function placeBidController(req, res, next) {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { name: true, role: true }
    });

    if (!currentUser || currentUser.role !== 'SUPPLIER') {
      return res.status(403).json({ error: 'Only suppliers can place bids' });
    }

    res.status(201).json(
      await placeBid(req.params.id, req.body, { supplierName: currentUser.name })
    );
  } catch (err) {
    next(err);
  }
}

export async function getLogsController(req, res, next) {
  try {
    res.json(await getLogs(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function closeCheckController(req, res, next) {
  try {
    res.json(await closeCheck(req.params.id));
  } catch (err) {
    next(err);
  }
}
