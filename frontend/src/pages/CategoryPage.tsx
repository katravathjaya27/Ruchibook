import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Category, Recipe } from "../types";
import { recipeService } from "../services/recipeService";
import RecipeCard from "../components/RecipeCard";
import RecipeFilters, { FilterState } from "../components/RecipeFilters";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

interface Props {
  category: Category;
}

const CategoryPage: React.FC<Props> = ({ category }) => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await recipeService.getAll({ category, ...filters, limit: 50 });
        setRecipes(data.recipes);
      } catch {
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, filters, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 capitalize">
        {t(`category.${category}`)}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside>
          <RecipeFilters value={filters} onChange={setFilters} />
        </aside>

        <div>
          {loading && <Loader message={t("loading.recipes") as string} />}
          {error && <ErrorState message={error} />}
          {!loading && !error && recipes.length === 0 && (
            <EmptyState message={t("search.noResults") as string} />
          )}
          {!loading && !error && recipes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recipes.map((r) => (
                <RecipeCard key={r._id} recipe={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
