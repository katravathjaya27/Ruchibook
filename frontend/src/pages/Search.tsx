import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { recipeService } from "../services/recipeService";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setRecipes([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await recipeService.search(q.trim());
        setRecipes(data.recipes);
        setSearched(true);
      } catch {
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // Run search on initial load if a "q" param is present.
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce user typing before searching.
  const handleChange = (value: string) => {
    setQuery(value);
    setSearchParams(value ? { q: value } : {});
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{t("search.title")}</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t("search.placeholder") as string}
        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:border-primary-500"
        aria-label={t("search.placeholder") as string}
      />

      <div className="mt-8">
        {loading && <Loader message={t("loading.recipes") as string} />}
        {error && <ErrorState message={error} />}
        {!loading && !error && searched && recipes.length === 0 && (
          <EmptyState icon="🔍" message={t("search.noResults") as string} />
        )}
        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((r) => (
              <RecipeCard key={r._id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
