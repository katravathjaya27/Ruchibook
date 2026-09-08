import { Router } from "express";
import {
  getRecipes,
  getRecipeById,
  getRecipesByCategory,
  getRecipesByType,
  searchRecipes,
  findByIngredients,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController";
import { protect, adminOnly } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// IMPORTANT: specific string routes (search, find-by-ingredients,
// category/:x, type/:x) must be declared BEFORE the generic "/:id"
// route, otherwise Express would treat "search" as an :id value.
router.get("/search", asyncHandler(searchRecipes));
router.get("/find-by-ingredients", asyncHandler(findByIngredients));
router.get("/category/:category", asyncHandler(getRecipesByCategory));
router.get("/type/:type", asyncHandler(getRecipesByType));

router.get("/", asyncHandler(getRecipes));
router.get("/:id", asyncHandler(getRecipeById));

router.post("/", protect, adminOnly, asyncHandler(createRecipe));
router.put("/:id", protect, adminOnly, asyncHandler(updateRecipe));
router.delete("/:id", protect, adminOnly, asyncHandler(deleteRecipe));

export default router;
