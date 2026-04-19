import request from 'supertest';
import { prisma } from '../config/database.js';

// Ensure JWT_SECRET is set before importing app
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const { default: app } = await import('../app.js');

describe('Auth API Integration Tests', () => {
  const testUser = {
    email: 'auth-test@example.com',
    password: 'password123',
    nickname: 'AuthTester',
  };

  afterAll(async () => {
    try {
      await prisma.user.delete({ where: { email: testUser.email } });
    } catch (err) {
      // Ignore
    }
    await prisma.$disconnect();
  });

  describe('POST /auth/signup', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.nickname);
      expect(res.body).toHaveProperty('token');
    });

    test('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    test('should login successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      token = res.body.token;
    });

    test('should return current user profile', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });

    test('should fail without token', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    test('should return success message', async () => {
      const res = await request(app).post('/auth/logout');
      // Note: In our current simple implementation, it doesn't strictly need auth for success return,
      // but the route is protected by 'authenticate' middleware.
      
      // Let's get a token first
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      const token = loginRes.body.token;

      const logoutRes = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe('Logged out successfully');
    });
  });
});
