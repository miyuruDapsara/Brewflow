const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { env } = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { apiRateLimiter } = require('./middleware/rateLimit');
const notFoundMiddleware = require('./middleware/notFound');
const errorMiddleware = require('./middleware/error');
const authRoutes = require('./modules/auth/auth.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
const adminOrderRoutes = require('./modules/orders/order.admin.routes');

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
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
