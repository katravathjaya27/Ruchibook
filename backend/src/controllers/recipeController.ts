import { Request, Response } from "express";
import Recipe from "../models/Recipe";
import { rankRecipesByIngredients } from "../utils/matchIngredients";

// GET /api/recipes
// Supports optional query params: category, foodType, maxTime, calorieLevel, page, limit
export const getRecipes = async (req: Request, res: Response) => {
  const { category, foodType, maxTime, calorieLevel, page = "1", limit = "20" } = req.query;

  const query: Record<string, any> = {};
  if (category) query.category = category;
  if (foodType) query.foodType = foodType;
  if (maxTime) {
    query.$expr = {
      $lte: [{ $add: ["$preparationTime", "$cookingTime"] }, Number(maxTime)],
    };
  }
  if (calorieLevel === "low") query["nutrition.calories"] = { $lt: 250 };
  if (calorieLevel === "medium") query["nutrition.calories"] = { $gte: 250, $lte: 450 };
  if (calorieLevel === "high") query["nutrition.calories"] = { $gt: 450 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [recipes, total] = await Promise.all([
    Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Recipe.countDocuments(query),
  ]);

  res.json({ recipes, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

// GET /api/recipes/:id
export const getRecipeById = async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }
  res.json(recipe);
};

// GET /api/recipes/category/:category
export const getRecipesByCategory = async (req: Request, res: Response) => {
  const recipes = await Recipe.find({ category: req.params.category }).sort({
    createdAt: -1,
  });
  res.json({ recipes, total: recipes.length });
};

// GET /api/recipes/type/:type
export const getRecipesByType = async (req: Request, res: Response) => {
  const recipes = await Recipe.find({ foodType: req.params.type }).sort({
    createdAt: -1,
  });
  res.json({ recipes, total: recipes.length });
};

// GET /api/recipes/search?q=...
// Searches recipe name (all languages), description, category, food type
// and ingredient names.
export const searchRecipes = async (req: Request, res: Response) => {
  const q = String(req.query.q || "").trim();
  if (!q) {
    return res.json({ recipes: [], total: 0 });
  }

  const regex = new RegExp(q, "i");
  const recipes = await Recipe.find({
    $or: [
      { "name.en": regex },
      { "name.te": regex },
      { "name.hi": regex },
      { "description.en": regex },
      { category: regex },
      { foodType: regex },
      { "ingredients.name.en": regex },
    ],
  }).sort({ createdAt: -1 });

  res.json({ recipes, total: recipes.length });
};

// GET /api/recipes/find-by-ingredients?ingredients=rice,tomato,onion
export const findByIngredients = async (req: Request, res: Response) => {
  const raw = String(req.query.ingredients || "");
  const ingredients = raw
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  if (ingredients.length === 0) {
    return res.status(400).json({
      message: "Provide at least one ingredient, e.g. ?ingredients=rice,tomato",
    });
  }

  const allRecipes = await Recipe.find();
  const ranked = rankRecipesByIngredients(allRecipes, ingredients);

  res.json({
    total: ranked.length,
    results: ranked.map((r) => ({
      recipe: r.recipe,
      matchPercentage: r.matchPercentage,
      availableIngredients: r.availableIngredients,
      missingIngredients: r.missingIngredients,
      category: r.category,
    })),
  });
};

// POST /api/recipes  (admin only)
export const createRecipe = async (req: Request, res: Response) => {
  const recipe = await Recipe.create(req.body);
  res.status(201).json(recipe);
};

// PUT /api/recipes/:id  (admin only)
export const updateRecipe = async (req: Request, res: Response) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }
  res.json(recipe);
};

// DELETE /api/recipes/:id  (admin only)
export const deleteRecipe = async (req: Request, res: Response) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }
  res.json({ message: "Recipe deleted" });
};
