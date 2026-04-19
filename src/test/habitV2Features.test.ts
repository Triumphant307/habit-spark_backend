import request from 'supertest';
import { prisma } from '../config/database.js';

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const { default: app } = await import('../app.js');

describe('Habit V2 Features Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let habitId1: string;
  let habitId2: string;

  beforeAll(async () => {
    // Setup user and habits
    const user = await prisma.user.create({
      data: {
        email: 'v2-test@example.com',
        name: 'V2 Tester',
        passwordHash: 'hashed',
      },
    });
    userId = user.id;

    const jwt = (await import('jsonwebtoken')).default;
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    const h1 = await prisma.habit.create({
      data: {
        title: 'Habit 1',
        icon: '1',
        category: 'Test',
        target: 1,
        userId,
        slug: 'habit-1',
        startDate: new Date(),
        order: 0,
      },
    });
    habitId1 = h1.id;

    const h2 = await prisma.habit.create({
      data: {
        title: 'Habit 2',
        icon: '2',
        category: 'Test',
        target: 1,
        userId,
        slug: 'habit-2',
        startDate: new Date(),
        order: 1,
      },
    });
    habitId2 = h2.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('POST /habits/:id/reset', () => {
    test('should reset habit streak', async () => {
      // Set streak first
      await prisma.habit.update({
        where: { id: habitId1 },
        data: { streak: 5 },
      });

      const res = await request(app)
        .post(`/habits/${habitId1}/reset`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.streak).toBe(0);
    });
  });

  describe('GET /habits/:id/stats', () => {
    test('should return habit stats', async () => {
      // Add some entries
      const today = new Date();
      today.setUTCHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setUTCDate(today.getUTCDate() - 1);

      await prisma.habitEntry.create({ data: { habitId: habitId1, date: today } });
      await prisma.habitEntry.create({ data: { habitId: habitId1, date: yesterday } });

      const res = await request(app)
        .get(`/habits/${habitId1}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalCompletions).toBe(2);
      expect(res.body).toHaveProperty('currentStreak');
      expect(res.body).toHaveProperty('longestStreak');
      expect(res.body).toHaveProperty('completionRate');
    });
  });

  describe('POST /habits/reorder', () => {
    test('should reorder habits', async () => {
      const res = await request(app)
        .post('/habits/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ idArray: [habitId2, habitId1] });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/successfully/);

      // Verify order
      const h1 = await prisma.habit.findUnique({ where: { id: habitId1 } });
      const h2 = await prisma.habit.findUnique({ where: { id: habitId2 } });

      expect(h1?.order).toBe(1);
      expect(h2?.order).toBe(0);
    });

    test('should fail if habit belongs to another user', async () => {
        const otherUser = await prisma.user.create({
            data: { email: 'other@example.com', passwordHash: 'hash' }
        });
        const otherHabit = await prisma.habit.create({
            data: { title: 'Other', icon: 'O', category: 'C', target: 1, userId: otherUser.id, slug: 'other', startDate: new Date() }
        });

        const res = await request(app)
          .post('/habits/reorder')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ idArray: [otherHabit.id] });

        expect(res.status).toBe(400);

        await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
