import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import rfqRouter from './routes/rfqs.js';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'british-auction-api' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'british-auction-api' });
});

app.use('/api/rfqs', rfqRouter);

app.use((err, _req, res, _next) => {
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with this unique value already exists' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Something went wrong'
  });
});

export default app;
