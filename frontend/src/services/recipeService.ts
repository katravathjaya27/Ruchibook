import api from "./api";
import { Recipe, Category, FoodType, IngredientMatchResult } from "../types";

export interface RecipeFilters {
  category?: Category;
  foodType?: FoodType;
  maxTime?: number;
  calorieLevel?: "low" | "medium" | "high";
  page?: number;
  limit?: number;
}

export const recipeService = {
  async getAll(filters: RecipeFilters = {}) {
    const { data } = await api.get<{ recipes: Recipe[]; total: number }>("/recipes", {
      params: filters,
    });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Recipe>(`/recipes/${id}`);
    return data;
  },

  async getByCategory(category: Category) {
    const { data } = await api.get<{ recipes: Recipe[]; total: number }>(
      `/recipes/category/${category}`
    );
    return data;
  },

  async getByType(foodType: FoodType) {
    const { data } = await api.get<{ recipes: Recipe[]; total: number }>(
      `/recipes/type/${foodType}`
    );
    return data;
  },

  async search(q: string) {
    const { data } = await api.get<{ recipes: Recipe[]; total: number }>("/recipes/search", {
      params: { q },
    });
    return data;
  },

  async findByIngredients(ingredients: string[]) {
    const { data } = await api.get<{ total: number; results: IngredientMatchResult[] }>(
      "/recipes/find-by-ingredients",
      { params: { ingredients: ingredients.join(",") } }
    );
    return data;
  },

  async create(recipe: Partial<Recipe>) {
    const { data } = await api.post<Recipe>("/recipes", recipe);
    return data;
  },

  async update(id: string, recipe: Partial<Recipe>) {
    const { data } = await api.put<Recipe>(`/recipes/${id}`, recipe);
    return data;
  },

  async remove(id: string) {
    await api.delete(`/recipes/${id}`);
  },
};
