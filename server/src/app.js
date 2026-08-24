const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { env } = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { apiRateLimiter } = require('./middleware/rateLimit');
const notFoundMiddleware = require('./middleware/notFound');
const errorMiddleware = require('./middleware/error');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);
app.use(apiRateLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
