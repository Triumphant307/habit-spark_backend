import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  addHabit,
  listHabits,
  completeHabit,
  deleteHabit,
} from "./services/habitService.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

//Get all habits
app.get("/habits", async (req, res) => {
  try {
    const habits = await listHabits();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Add a new habit
app.post("/habits", async (req, res) => {
  try {
    const habit = await addHabit(req.body);
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Toogl habit completion
app.patch("/habits/:id/complete", async (req, res) => {
  try {
    const { date } = req.body;
    const habit = await completeHabit(req.params.id, date);
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/habits/:id", async (req, res) => {
  try {
    const habit = await deleteHabit(req.params.id);
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
