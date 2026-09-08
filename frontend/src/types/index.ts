export interface LocalizedString {
  en: string;
  te: string;
  hi: string;
}

export interface LocalizedStringArray {
  en: string[];
  te: string[];
  hi: string[];
}

export interface Ingredient {
  name: LocalizedString;
  quantity: number;
  unit: string;
  isPantryStaple: boolean;
}

export type Category = "pantry" | "breakfast" | "lunch" | "dinner";
export type FoodType = "vegetarian" | "non-vegetarian" | "other";

export interface Recipe {
  _id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: Category;
  foodType: FoodType;
  image: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  ingredients: Ingredient[];
  preparationSteps: LocalizedStringArray;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
  };
  benefits: LocalizedStringArray;
  isPopular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export type MatchCategory = "you-can-make" | "almost-there" | "you-might-like";

export interface IngredientMatchResult {
  recipe: Recipe;
  matchPercentage: number;
  availableIngredients: string[];
  missingIngredients: string[];
  category: MatchCategory;
}

export type Language = "en" | "te" | "hi";
