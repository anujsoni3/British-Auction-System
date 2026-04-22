import { Router } from 'express';
import { closeCheck, createRfq, getRfqDetails, listRfqs, placeBid } from '../services/rfqService.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

const router = Router();

router.get('/', (_req, res) => {
  res.render('landing');
});

router.get('/login', (_req, res) => {
  if (_req.user) return res.redirect('/rfqs');
  res.render('login', { error: null });
});

router.get('/signup', (_req, res) => {
  if (_req.user) return res.redirect('/rfqs');
  res.render('signup', { error: null });
});

router.get('/rfqs', requireAuth, async (_req, res, next) => {
  try {
    const rfqs = await listRfqs();
    res.render('rfq-list', { rfqs, error: null, user: _req.user });
  } catch (err) {
    next(err);
  }
});

router.get('/rfqs/new', requireAuth, requireRole('BUYER'), (_req, res) => {
  res.render('rfq-new', {
    error: null,
    values: {
      triggerWindowMinutes: 10,
      extensionMinutes: 5,
      triggerType: 'ANY_BID'
    }
  });
});

router.post('/rfqs', requireAuth, requireRole('BUYER'), async (req, res) => {
  try {
    const rfq = await createRfq(req.body, req.user.userId);
    res.redirect(`/rfqs/${rfq.id}`);
  } catch (err) {
    res.status(err.status || 400).render('rfq-new', { error: err.message, values: req.body });
  }
});

router.get('/rfqs/:id', requireAuth, async (req, res, next) => {
  try {
    res.render('rfq-detail', { ...(await getRfqDetails(req.params.id)), error: null, user: req.user });
  } catch (err) {
    next(err);
  }
});

router.post('/rfqs/:id/bid', requireAuth, requireRole('SUPPLIER'), async (req, res) => {
  try {
    await placeBid(req.params.id, req.body);
    res.redirect(`/rfqs/${req.params.id}`);
  } catch (err) {
    const details = await getRfqDetails(req.params.id);
    res.status(err.status || 400).render('rfq-detail', { ...details, error: err.message, user: req.user });
  }
});

router.post('/rfqs/:id/close-check', requireAuth, requireRole('BUYER'), async (req, res, next) => {
  try {
    await closeCheck(req.params.id);
    res.redirect(`/rfqs/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

export default router;
