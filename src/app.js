import express from "express";
import cors from "cors";
import habitRoutes from "./routes/habitRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Mount habit routes
app.use("/habits", habitRoutes);

export default app;
