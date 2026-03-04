import { prisma } from '../config/database.js';

describe('Database Heartbeat', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to the database and perform a simple check', async () => {
    // Attempt a raw query to verify the connection is alive
    const result = (await prisma.$queryRaw`SELECT 1 as connected`) as Array<{
      connected: number;
    }>;
    expect(result[0].connected).toBe(1);
  });

  test('should be able to reach the Habit table', async () => {
    // Attempt to count habits (or just list many with limit 0)
    // This confirms the schema is properly linked and recognized
    const count = await prisma.habit.count();
    expect(typeof count).toBe('number');
  });
});
