import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  addHabit,
  listHabits,
  completeHabit,
} from "./services/habitService.js";

dotenv.config();

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
app.get("/habits", (req, res) => {
  res.json(listHabits());
});

//Add a new habit
app.post("/habits", (req, res) => {
  try {
    const habit = addHabit(req.body);
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Toogl habit completion
app.patch("/habits/:id/complete", (req, res) => {
  try {
    const { date } = req.body;
    const habit = completeHabit(req.params.id, date);
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

