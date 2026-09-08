import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Recipe } from "../types";
import { localize } from "../utils/localize";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

interface Props {
  recipe: Recipe;
}

const RecipeCard: React.FC<Props> = ({ recipe }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe._id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(recipe);
  };

  const totalTime = recipe.preparationTime + recipe.cookingTime;

  return (
    <Link
      to={`/recipe/${recipe._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col border border-orange-100"
    >
      <div className="relative h-44 overflow-hidden bg-orange-100">
        <img
          src={recipe.image}
          alt={localize(recipe.name, i18n.language)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${
            recipe.foodType === "vegetarian"
              ? "bg-leaf-500 text-white"
              : recipe.foodType === "non-vegetarian"
              ? "bg-red-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {recipe.foodType === "vegetarian"
            ? t("home.vegetarian")
            : recipe.foodType === "non-vegetarian"
            ? t("home.nonVegetarian")
            : t("home.other")}
        </span>
        {user && (
          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow"
          >
            {favorited ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 line-clamp-2">
          {localize(recipe.name, i18n.language)}
        </h3>
        <p className="text-xs text-gray-500 mt-1 capitalize">{recipe.category}</p>

        <div className="flex items-center gap-3 text-xs text-gray-600 mt-3">
          <span>⏱ {totalTime} {t("recipeCard.mins")}</span>
          <span>🔥 {recipe.nutrition.calories} {t("recipeCard.calories")}</span>
          <span>💪 {recipe.nutrition.protein}{t("recipeCard.protein")}</span>
        </div>

        <span className="mt-auto pt-3 text-sm font-semibold text-primary-700 group-hover:underline">
          {t("recipeCard.viewRecipe")} →
        </span>
      </div>
    </Link>
  );
};

export default RecipeCard;
