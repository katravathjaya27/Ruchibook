import api from "./api";
import { User, Recipe } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(name: string, email: string, password: string, confirmPassword: string) {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    return data;
  },

  async me() {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};

export const userService = {
  async getFavorites() {
    const { data } = await api.get<{ favorites: Recipe[] }>("/users/favorites");
    return data.favorites;
  },

  async addFavorite(recipeId: string) {
    await api.post(`/users/favorites/${recipeId}`);
  },

  async removeFavorite(recipeId: string) {
    await api.delete(`/users/favorites/${recipeId}`);
  },

  async getPantry() {
    const { data } = await api.get<{ pantry: string[] }>("/users/pantry");
    return data.pantry;
  },

  async savePantry(ingredients: string[]) {
    const { data } = await api.post<{ pantry: string[] }>("/users/pantry", { ingredients });
    return data.pantry;
  },
};
