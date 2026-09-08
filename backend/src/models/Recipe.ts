import mongoose, { Document, Schema } from "mongoose";

/**
 * Almost every piece of text in a recipe (name, description, ingredient
 * names, steps, benefits) needs to exist in three languages: English,
 * Telugu and Hindi. Instead of creating three separate fields for every
 * bit of text, we use a small "LocalizedString" shape: { en, te, hi }.
 * The frontend picks whichever key matches the currently selected
 * language.
 */
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

export interface IIngredient {
  name: LocalizedString;
  quantity: number;
  unit: string;
  // A "pantry staple" (salt, water, oil, common spices) is treated as
  // optional when matching recipes against the user's selected
  // ingredients -- see utils/matchIngredients.ts
  isPantryStaple: boolean;
}

export interface IRecipe extends Document {
  name: LocalizedString;
  description: LocalizedString;
  category: "pantry" | "breakfast" | "lunch" | "dinner";
  foodType: "vegetarian" | "non-vegetarian" | "other";
  image: string;
  preparationTime: number; // minutes
  cookingTime: number; // minutes
  servings: number;
  ingredients: IIngredient[];
  preparationSteps: LocalizedStringArray;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
  };
  benefits: LocalizedStringArray;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const localizedStringSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    te: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const localizedStringArraySchema = new Schema(
  {
    en: { type: [String], required: true, default: [] },
    te: { type: [String], required: true, default: [] },
    hi: { type: [String], required: true, default: [] },
  },
  { _id: false }
);

const ingredientSchema = new Schema<IIngredient>(
  {
    name: { type: localizedStringSchema, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    isPantryStaple: { type: Boolean, default: false },
  },
  { _id: false }
);

const recipeSchema = new Schema<IRecipe>(
  {
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true },
    category: {
      type: String,
      enum: ["pantry", "breakfast", "lunch", "dinner"],
      required: true,
    },
    foodType: {
      type: String,
      enum: ["vegetarian", "non-vegetarian", "other"],
      required: true,
    },
    image: { type: String, required: true },
    preparationTime: { type: Number, required: true, min: 0 },
    cookingTime: { type: Number, required: true, min: 0 },
    servings: { type: Number, required: true, min: 1, default: 2 },
    ingredients: { type: [ingredientSchema], required: true, default: [] },
    preparationSteps: { type: localizedStringArraySchema, required: true },
    nutrition: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0 },
      fat: { type: Number, required: true, min: 0 },
      carbohydrates: { type: Number, required: true, min: 0 },
      fiber: { type: Number, required: true, min: 0 },
    },
    benefits: { type: localizedStringArraySchema, required: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index lets us do fast keyword search across name/description in
// all three languages, plus ingredient names.
recipeSchema.index({
  "name.en": "text",
  "name.te": "text",
  "name.hi": "text",
  "description.en": "text",
  "ingredients.name.en": "text",
});

export default mongoose.model<IRecipe>("Recipe", recipeSchema);
