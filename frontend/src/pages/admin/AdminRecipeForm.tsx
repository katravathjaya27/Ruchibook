import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { recipeService } from "../../services/recipeService";
import { Category, FoodType, Ingredient, LocalizedString, LocalizedStringArray } from "../../types";

const emptyLocalized = (): LocalizedString => ({ en: "", te: "", hi: "" });
const emptyLocalizedArray = (): LocalizedStringArray => ({ en: [""], te: [""], hi: [""] });
const emptyIngredient = (): Ingredient => ({
  name: emptyLocalized(),
  quantity: 1,
  unit: "",
  isPantryStaple: false,
});

const LocalizedInput: React.FC<{
  label: string;
  value: LocalizedString;
  onChange: (v: LocalizedString) => void;
  textarea?: boolean;
}> = ({ label, value, onChange, textarea }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
    {(["en", "te", "hi"] as const).map((lang) => {
      const Field = textarea ? "textarea" : "input";
      return (
        <div key={lang}>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            {label} ({lang.toUpperCase()})
          </label>
          <Field
            value={value[lang]}
            onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
            className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500"
            rows={textarea ? 3 : undefined}
          />
        </div>
      );
    })}
  </div>
);

const AdminRecipeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [name, setName] = useState<LocalizedString>(emptyLocalized());
  const [description, setDescription] = useState<LocalizedString>(emptyLocalized());
  const [category, setCategory] = useState<Category>("breakfast");
  const [foodType, setFoodType] = useState<FoodType>("vegetarian");
  const [image, setImage] = useState("");
  const [preparationTime, setPreparationTime] = useState(10);
  const [cookingTime, setCookingTime] = useState(15);
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<LocalizedStringArray>(emptyLocalizedArray());
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, fat: 0, carbohydrates: 0, fiber: 0 });
  const [benefits, setBenefits] = useState<LocalizedStringArray>(emptyLocalizedArray());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    recipeService.getById(id).then((r) => {
      setName(r.name);
      setDescription(r.description);
      setCategory(r.category);
      setFoodType(r.foodType);
      setImage(r.image);
      setPreparationTime(r.preparationTime);
      setCookingTime(r.cookingTime);
      setServings(r.servings);
      setIngredients(r.ingredients);
      setSteps(r.preparationSteps);
      setNutrition(r.nutrition);
      setBenefits(r.benefits);
    });
  }, [id]);

  const updateStepArray = (
    arr: LocalizedStringArray,
    setArr: (v: LocalizedStringArray) => void,
    lang: "en" | "te" | "hi",
    idx: number,
    value: string
  ) => {
    const copy = { ...arr, [lang]: [...arr[lang]] };
    copy[lang][idx] = value;
    setArr(copy);
  };

  const addStepRow = (arr: LocalizedStringArray, setArr: (v: LocalizedStringArray) => void) => {
    setArr({ en: [...arr.en, ""], te: [...arr.te, ""], hi: [...arr.hi, ""] });
  };

  const removeStepRow = (
    arr: LocalizedStringArray,
    setArr: (v: LocalizedStringArray) => void,
    idx: number
  ) => {
    setArr({
      en: arr.en.filter((_, i) => i !== idx),
      te: arr.te.filter((_, i) => i !== idx),
      hi: arr.hi.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name,
      description,
      category,
      foodType,
      image: image || "https://picsum.photos/seed/ruchibook-default/800/600",
      preparationTime,
      cookingTime,
      servings,
      ingredients,
      preparationSteps: {
        en: steps.en.filter(Boolean),
        te: steps.te.filter(Boolean),
        hi: steps.hi.filter(Boolean),
      },
      nutrition,
      benefits: {
        en: benefits.en.filter(Boolean),
        te: benefits.te.filter(Boolean),
        hi: benefits.hi.filter(Boolean),
      },
    };

    try {
      if (isEditing && id) {
        await recipeService.update(id, payload);
      } else {
        await recipeService.create(payload);
      }
      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || t("errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        {isEditing ? t("admin.editRecipe") : t("admin.addRecipe")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <section className="bg-white border border-orange-100 rounded-2xl p-5 space-y-4">
          <LocalizedInput label={t("admin.recipeName")} value={name} onChange={setName} />
          <LocalizedInput label={t("admin.description")} value={description} onChange={setDescription} textarea />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("admin.category")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="pantry">Pantry</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("admin.foodType")}</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as FoodType)}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("admin.image")}</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("admin.prepTime")}</label>
              <input
                type="number"
                min={0}
                value={preparationTime}
                onChange={(e) => setPreparationTime(Number(e.target.value))}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("admin.cookTime")}</label>
              <input
                type="number"
                min={0}
                value={cookingTime}
                onChange={(e) => setCookingTime(Number(e.target.value))}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("admin.servings")}</label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="bg-white border border-orange-100 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-gray-800">{t("admin.ingredients")}</h2>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="border border-orange-100 rounded-xl p-3 space-y-2">
              <LocalizedInput
                label={t("admin.ingredientName")}
                value={ing.name}
                onChange={(v) =>
                  setIngredients((prev) => prev.map((p, i) => (i === idx ? { ...p, name: v } : p)))
                }
              />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={ing.quantity}
                  onChange={(e) =>
                    setIngredients((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, quantity: Number(e.target.value) } : p))
                    )
                  }
                  className="w-24 border border-orange-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Qty"
                />
                <input
                  value={ing.unit}
                  onChange={(e) =>
                    setIngredients((prev) => prev.map((p, i) => (i === idx ? { ...p, unit: e.target.value } : p)))
                  }
                  className="w-24 border border-orange-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Unit"
                />
                <label className="flex items-center gap-1.5 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={ing.isPantryStaple}
                    onChange={(e) =>
                      setIngredients((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, isPantryStaple: e.target.checked } : p))
                      )
                    }
                  />
                  {t("admin.pantryStaple")}
                </label>
                <button
                  type="button"
                  onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-red-600 text-sm font-medium ml-auto"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
            className="text-primary-700 font-medium text-sm hover:underline"
          >
            + {t("admin.addIngredient")}
          </button>
        </section>

        {/* Preparation steps */}
        <section className="bg-white border border-orange-100 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-gray-800">{t("admin.preparationSteps")}</h2>
          {steps.en.map((_, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              {(["en", "te", "hi"] as const).map((lang) => (
                <input
                  key={lang}
                  value={steps[lang][idx] || ""}
                  onChange={(e) => updateStepArray(steps, setSteps, lang, idx, e.target.value)}
                  placeholder={`Step ${idx + 1} (${lang.toUpperCase()})`}
                  className="border border-orange-200 rounded-lg px-3 py-2 text-sm"
                />
              ))}
              <button
                type="button"
                onClick={() => removeStepRow(steps, setSteps, idx)}
                className="text-red-600 text-xs font-medium sm:col-span-3 text-left"
              >
                {t("common.delete")}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addStepRow(steps, setSteps)}
            className="text-primary-700 font-medium text-sm hover:underline"
          >
            + {t("admin.addStep")}
          </button>
        </section>

        {/* Nutrition */}
        <section className="bg-white border border-orange-100 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-gray-800">{t("admin.nutrition")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.keys(nutrition) as (keyof typeof nutrition)[]).map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">{key}</label>
                <input
                  type="number"
                  min={0}
                  value={nutrition[key]}
                  onChange={(e) => setNutrition((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white border border-orange-100 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-gray-800">{t("admin.benefits")}</h2>
          {benefits.en.map((_, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              {(["en", "te", "hi"] as const).map((lang) => (
                <input
                  key={lang}
                  value={benefits[lang][idx] || ""}
                  onChange={(e) => updateStepArray(benefits, setBenefits, lang, idx, e.target.value)}
                  placeholder={`Benefit ${idx + 1} (${lang.toUpperCase()})`}
                  className="border border-orange-200 rounded-lg px-3 py-2 text-sm"
                />
              ))}
              <button
                type="button"
                onClick={() => removeStepRow(benefits, setBenefits, idx)}
                className="text-red-600 text-xs font-medium sm:col-span-3 text-left"
              >
                {t("common.delete")}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addStepRow(benefits, setBenefits)}
            className="text-primary-700 font-medium text-sm hover:underline"
          >
            + {t("admin.addBenefit")}
          </button>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-full disabled:opacity-60"
          >
            {t("admin.save")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="bg-orange-100 hover:bg-orange-200 text-gray-700 font-medium px-6 py-2.5 rounded-full"
          >
            {t("admin.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminRecipeForm;
