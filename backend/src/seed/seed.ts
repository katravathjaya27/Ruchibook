import dotenv from "dotenv";
import mongoose from "mongoose";
import Recipe from "../models/Recipe";
import User from "../models/User";
import { sampleRecipes } from "./sampleRecipes";

dotenv.config();

/**
 * Run with: npm run seed  (from the backend/ folder)
 *
 * This wipes existing recipes and re-inserts the 20 sample recipes, and
 * creates a default admin account if one doesn't already exist.
 */
const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Copy backend/.env.example to backend/.env first.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding...");

  await Recipe.deleteMany({});
  await Recipe.insertMany(sampleRecipes);
  console.log(`Inserted ${sampleRecipes.length} sample recipes.`);

  const adminEmail = "admin@ruchibook.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "RuchiBook Admin",
      email: adminEmail,
      password: "admin123", // hashed automatically by the User model
      role: "admin",
    });
    console.log(`Created default admin account -> email: ${adminEmail}, password: admin123`);
    console.log("IMPORTANT: change this password after first login.");
  } else {
    console.log("Admin account already exists, skipping creation.");
  }

  await mongoose.disconnect();
  console.log("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
