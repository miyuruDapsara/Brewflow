const http = require('http');
const app = require('./app');
const { env, assertServerEnv } = require('./config/env');
const { connectDatabase } = require('./config/database');
const { initSocketServer } = require('./sockets/socketServer');

async function startServer() {
  assertServerEnv();
  await connectDatabase();

  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(env.port, () => {
    console.log(`BrewFlow server listening on port ${env.port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
