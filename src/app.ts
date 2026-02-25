import express from "express";
import cors from "cors";
import habitRoutes from "./routes/habitRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
