import Recipe from "../models/Recipe";
import User from "../models/User";
import { sampleRecipes } from "./sampleRecipes";

/**
 * Runs automatically every time the server starts (see server.ts).
 * It's safe to call on every boot because it only inserts data when
 * the database is empty -- this is what makes a freshly deployed
 * backend "ready to use" immediately, with no manual seed step.
 *
 * To force a full reset (wipe + reinsert), use `npm run seed` instead,
 * which is the destructive version meant to be run manually.
 */
export const autoSeedIfEmpty = async (): Promise<void> => {
  const recipeCount = await Recipe.countDocuments();
  if (recipeCount === 0) {
    await Recipe.insertMany(sampleRecipes);
    console.log(`Auto-seeded ${sampleRecipes.length} sample recipes (database was empty).`);
  }

  const adminEmail = "admin@ruchibook.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD || "admin123";
    await User.create({
      name: "RuchiBook Admin",
      email: adminEmail,
      password, // hashed automatically by the User model's pre-save hook
      role: "admin",
    });
    console.log(`Auto-created default admin account -> email: ${adminEmail}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log("Using default password 'admin123' -- set ADMIN_PASSWORD to choose your own, and change it after first login.");
    }
  }
};
