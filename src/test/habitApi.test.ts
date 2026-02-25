import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/database.js";

describe("Habit API Integration Tests", () => {
  let testHabitId;

  afterAll(async () => {
    // Cleanup any habits created during tests
    if (testHabitId) {
      try {
        await prisma.habit.delete({ where: { id: testHabitId } });
      } catch (err) {
        // Ignore
      }
    }
    await prisma.$disconnect();
  });

  describe("POST /habits", () => {
    test("should create a new habit", async () => {
      const habitData = {
        title: "API Test Habit",
        icon: "🚀",
        category: "Integration",
        target: 7,
      };

      const res = await request(app).post("/habits").send(habitData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe(habitData.title);
      testHabitId = res.body.id;
    });
  });

  describe("GET /habits", () => {
    test("should list all habits", async () => {
      const res = await request(app).get("/habits");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /habits/:id", () => {
    test("should fetch a single habit", async () => {
      const res = await request(app).get(`/habits/${testHabitId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testHabitId);
    });

    test("should return 404 for non-existent habit", async () => {
      const res = await request(app).get("/habits/non-existent-id");
      expect(res.status).toBe(404);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toBe("Habit not found");
    });
  });

  describe("POST /habits - Validation", () => {
    test("should return 400 if title is missing", async () => {
      const res = await request(app)
        .post("/habits")
        .send({ icon: "🍎", category: "Health" });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toContain("title");
    });

    test("should return 400 if icon is missing", async () => {
      const res = await request(app)
        .post("/habits")
        .send({ title: "No Icon", category: "Health" });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toContain("icon");
    });

    test("should return 400 if category is missing", async () => {
      const res = await request(app)
        .post("/habits")
        .send({ title: "No Category", icon: "🍎" });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toContain("category");
    });
  });

  describe("PATCH /habits/:id/complete - Negative", () => {
    test("should return 404 for toggling non-existent habit", async () => {
      const res = await request(app)
        .patch("/habits/non-existent-id/complete")
        .send({ date: "2026-02-22" });
      expect(res.status).toBe(404);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toBe("Habit not found");
    });
  });

  describe("PATCH /habits/:id - Negative", () => {
    test("should return 404 when updating non-existent habit", async () => {
      const res = await request(app)
        .patch("/habits/non-existent-id")
        .send({ title: "New Title" });
      expect(res.status).toBe(404);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toBe("Habit not found");
    });
  });

  describe("PATCH /habits/:id", () => {
    test("should update a habit", async () => {
      const updateData = { title: "Updated API Habit" };
      const res = await request(app)
        .patch(`/habits/${testHabitId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updateData.title);
    });
  });

  describe("PATCH /habits/:id/complete", () => {
    test("should toggle habit completion", async () => {
      const res = await request(app)
        .patch(`/habits/${testHabitId}/complete`)
        .send({ date: "2026-02-22" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("isNowCompleted");
      expect(res.body).toHaveProperty("streak");
    });
  });

  describe("DELETE /habits/:id", () => {
    test("should delete a habit", async () => {
      const res = await request(app).delete(`/habits/${testHabitId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/);

      // Verify deletion
      const checkRes = await request(app).get(`/habits/${testHabitId}`);
      expect(checkRes.status).toBe(404);
      testHabitId = null;
    });
  });
});
