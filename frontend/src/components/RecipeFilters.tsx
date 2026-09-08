import React from "react";
import { useTranslation } from "react-i18next";
import { FoodType } from "../types";

export interface FilterState {
  foodType?: FoodType;
  maxTime?: number;
  calorieLevel?: "low" | "medium" | "high";
}

interface Props {
  value: FilterState;
  onChange: (value: FilterState) => void;
}

const RecipeFilters: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const setFoodType = (foodType?: FoodType) =>
    onChange({ ...value, foodType: value.foodType === foodType ? undefined : foodType });

  const setMaxTime = (maxTime?: number) =>
    onChange({ ...value, maxTime: value.maxTime === maxTime ? undefined : maxTime });

  const setCalorieLevel = (calorieLevel?: "low" | "medium" | "high") =>
    onChange({
      ...value,
      calorieLevel: value.calorieLevel === calorieLevel ? undefined : calorieLevel,
    });

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      active
        ? "bg-primary-600 text-white border-primary-600"
        : "bg-white text-gray-700 border-orange-200 hover:border-primary-400"
    }`;

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4 space-y-4">
      <h3 className="font-bold text-gray-800">{t("filters.title")}</h3>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t("filters.foodType")}</p>
        <div className="flex flex-wrap gap-2">
          <button className={pill(value.foodType === "vegetarian")} onClick={() => setFoodType("vegetarian")}>
            {t("home.vegetarian")}
          </button>
          <button
            className={pill(value.foodType === "non-vegetarian")}
            onClick={() => setFoodType("non-vegetarian")}
          >
            {t("home.nonVegetarian")}
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t("filters.cookingTime")}</p>
        <div className="flex flex-wrap gap-2">
          <button className={pill(value.maxTime === 15)} onClick={() => setMaxTime(15)}>
            {t("filters.under15")}
          </button>
          <button className={pill(value.maxTime === 30)} onClick={() => setMaxTime(30)}>
            {t("filters.15to30")}
          </button>
          <button className={pill(value.maxTime === 60)} onClick={() => setMaxTime(60)}>
            {t("filters.30to60")}
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t("filters.calories")}</p>
        <div className="flex flex-wrap gap-2">
          <button className={pill(value.calorieLevel === "low")} onClick={() => setCalorieLevel("low")}>
            {t("filters.low")}
          </button>
          <button className={pill(value.calorieLevel === "medium")} onClick={() => setCalorieLevel("medium")}>
            {t("filters.medium")}
          </button>
          <button className={pill(value.calorieLevel === "high")} onClick={() => setCalorieLevel("high")}>
            {t("filters.high")}
          </button>
        </div>
      </div>

      <button
        onClick={() => onChange({})}
        className="text-sm font-medium text-primary-700 hover:underline"
      >
        {t("filters.clear")}
      </button>
    </div>
  );
};

export default RecipeFilters;
