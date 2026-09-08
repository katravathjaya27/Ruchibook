import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/pantry", label: t("nav.pantry") },
    { to: "/breakfast", label: t("nav.breakfast") },
    { to: "/lunch", label: t("nav.lunch") },
    { to: "/dinner", label: t("nav.dinner") },
    { to: "/what-can-i-cook", label: t("nav.whatCanICook") },
    { to: "/favorites", label: t("nav.favorites") },
    { to: "/search", label: t("nav.search") },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
      isActive ? "bg-primary-600 text-white" : "text-gray-700 hover:bg-orange-100"
    }`;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl" aria-hidden="true">
              🍲
            </span>
            <span className="text-xl font-extrabold text-primary-700">{t("app.name")}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector />
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-primary-700 hover:underline"
                  >
                    {t("nav.admin")}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium bg-orange-100 hover:bg-orange-200 text-primary-800 px-4 py-1.5 rounded-full transition-colors"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-700 px-3 py-1.5"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-full transition-colors"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-orange-100"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-4 flex flex-col gap-1 border-t border-orange-100 pt-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive ? "bg-primary-600 text-white" : "text-gray-700 hover:bg-orange-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between px-3 py-2">
              <LanguageSelector />
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium bg-orange-100 hover:bg-orange-200 text-primary-800 px-4 py-1.5 rounded-full"
                >
                  {t("nav.logout")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 px-2">
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold bg-primary-600 text-white px-4 py-1.5 rounded-full"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-primary-700 hover:bg-orange-100"
              >
                {t("nav.admin")}
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
