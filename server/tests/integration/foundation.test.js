const request = require('supertest');
const express = require('express');
const notFoundMiddleware = require('../../src/middleware/notFound');
const errorMiddleware = require('../../src/middleware/error');
const asyncHandler = require('../../src/utils/asyncHandler');
const ApiError = require('../../src/utils/ApiError');
const app = require('../../src/app');

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('foundation middleware integration', () => {
  it('returns 404 in the standard error shape for unknown routes', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('sets security headers via Helmet', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['x-dns-prefetch-control']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('maps thrown ApiError through asyncHandler and error middleware', async () => {
    const miniApp = express();
    miniApp.get(
      '/fail',
      asyncHandler(async () => {
        throw ApiError.notFound('Missing item');
      })
    );
    miniApp.use(notFoundMiddleware);
    miniApp.use(errorMiddleware);

    const response = await request(miniApp).get('/fail');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Missing item',
      },
    });
  });
});
