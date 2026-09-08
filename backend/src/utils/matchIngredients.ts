import { IRecipe } from "../models/Recipe";

/**
 * HOW THE "WHAT CAN I COOK?" MATCHING WORKS
 * ------------------------------------------
 * 1. Normalize everything to lowercase, trimmed strings so "Tomato",
 *    " tomato", and "TOMATO " all count as the same ingredient.
 * 2. A recipe's required ingredients are anything NOT marked as a
 *    pantry staple (salt, water, oil, common spices). Staples are
 *    ignored when calculating the match, because almost everyone has
 *    them and it would be unfair to say "you're missing salt".
 * 3. matchPercentage = (required ingredients the user has) /
 *    (total required ingredients) * 100
 * 4. Recipes are grouped into three buckets:
 *      - "you-can-make" : 90% or more of required ingredients present
 *      - "almost-there" : 50% - 89%
 *      - "you-might-like": below 50% but at least one real match
 *    Recipes with ZERO matching ingredients are excluded entirely.
 */

export type MatchCategory = "you-can-make" | "almost-there" | "you-might-like";

export interface IngredientMatchResult {
  recipe: IRecipe;
  matchPercentage: number;
  availableIngredients: string[];
  missingIngredients: string[];
  category: MatchCategory;
}

const normalize = (value: string): string => value.trim().toLowerCase();

export const normalizeIngredientList = (ingredients: string[]): Set<string> =>
  new Set(ingredients.map(normalize).filter(Boolean));

export const matchRecipeToIngredients = (
  recipe: IRecipe,
  userIngredients: Set<string>
): IngredientMatchResult | null => {
  // Split the recipe's ingredients into "must count towards match"
  // (non-staples) and staples (ignored for scoring, but still shown in
  // the full ingredient list on the recipe detail page).
  const requiredIngredients = recipe.ingredients.filter(
    (ing) => !ing.isPantryStaple
  );

  const relevantIngredients =
    requiredIngredients.length > 0 ? requiredIngredients : recipe.ingredients;

  const available: string[] = [];
  const missing: string[] = [];

  for (const ingredient of relevantIngredients) {
    const ingredientName = ingredient.name.en;
    if (userIngredients.has(normalize(ingredientName))) {
      available.push(ingredientName);
    } else {
      missing.push(ingredientName);
    }
  }

  if (available.length === 0) {
    // No overlap at all -- don't show this recipe.
    return null;
  }

  const matchPercentage = Math.round(
    (available.length / relevantIngredients.length) * 100
  );

  let category: MatchCategory;
  if (matchPercentage >= 90) {
    category = "you-can-make";
  } else if (matchPercentage >= 50) {
    category = "almost-there";
  } else {
    category = "you-might-like";
  }

  return {
    recipe,
    matchPercentage,
    availableIngredients: available,
    missingIngredients: missing,
    category,
  };
};

export const rankRecipesByIngredients = (
  recipes: IRecipe[],
  selectedIngredients: string[]
): IngredientMatchResult[] => {
  const userIngredients = normalizeIngredientList(selectedIngredients);

  const results = recipes
    .map((recipe) => matchRecipeToIngredients(recipe, userIngredients))
    .filter((r): r is IngredientMatchResult => r !== null);

  // Highest match percentage first.
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return results;
};
