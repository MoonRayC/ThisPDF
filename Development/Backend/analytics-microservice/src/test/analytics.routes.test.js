// test/analytics.routes.test.js

const request = require('supertest');
const express = require('express');
const router = require('../routes/analytics.routes');
const analyticsController = require('../controllers/analytics.controller');

// Skip auth and validation middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: (req, res, next) => next(),
  optionalAuth: (req, res, next) => next(),
}));

jest.mock('../middleware/validation.middleware', () => ({
  validateParams: () => (req, res, next) => next(),
  validateQuery: () => (req, res, next) => next(),
  schemas: {},
}));

// Mock controller functions
jest.mock('../controllers/analytics.controller');

const app = express();
app.use(express.json());
app.use('/analytics', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('📊 Analytics Routes', () => {
  const uuid = '123e4567-e89b-12d3-a456-426614174000';

  test('GET /analytics/pdf/:pdfId/stats', async () => {
    analyticsController.getPdfStats.mockImplementation((req, res) =>
      res.status(200).json({ pdfId: uuid, totalViews: 10 })
    );

    const res = await request(app).get(`/analytics/pdf/${uuid}/stats`);
    expect(res.statusCode).toBe(200);
    expect(res.body.pdfId).toBe(uuid);
  });

  test('GET /analytics/pdf/:pdfId/rating', async () => {
    analyticsController.getPdfRating.mockImplementation((req, res) =>
      res.status(200).json({ pdfId: uuid, averageRating: 4.5 })
    );

    const res = await request(app).get(`/analytics/pdf/${uuid}/rating`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/pdf/:pdfId/comments', async () => {
    analyticsController.getPdfComments.mockImplementation((req, res) =>
      res.status(200).json({ pdfId: uuid, totalComments: 3 })
    );

    const res = await request(app).get(`/analytics/pdf/${uuid}/comments`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/user/:userId/popularity', async () => {
    analyticsController.getUserPopularity.mockImplementation((req, res) =>
      res.status(200).json({ userId: uuid, followers: 5 })
    );

    const res = await request(app).get(`/analytics/user/${uuid}/popularity`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/user/:userId/uploads', async () => {
    analyticsController.getUserUploads.mockImplementation((req, res) =>
      res.status(200).json({ userId: uuid, totalUploads: 8 })
    );

    const res = await request(app).get(`/analytics/user/${uuid}/uploads`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/user/stats', async () => {
    analyticsController.getUserPersonalStats.mockImplementation((req, res) =>
      res.status(200).json({ totalViews: 50, followers: 20 })
    );

    const res = await request(app).get('/analytics/user/stats');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/top-users', async () => {
    analyticsController.getTopUsers.mockImplementation((req, res) =>
      res.status(200).json([{ userId: uuid, score: 99.5 }])
    );

    const res = await request(app).get('/analytics/top-users?limit=5&period=7d');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/top-pdfs', async () => {
    analyticsController.getTopPdfs.mockImplementation((req, res) =>
      res.status(200).json([{ pdfId: uuid, score: 80.1 }])
    );

    const res = await request(app).get('/analytics/top-pdfs?limit=5&period=7d&sortBy=views');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/trending', async () => {
    analyticsController.getTrendingPdfs.mockImplementation((req, res) =>
      res.status(200).json([{ pdfId: uuid, score: 70 }])
    );

    const res = await request(app).get('/analytics/trending?limit=5');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/categories/top', async () => {
    analyticsController.getTopCategories.mockImplementation((req, res) =>
      res.status(200).json([{ category: 'Science', count: 20 }])
    );

    const res = await request(app).get('/analytics/categories/top?limit=5&period=7d');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/events/:eventType/count', async () => {
    analyticsController.getEventTypeCount.mockImplementation((req, res) =>
      res.status(200).json({ eventType: 'view', count: 200 })
    );

    const res = await request(app).get('/analytics/events/view/count?period=24h');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/stats/summary', async () => {
    analyticsController.getPlatformSummary.mockImplementation((req, res) =>
      res.status(200).json({ totalUsers: 100, totalPdfs: 300 })
    );

    const res = await request(app).get('/analytics/stats/summary');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/engagement/timeline', async () => {
    analyticsController.getEngagementOverTime.mockImplementation((req, res) =>
      res.status(200).json([{ timestamp: new Date().toISOString(), views: 100 }])
    );

    const res = await request(app).get('/analytics/engagement/timeline?period=24h');
    expect(res.statusCode).toBe(200);
  });

  test('GET /analytics/reading/patterns', async () => {
    analyticsController.getReadingPatterns.mockImplementation((req, res) =>
      res.status(200).json([{ hour: 14, readingCount: 22 }])
    );

    const res = await request(app).get('/analytics/reading/patterns?period=7d');
    expect(res.statusCode).toBe(200);
  });
});
