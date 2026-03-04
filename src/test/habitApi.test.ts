import request from 'supertest';
import app from '../app.js';
import { prisma } from '../config/database.js';

describe('Habit API Integration Tests', () => {
  // Definite assignment — populated in the create test before any usage
  let testHabitId!: string;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user for integration tests
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password', // Mocked for integration test
      },
    });
    testUserId = testUser.id;

    // Generate a mock JWT for the test user
    // Note: In a real app, we'd use the actual signToken utility
    const jwt = (await import('jsonwebtoken')).default;
    authToken = jwt.sign(
      { userId: testUserId },
      process.env.JWT_SECRET || 'test-secret',
      {
        expiresIn: '1h',
      },
    );
  });

  afterAll(async () => {
    // Cleanup any habits created during tests
    if (testHabitId) {
      try {
        await prisma.habit.delete({ where: { id: testHabitId } });
      } catch (err) {
        // Ignore
      }
    }
    // Cleanup test user
    if (testUserId) {
      try {
        await prisma.user.delete({ where: { id: testUserId } });
      } catch (err) {
        // Ignore
      }
    }
    await prisma.$disconnect();
  });

  describe('POST /habits', () => {
    test('should create a new habit', async () => {
      const habitData = {
        title: 'API Test Habit',
        icon: '🚀',
        category: 'Integration',
        target: 7,
      };

      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(habitData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(habitData.title);
      expect(res.body.userId).toBe(testUserId);
      testHabitId = res.body.id;
    });
  });

  describe('GET /habits', () => {
    test('should list all habits', async () => {
      const res = await request(app)
        .get('/habits')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /habits/:id', () => {
    test('should fetch a single habit', async () => {
      const res = await request(app)
        .get(`/habits/${testHabitId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testHabitId);
    });

    test('should return 404 for non-existent habit', async () => {
      const res = await request(app)
        .get('/habits/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('Habit not found');
    });
  });

  describe('POST /habits - Validation', () => {
    test('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ icon: '🍎', category: 'Health' });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('title');
    });

    test('should return 400 if icon is missing', async () => {
      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'No Icon', category: 'Health' });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('icon');
    });

    test('should return 400 if category is missing', async () => {
      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'No Category', icon: '🍎' });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('category');
    });
  });

  describe('PATCH /habits/:id/complete - Negative', () => {
    test('should return 404 for toggling non-existent habit', async () => {
      const res = await request(app)
        .patch('/habits/non-existent-id/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2026-02-22' });
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('Habit not found');
    });
  });

  describe('PATCH /habits/:id - Negative', () => {
    test('should return 404 when updating non-existent habit', async () => {
      const res = await request(app)
        .patch('/habits/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Title' });
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('Habit not found');
    });
  });

  describe('PATCH /habits/:id', () => {
    test('should update a habit', async () => {
      const updateData = { title: 'Updated API Habit' };
      const res = await request(app)
        .patch(`/habits/${testHabitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updateData.title);
    });
  });

  describe('PATCH /habits/:id/complete', () => {
    test('should toggle habit completion', async () => {
      const res = await request(app)
        .patch(`/habits/${testHabitId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2026-02-22' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isNowCompleted');
      expect(res.body).toHaveProperty('streak');
    });
  });

  describe('DELETE /habits/:id', () => {
    test('should delete a habit', async () => {
      const res = await request(app)
        .delete(`/habits/${testHabitId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/);

      // Verify deletion
      const checkRes = await request(app)
        .get(`/habits/${testHabitId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(checkRes.status).toBe(404);
      testHabitId = ''; // empty string is falsy — afterAll guard skips re-deletion
    });
  });
});
