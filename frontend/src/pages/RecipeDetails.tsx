import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { recipeService } from "../services/recipeService";
import { Recipe } from "../types";
import { localize, localizeArray } from "../utils/localize";
import { Loader, ErrorState } from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

// Formats a scaled ingredient quantity, e.g. 1.5 -> "1.5", 2 -> "2"
const formatQuantity = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
};

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [servings, setServings] = useState(2);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    recipeService
      .getById(id)
      .then((data) => {
        setRecipe(data);
        setServings(data.servings);
      })
      .catch(() => setError(t("recipeDetails.notFound")))
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) return <Loader message={t("recipeDetails.loading") as string} />;
  if (error || !recipe) return <ErrorState message={error || (t("recipeDetails.notFound") as string)} />;

  const scale = servings / recipe.servings;
  const favorited = isFavorite(recipe._id);
  const totalTime = recipe.preparationTime + recipe.cookingTime;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: localize(recipe.name, i18n.language), url });
      } catch {
        /* user cancelled share -- ignore */
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <img
        src={recipe.image}
        alt={localize(recipe.name, i18n.language)}
        className="w-full h-64 sm:h-80 object-cover rounded-2xl"
      />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mb-2 ${
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
          <h1 className="text-3xl font-extrabold text-gray-900">
            {localize(recipe.name, i18n.language)}
          </h1>
          <p className="text-gray-500 mt-1 capitalize">{recipe.category}</p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {user && (
            <button
              onClick={() => toggleFavorite(recipe)}
              className="px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 text-sm font-medium flex items-center gap-1.5"
            >
              {favorited ? "❤️" : "🤍"} {t("recipeDetails.favorite")}
            </button>
          )}
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 text-sm font-medium"
          >
            {t("recipeDetails.share")}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 text-sm font-medium"
          >
            {t("recipeDetails.print")}
          </button>
        </div>
      </div>

      <p className="mt-4 text-gray-700">{localize(recipe.description, i18n.language)}</p>

      {/* Meta grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-orange-100 rounded-2xl p-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("recipeDetails.prepTime")}</p>
          <p className="font-bold text-gray-900">{recipe.preparationTime} min</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("recipeDetails.cookTime")}</p>
          <p className="font-bold text-gray-900">{recipe.cookingTime} min</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("recipeDetails.totalTime")}</p>
          <p className="font-bold text-gray-900">{totalTime} min</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("recipeDetails.servings")}</p>
          <div className="flex items-center justify-center gap-2 mt-0.5 print:hidden">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 font-bold"
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="font-bold text-gray-900 w-5">{servings}</span>
            <button
              onClick={() => setServings((s) => s + 1)}
              className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 font-bold"
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
          <p className="font-bold text-gray-900 hidden print:block">{servings}</p>
        </div>
      </div>

      {/* Ingredients */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("recipeDetails.ingredients")}</h2>
        <div className="overflow-x-auto rounded-2xl border border-orange-100">
          <table className="w-full text-left">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                  {t("recipeDetails.ingredient")}
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                  {t("recipeDetails.quantity")}
                </th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing, idx) => (
                <tr key={idx} className="border-t border-orange-50">
                  <td className="px-4 py-3 text-gray-800">
                    {localize(ing.name, i18n.language)}
                    {ing.isPantryStaple && (
                      <span className="ml-2 text-xs text-gray-400">({t("cook.quickAdd")})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {formatQuantity(ing.quantity * scale)} {ing.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Preparation steps */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("recipeDetails.preparationSteps")}</h2>
        <ol className="space-y-3">
          {localizeArray(recipe.preparationSteps, i18n.language).map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="text-gray-800 pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Nutrition */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("recipeDetails.nutrition")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: t("recipeDetails.calories"), value: `${recipe.nutrition.calories} kcal` },
            { label: t("recipeDetails.protein"), value: `${recipe.nutrition.protein} g` },
            { label: t("recipeDetails.fat"), value: `${recipe.nutrition.fat} g` },
            { label: t("recipeDetails.carbohydrates"), value: `${recipe.nutrition.carbohydrates} g` },
            { label: t("recipeDetails.fiber"), value: `${recipe.nutrition.fiber} g` },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">{t("recipeDetails.nutritionDisclaimer")}</p>
      </section>

      {/* Benefits */}
      <section className="mt-10 mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("recipeDetails.benefits")}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {localizeArray(recipe.benefits, i18n.language).map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-leaf-500/10 text-leaf-700 rounded-lg px-3 py-2">
              <span aria-hidden="true">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      <Link to="/" className="text-primary-700 font-medium hover:underline">
        ← Back to Home
      </Link>
    </article>
  );
};

export default RecipeDetails;
