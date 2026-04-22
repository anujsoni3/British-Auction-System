import { Router } from 'express';
import { closeCheck, createRfq, getRfqDetails, listRfqs, placeBid } from '../services/rfqService.js';

const router = Router();

router.get('/', (_req, res) => res.redirect('/rfqs'));

router.get('/rfqs', async (_req, res, next) => {
  try {
    res.render('rfq-list', { rfqs: await listRfqs(), error: null });
  } catch (err) {
    next(err);
  }
});

router.get('/rfqs/new', (_req, res) => {
  res.render('rfq-new', {
    error: null,
    values: {
      triggerWindowMinutes: 10,
      extensionMinutes: 5,
      triggerType: 'ANY_BID'
    }
  });
});

router.post('/rfqs', async (req, res) => {
  try {
    const rfq = await createRfq(req.body);
    res.redirect(`/rfqs/${rfq.id}`);
  } catch (err) {
    res.status(err.status || 400).render('rfq-new', { error: err.message, values: req.body });
  }
});

router.get('/rfqs/:id', async (req, res, next) => {
  try {
    res.render('rfq-detail', { ...(await getRfqDetails(req.params.id)), error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/rfqs/:id/bid', async (req, res) => {
  try {
    await placeBid(req.params.id, req.body);
    res.redirect(`/rfqs/${req.params.id}`);
  } catch (err) {
    const details = await getRfqDetails(req.params.id);
    res.status(err.status || 400).render('rfq-detail', { ...details, error: err.message });
  }
});

router.post('/rfqs/:id/close-check', async (req, res, next) => {
  try {
    await closeCheck(req.params.id);
    res.redirect(`/rfqs/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

export default router;
