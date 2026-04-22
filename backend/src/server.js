import app from './app.js';
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { initSocket } from './realtime/socket.js';

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`British Auction RFQ server running on port ${env.port}`);
});
