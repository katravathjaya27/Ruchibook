import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { recipeService } from "../../services/recipeService";
import { Recipe } from "../../types";
import { Loader, ErrorState } from "../../components/Loader";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll({ limit: 200 });
      setRecipes(data.recipes);
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("admin.deleteConfirm") as string)) return;
    await recipeService.remove(id);
    setRecipes((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">{t("admin.title")}</h1>
        <Link
          to="/admin/recipes/new"
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-full"
        >
          + {t("admin.addRecipe")}
        </Link>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="bg-white border border-orange-100 rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Image</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Food Type</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r._id} className="border-t border-orange-50">
                  <td className="px-4 py-2">
                    <img src={r.image} alt={r.name.en} className="w-14 h-14 object-cover rounded-lg" />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">{r.name.en}</td>
                  <td className="px-4 py-2 capitalize text-gray-600">{r.category}</td>
                  <td className="px-4 py-2 capitalize text-gray-600">{r.foodType}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <Link
                        to={`/admin/recipes/${r._id}/edit`}
                        className="text-primary-700 font-medium hover:underline text-sm"
                      >
                        {t("common.edit")}
                      </Link>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 font-medium hover:underline text-sm"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
