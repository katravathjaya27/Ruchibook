import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import recipeRoutes from "./routes/recipeRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { autoSeedIfEmpty } from "./seed/autoSeed";

dotenv.config();

const app = express();

// Allow the frontend (running on a different port) to call this API.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Simple health check -- useful to confirm the server is running.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "RuchiBook API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Populates sample recipes + default admin on first boot only.
  // Wrapped in try/catch so that if seeding fails for any reason
  // (e.g. a data validation issue), the server still starts and
  // logs the real error -- instead of silently never starting.
  try {
    await autoSeedIfEmpty();
  } catch (err) {
    console.error("Auto-seeding failed. The server will still start, but the database may be missing sample data.");
    console.error(err);
  }

  app.listen(PORT, () => {
    console.log(`RuchiBook API listening on http://localhost:${PORT}`);
  });
});
