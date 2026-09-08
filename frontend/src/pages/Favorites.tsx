import React from "react";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../context/FavoritesContext";
import RecipeCard from "../components/RecipeCard";
import { EmptyState } from "../components/Loader";

const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const { favorites } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{t("favoritesPage.title")}</h1>

      {favorites.length === 0 ? (
        <EmptyState icon="💔" message={t("favoritesPage.empty") as string} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {favorites.map((r) => (
            <RecipeCard key={r._id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
