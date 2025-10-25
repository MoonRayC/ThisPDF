const request = require('supertest');
const app = require('../../app');

// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('../../services/email.service');
jest.mock('../../config/database');

const UserModel = require('../../models/user.model');
const { sendVerificationEmail } = require('../../services/email.service');
const { withTransaction } = require('../../config/database');

describe('Auth Controller - Register', () => {
  const mockEmail = 'test@example.com';
  const mockPassword = '@securePassword123';
  const mockUserId = 123;
  const mockUser = {
    id: mockUserId,
    email: mockEmail,
    is_email_verified: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user and return access token', async () => {
    UserModel.getUserByEmail.mockResolvedValue(null);
    UserModel.createUser.mockResolvedValue(mockUserId);
    UserModel.createEmailVerificationToken.mockResolvedValue();
    UserModel.getUserById.mockResolvedValue(mockUser);
    sendVerificationEmail.mockResolvedValue();

    withTransaction.mockImplementation(async (cb) => {
      return await cb();
    });

    const res = await request(app)
      .post('/api/auth/register') 
      .send({ email: mockEmail, password: mockPassword });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(mockEmail);
    expect(sendVerificationEmail).toHaveBeenCalledWith(mockEmail, expect.any(String));
  });

  it('should return 422 if email is already registered', async () => {
    UserModel.getUserByEmail.mockResolvedValue({ id: 1, email: mockEmail });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: mockEmail, password: mockPassword });

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });

  it('should return 500 on internal server error', async () => {
    UserModel.getUserByEmail.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: mockEmail, password: mockPassword });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal server error');
  });
});
