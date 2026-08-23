const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const notFoundMiddleware = require('./middleware/notFound');
const errorMiddleware = require('./middleware/error');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
