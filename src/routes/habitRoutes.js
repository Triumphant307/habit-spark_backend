import { Router } from "express";
import {
  addHabit,
  listHabits,
  completeHabit,
  deleteHabit,
} from "../services/habitService.js";

const router = Router();

// Get all habits
router.get("/", async (req, res) => {
  try {
    const habits = await listHabits();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new habit
router.post("/", async (req, res) => {
  try {
    const habit = await addHabit(req.body);
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle habit completion for a date
router.patch("/:id/complete", async (req, res) => {
  try {
    const { date } = req.body;
    const result = await completeHabit(req.params.id, date);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a habit
router.delete("/:id", async (req, res) => {
  try {
    const result = await deleteHabit(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
