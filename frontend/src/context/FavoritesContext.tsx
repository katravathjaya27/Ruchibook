import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Recipe } from "../types";
import { userService } from "../services/authService";
import { useAuth } from "./AuthContext";

interface FavoritesContextType {
  favoriteIds: Set<string>;
  favorites: Recipe[];
  toggleFavorite: (recipe: Recipe) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const data = await userService.getFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const favoriteIds = new Set(favorites.map((r) => r._id));

  const isFavorite = (recipeId: string) => favoriteIds.has(recipeId);

  const toggleFavorite = async (recipe: Recipe) => {
    if (!user) return; // caller should redirect to login
    if (isFavorite(recipe._id)) {
      await userService.removeFavorite(recipe._id);
      setFavorites((prev) => prev.filter((r) => r._id !== recipe._id));
    } else {
      await userService.addFavorite(recipe._id);
      setFavorites((prev) => [...prev, recipe]);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, favorites, toggleFavorite, isFavorite, refreshFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
};
