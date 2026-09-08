import { Router } from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getPantry,
  savePantry,
  removePantryItem,
} from "../controllers/userController";
import { protect } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// All routes here require the user to be logged in.
router.use(protect);

router.get("/favorites", asyncHandler(getFavorites));
router.post("/favorites/:recipeId", asyncHandler(addFavorite));
router.delete("/favorites/:recipeId", asyncHandler(removeFavorite));

router.get("/pantry", asyncHandler(getPantry));
router.post("/pantry", asyncHandler(savePantry));
router.delete("/pantry/:ingredientId", asyncHandler(removePantryItem));

export default router;
