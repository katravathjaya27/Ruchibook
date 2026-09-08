import { Request, Response } from "express";
import User from "../models/User";
import Recipe from "../models/Recipe";

// GET /api/users/favorites
export const getFavorites = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).populate("favorites");
  res.json({ favorites: user?.favorites || [] });
};

// POST /api/users/favorites/:recipeId
export const addFavorite = async (req: Request, res: Response) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  const user = await User.findById(req.user!._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const alreadyFavorited = user.favorites.some(
    (id) => id.toString() === recipeId
  );

  if (!alreadyFavorited) {
    user.favorites.push(recipe._id as any);
    await user.save();
  }

  res.status(201).json({ favorites: user.favorites });
};

// DELETE /api/users/favorites/:recipeId
export const removeFavorite = async (req: Request, res: Response) => {
  const { recipeId } = req.params;

  const user = await User.findById(req.user!._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.favorites = user.favorites.filter((id) => id.toString() !== recipeId);
  await user.save();

  res.json({ favorites: user.favorites });
};

// GET /api/users/pantry
export const getPantry = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  res.json({ pantry: user?.pantry || [] });
};

// POST /api/users/pantry   body: { ingredients: string[] }
// Replaces the user's saved pantry with the provided list.
export const savePantry = async (req: Request, res: Response) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ message: "ingredients must be an array of strings" });
  }

  const user = await User.findById(req.user!._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.pantry = Array.from(
    new Set(ingredients.map((i: string) => String(i).trim().toLowerCase()).filter(Boolean))
  );
  await user.save();

  res.json({ pantry: user.pantry });
};

// DELETE /api/users/pantry/:ingredientId
// (ingredientId here is the ingredient name itself, URL-encoded)
export const removePantryItem = async (req: Request, res: Response) => {
  const ingredient = decodeURIComponent(req.params.ingredientId).toLowerCase();

  const user = await User.findById(req.user!._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.pantry = user.pantry.filter((i) => i !== ingredient);
  await user.save();

  res.json({ pantry: user.pantry });
};
