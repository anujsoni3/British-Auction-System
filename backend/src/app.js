import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'british-auction-api' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'british-auction-api' });
});

export default app;
