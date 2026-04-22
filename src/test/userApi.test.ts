import request from 'supertest';
import { prisma } from '../config/database.js';

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const { default: app } = await import('../app.js');

describe('User API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create a user who hasn't onboarded yet
    const user = await prisma.user.create({
      data: {
        email: 'onboard-test@example.com',
        passwordHash: 'hashed',
        preferences: {
            create: {}
        }
      },
    });
    userId = user.id;

    const jwt = (await import('jsonwebtoken')).default;
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('POST /user/onboarding', () => {
    test('should complete 5-step onboarding', async () => {
      const onboardingData = {
        nickname: 'TJ',
        goal: 'Improve Fitness',
        commitment: 'Daily',
        firstHabit: {
          title: 'Morning Pushups',
          icon: '💪',
          category: 'Fitness',
          target: 10
        }
      };

      const res = await request(app)
        .post('/user/onboarding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(onboardingData);

      expect(res.status).toBe(200);
      expect(res.body.nickname).toBe('TJ');
      expect(res.body.firstHabit.title).toBe('Morning Pushups');

      // Verify DB state
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true, habits: true }
      });

      expect(updatedUser?.name).toBe('TJ');
      expect(updatedUser?.preferences?.onboardingGoal).toBe('Improve Fitness');
      expect(updatedUser?.habits.length).toBe(1);
    });
  });

  describe('GET /user/preferences', () => {
    test('should return user settings', async () => {
      const res = await request(app)
        .get('/user/preferences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('theme');
      expect(res.body).toHaveProperty('sidebarCollapsed');
    });
  });

  describe('PATCH /user/preferences', () => {
    test('should update theme', async () => {
      const res = await request(app)
        .patch('/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'dark', sidebarCollapsed: true });

      expect(res.status).toBe(200);
      expect(res.body.theme).toBe('dark');
      expect(res.body.sidebarCollapsed).toBe(true);
    });
  });
});
