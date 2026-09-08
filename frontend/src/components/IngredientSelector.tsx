import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// A reasonable starter catalog of common Indian pantry ingredients,
// grouped by category, matching the ones described in the project spec.
export const INGREDIENT_CATALOG: Record<string, string[]> = {
  vegetables: ["Tomato", "Potato", "Onion", "Carrot", "Beans", "Capsicum", "Spinach"],
  grains: ["Rice", "Wheat", "Rava", "Poha", "Oats"],
  dairy: ["Milk", "Curd", "Paneer", "Cheese"],
  proteins: ["Egg", "Chicken", "Fish", "Dal", "Chickpeas"],
  spices: ["Turmeric", "Chilli powder", "Cumin", "Coriander", "Garam masala"],
};

export const ALL_INGREDIENTS = Object.values(INGREDIENT_CATALOG).flat();

interface Props {
  selected: string[];
  onChange: (ingredients: string[]) => void;
  searchPlaceholder: string;
}

const IngredientSelector: React.FC<Props> = ({ selected, onChange, searchPlaceholder }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return ALL_INGREDIENTS.filter(
      (i) => i.toLowerCase().includes(q) && !selected.includes(i)
    ).slice(0, 6);
  }, [query, selected]);

  const add = (ingredient: string) => {
    if (!selected.includes(ingredient)) {
      onChange([...selected, ingredient]);
    }
    setQuery("");
  };

  const remove = (ingredient: string) => {
    onChange(selected.filter((i) => i !== ingredient));
  };

  return (
    <div>
      {/* Search box with live suggestions */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:border-primary-500"
          aria-label={searchPlaceholder}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-orange-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => add(s)}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Categorized quick-add buttons */}
      <div className="mt-5 space-y-4">
        {Object.entries(INGREDIENT_CATALOG).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-500 mb-2">
              {t(`pantryPage.categories.${category}`)}
            </h4>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => (isSelected ? remove(item) : add(item))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-gray-700 border-orange-200 hover:border-primary-400"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">
            {t("cook.yourIngredients")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-800 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {item}
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={`Remove ${item}`}
                  className="hover:text-primary-950"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientSelector;
