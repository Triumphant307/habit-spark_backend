import { Router } from "express";
import {
  addHabit,
  listHabits,
  getHabit,
  updateHabit,
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

// Get a single habit by id
router.get("/:id", async (req, res) => {
  try {
    const habit = await getHabit(req.params.id);
    res.json(habit);
  } catch (error) {
    res.status(404).json({ error: error.message });
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

// Update a habit's details
router.patch("/:id", async (req, res) => {
  try {
    const updated = await updateHabit(req.params.id, req.body);
    res.json(updated);
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
