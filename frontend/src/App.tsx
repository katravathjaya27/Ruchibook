import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Pantry from "./pages/Pantry";
import Breakfast from "./pages/Breakfast";
import Lunch from "./pages/Lunch";
import Dinner from "./pages/Dinner";
import WhatCanICook from "./pages/WhatCanICook";
import Favorites from "./pages/Favorites";
import Search from "./pages/Search";
import RecipeDetails from "./pages/RecipeDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRecipeForm from "./pages/admin/AdminRecipeForm";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/breakfast" element={<Breakfast />} />
        <Route path="/lunch" element={<Lunch />} />
        <Route path="/dinner" element={<Dinner />} />
        <Route path="/what-can-i-cook" element={<WhatCanICook />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <Favorites />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/recipes/new"
          element={
            <RequireAdmin>
              <AdminRecipeForm />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/recipes/:id/edit"
          element={
            <RequireAdmin>
              <AdminRecipeForm />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;
