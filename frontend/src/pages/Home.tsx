import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { recipeService } from "../services/recipeService";
import { Recipe, Category, FoodType } from "../types";
import RecipeCard from "../components/RecipeCard";
import { Loader, ErrorState } from "../components/Loader";

const CATEGORY_META: { key: Category; icon: string }[] = [
  { key: "pantry", icon: "🥫" },
  { key: "breakfast", icon: "🍳" },
  { key: "lunch", icon: "🍛" },
  { key: "dinner", icon: "🍲" },
];

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [popular, setPopular] = useState<Recipe[]>([]);
  const [vegRecipes, setVegRecipes] = useState<Recipe[]>([]);
  const [nonVegRecipes, setNonVegRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [all, veg, nonVeg] = await Promise.all([
          recipeService.getAll({ limit: 8 }),
          recipeService.getByType("vegetarian" as FoodType),
          recipeService.getByType("non-vegetarian" as FoodType),
        ]);
        setPopular(all.recipes.filter((r) => r.isPopular).slice(0, 8));
        setVegRecipes(veg.recipes.slice(0, 4));
        setNonVegRecipes(nonVeg.recipes.slice(0, 4));
      } catch (err) {
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{t("app.name")}</h1>
          <p className="mt-3 text-xl sm:text-2xl font-semibold">{t("app.tagline")}</p>
          <p className="mt-3 text-primary-100 max-w-xl mx-auto">{t("home.heroSubtitle")}</p>

          <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder") as string}
              className="flex-1 rounded-full px-5 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={t("home.searchPlaceholder") as string}
            />
            <button
              type="submit"
              className="bg-white text-primary-700 font-semibold px-5 py-3 rounded-full hover:bg-orange-50 transition-colors"
            >
              {t("home.searchButton")}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/search"
              className="bg-primary-500/40 hover:bg-primary-500/60 border border-white/30 text-white font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              {t("home.exploreRecipes")}
            </Link>
            <Link
              to="/what-can-i-cook"
              className="bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-full hover:bg-orange-50 transition-colors"
            >
              {t("home.whatCanICook")}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">{t("home.categoriesTitle")}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORY_META.map(({ key, icon }) => (
              <Link
                key={key}
                to={key === "pantry" ? "/pantry" : `/${key}`}
                className="bg-white rounded-2xl border border-orange-100 p-5 hover:shadow-lg transition-shadow flex flex-col items-start"
              >
                <span className="text-4xl mb-2" aria-hidden="true">
                  {icon}
                </span>
                <h3 className="font-bold text-gray-900">{t(`category.${key}`)}</h3>
                <p className="text-sm text-gray-500 mt-1">{t(`category.${key}Desc`)}</p>
                <span className="mt-3 text-sm font-semibold text-primary-700">
                  {t("home.exploreButton")} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {loading && <Loader message={t("loading.recipes") as string} />}
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            {/* Food types */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">{t("home.foodTypesTitle")}</h2>
              <div className="space-y-8">
                {vegRecipes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-leaf-600 mb-3">
                      {t("home.vegetarian")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {vegRecipes.map((r) => (
                        <RecipeCard key={r._id} recipe={r} />
                      ))}
                    </div>
                  </div>
                )}
                {nonVegRecipes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-3">
                      {t("home.nonVegetarian")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {nonVegRecipes.map((r) => (
                        <RecipeCard key={r._id} recipe={r} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Popular recipes */}
            {popular.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">{t("home.popularTitle")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {popular.map((r) => (
                    <RecipeCard key={r._id} recipe={r} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
