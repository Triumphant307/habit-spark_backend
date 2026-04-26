import request from 'supertest';
import { prisma } from '../config/database.js';

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const { default: app } = await import('../app.js');

interface SuggestionResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  favoritedBy: { userId: string }[];
}

describe('Suggestions API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let tipIds: string[] = [];

  beforeAll(async () => {
    // 1. Setup User
    const user = await prisma.user.create({
      data: {
        email: 'tips-test@example.com',
        name: 'Tips Tester',
        passwordHash: 'hashed',
        preferences: { create: {} }
      },
    });
    userId = user.id;

    const jwt = (await import('jsonwebtoken')).default;
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // 2. Seed Dummy Suggestions
    const suggestions = await Promise.all([
      prisma.suggestion.create({ data: { title: 'Drink Water', description: 'Stay hydrated for energy', category: 'Health' } }),
      prisma.suggestion.create({ data: { title: 'Morning Walk', description: 'Walk 10 mins daily', category: 'Health' } }),
      prisma.suggestion.create({ data: { title: 'Read a Book', description: 'Read 5 pages before bed', category: 'Productivity' } }),
      prisma.suggestion.create({ data: { title: 'Deep Breathing', description: 'Relax your mind', category: 'Mindfulness' } }),
    ]);
    tipIds = suggestions.map(s => s.id);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.userSuggestionFavorite.deleteMany({ where: { userId } });
    await prisma.suggestion.deleteMany({ where: { id: { in: tipIds } } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('GET /suggestions', () => {
    test('should return paginated list of suggestions', async () => {
      const res = await request(app)
        .get('/suggestions?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(4);
      expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(2);
    });

    test('should filter by category', async () => {
      const res = await request(app)
        .get('/suggestions?category=Productivity')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].category).toBe('Productivity');
      // Should not contain mindfulness
      expect(res.body.data.every((s: SuggestionResponse) => s.category === 'Productivity')).toBe(true);
    });

    test('should search by query string (case-insensitive)', async () => {
      const res = await request(app)
        .get('/suggestions?q=WATER')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Drink Water');
    });
  });

  describe('POST /suggestions/fav', () => {
    test('should toggle favorite status', async () => {
      const tipId = tipIds[0];
      
      // 1. Favorite it
      const favRes = await request(app)
        .post('/suggestions/fav')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tipId, isFavorite: true });

      expect(favRes.status).toBe(200);

      // 2. Fetch suggestions and verify favoritedBy is populated
      const listRes = await request(app)
        .get('/suggestions')
        .set('Authorization', `Bearer ${authToken}`);
      
      const favoritedTip = listRes.body.data.find((s: SuggestionResponse) => s.id === tipId);
      expect(favoritedTip.favoritedBy.length).toBe(1);
      expect(favoritedTip.favoritedBy[0].userId).toBe(userId);
    });

    test('should unfavorite correctly', async () => {
      const tipId = tipIds[0];
      
      await request(app)
        .post('/suggestions/fav')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tipId, isFavorite: false });

      const listRes = await request(app)
        .get('/suggestions')
        .set('Authorization', `Bearer ${authToken}`);
      
      const favoritedTip = listRes.body.data.find((s: SuggestionResponse) => s.id === tipId);
      expect(favoritedTip.favoritedBy.length).toBe(0);
    });
  });

  describe('GET /suggestions/categories', () => {
    test('should return unique categories', async () => {
      const res = await request(app)
        .get('/suggestions/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toContain('Health');
      expect(res.body).toContain('Productivity');
      expect(res.body).toContain('Mindfulness');
    });
  });
});
