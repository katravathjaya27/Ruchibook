import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import IngredientSelector from "../components/IngredientSelector";
import { recipeService } from "../services/recipeService";
import { IngredientMatchResult, MatchCategory } from "../types";
import { localize } from "../utils/localize";
import { Loader, EmptyState, ErrorState } from "../components/Loader";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

const SECTION_ORDER: MatchCategory[] = ["you-can-make", "almost-there", "you-might-like"];

const MatchCard: React.FC<{ result: IngredientMatchResult }> = ({ result }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recipe, matchPercentage, availableIngredients, missingIngredients } = result;
  const favorited = isFavorite(recipe._id);

  const ringColor =
    matchPercentage >= 90 ? "text-leaf-600" : matchPercentage >= 50 ? "text-primary-600" : "text-gray-500";

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4 flex flex-col sm:flex-row gap-4">
      <img
        src={recipe.image}
        alt={localize(recipe.name, i18n.language)}
        loading="lazy"
        className="w-full sm:w-32 h-32 object-cover rounded-xl shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/recipe/${recipe._id}`} className="font-bold text-gray-900 hover:underline">
              {localize(recipe.name, i18n.language)}
            </Link>
            <p className="text-xs text-gray-500 capitalize">{recipe.category}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-lg font-extrabold ${ringColor}`}>{matchPercentage}%</span>
            <p className="text-xs text-gray-400">{t("cook.match")}</p>
          </div>
          {user && (
            <button
              onClick={() => toggleFavorite(recipe)}
              aria-label="Toggle favorite"
              className="text-xl"
            >
              {favorited ? "❤️" : "🤍"}
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <p className="text-xs font-semibold text-leaf-600">{t("cook.available")}</p>
            <p className="text-gray-700">
              {availableIngredients.map((i) => `✓ ${i}`).join("   ")}
            </p>
          </div>
          {missingIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500">{t("cook.missing")}</p>
              <p className="text-gray-500">
                {missingIngredients.map((i) => `○ ${i}`).join("   ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WhatCanICook: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<IngredientMatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFindRecipes = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const data = await recipeService.findByIngredients(selected);
      setResults(data.results);
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const grouped: Record<MatchCategory, IngredientMatchResult[]> = {
    "you-can-make": [],
    "almost-there": [],
    "you-might-like": [],
  };
  (results || []).forEach((r) => grouped[r.category].push(r));

  const sectionTitleKey: Record<MatchCategory, string> = {
    "you-can-make": "cook.youCanMake",
    "almost-there": "cook.almostThere",
    "you-might-like": "cook.youMightLike",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">{t("cook.title")}</h1>
      <p className="text-gray-500 mt-1">{t("cook.subtitle")}</p>

      <div className="mt-8 bg-white rounded-2xl border border-orange-100 p-6">
        <IngredientSelector
          selected={selected}
          onChange={(ings) => {
            setSelected(ings);
            setResults(null);
          }}
          searchPlaceholder={t("cook.searchPlaceholder") as string}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelected([]);
              setResults(null);
            }}
            className="px-4 py-2 rounded-full text-sm font-medium bg-orange-100 hover:bg-orange-200 text-gray-700"
          >
            {t("cook.clearAll")}
          </button>
          <button
            onClick={handleFindRecipes}
            disabled={selected.length === 0 || loading}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
          >
            {t("cook.findRecipes")}
          </button>
        </div>
      </div>

      <div className="mt-8">
        {loading && <Loader message={t("loading.recipes") as string} />}
        {error && <ErrorState message={error} />}

        {!loading && !error && results === null && selected.length === 0 && (
          <EmptyState icon="🧺" message={t("cook.empty") as string} />
        )}

        {!loading && !error && results !== null && results.length === 0 && (
          <EmptyState icon="🔍" message={t("cook.noResults") as string} />
        )}

        {!loading && !error && results !== null && results.length > 0 && (
          <div className="space-y-8">
            {SECTION_ORDER.map((section) =>
              grouped[section].length > 0 ? (
                <div key={section}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {t(sectionTitleKey[section])}
                  </h2>
                  <div className="space-y-4">
                    {grouped[section].map((r) => (
                      <MatchCard key={r.recipe._id} result={r} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatCanICook;
