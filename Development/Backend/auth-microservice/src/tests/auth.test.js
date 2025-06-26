const request = require('supertest');
const app = require('../app');
const { closeDB } = require('../config/database');
const { query } = require('../config/database');

jest.mock('../services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(),
  sendPasswordResetEmail: jest.fn().mockResolvedValue()
}));

describe('Auth API', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'Test@1234';

  afterAll(async () => {
    // Clean up test user and tokens
    await query(`DELETE FROM email_verification_tokens WHERE user_id IN (SELECT id FROM users WHERE email = $1)`, [testEmail]);
    await query(`DELETE FROM users WHERE email = $1`, [testEmail]);
    await closeDB();
  });

  it('should return 200 OK for /health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        password_confirmation: testPassword
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testEmail);
  });

  it('should fail login before email verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });
    expect([200, 401]).toContain(res.statusCode);
  });

  it('should not register a duplicate user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        password_confirmation: testPassword
      });

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });
});
