import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`British Auction API running on port ${env.port}`);
});
