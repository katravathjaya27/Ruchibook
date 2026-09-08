import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IngredientSelector from "../components/IngredientSelector";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/authService";

const Pantry: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // If logged in, load the pantry the user previously saved.
  useEffect(() => {
    if (!user) return;
    userService
      .getPantry()
      .then((pantry) => {
        // Pantry is stored lowercase in the DB; capitalize for display
        // matching against our catalog is case-insensitive anyway.
        setSelected(
          pantry.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        );
      })
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await userService.savePantry(selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">{t("pantryPage.title")}</h1>
      <p className="text-gray-500 mt-1">{t("pantryPage.subtitle")}</p>

      <div className="mt-8 bg-white rounded-2xl border border-orange-100 p-6">
        <IngredientSelector
          selected={selected}
          onChange={setSelected}
          searchPlaceholder={t("pantryPage.searchPlaceholder") as string}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelected([])}
            className="px-4 py-2 rounded-full text-sm font-medium bg-orange-100 hover:bg-orange-200 text-gray-700"
          >
            {t("pantryPage.clearAll")}
          </button>
          {user ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
            >
              {t("pantryPage.save")}
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Log in to save your pantry across visits.
            </p>
          )}
          {saved && <span className="text-sm text-leaf-600 font-medium">{t("pantryPage.saved")}</span>}
        </div>
      </div>
    </div>
  );
};

export default Pantry;
