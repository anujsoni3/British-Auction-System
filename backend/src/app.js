import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './prisma/client.js';
import rfqRouter from './routes/rfqRoutes.js';
import authRouter from './auth/routes.js';

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'british-auction-api' });
});

app.get('/health', (_req, res) => {
  res.send('OK');
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'british-auction-api' });
});

app.get('/api/health/db', async (_req, res, next) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS server_time`;
    res.json({ ok: true, database: 'connected', serverTime: result[0].server_time });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/rfqs', rfqRouter);

app.use((err, _req, res, _next) => {
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with this unique value already exists' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this unique value already exists' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Something went wrong'
  });
});

export default app;
