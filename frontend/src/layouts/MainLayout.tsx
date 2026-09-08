import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";

const MainLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-orange-100 py-6 text-center text-sm text-gray-500">
        <p className="font-semibold text-primary-700">{t("app.name")}</p>
        <p>{t("app.tagline")}</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} RuchiBook. Built as a portfolio project.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
