# RuchiBook 🍲

**Cook. Learn. Enjoy.**

RuchiBook is a full-stack, multilingual (English / Telugu / Hindi) digital cooking book. You can browse recipes, filter and search them, read step-by-step instructions with nutrition info, save favorites, manage a pantry, and — the signature feature — tell it what ingredients you have and it will tell you **what you can cook**.

This is a **real, working full-stack application** — React frontend, Express/MongoDB backend, JWT authentication, and a genuine ingredient-matching algorithm. It is not a static mockup: every button described below calls a real API.

---

## 1. Project Overview

The core idea: *"Discover what to cook, understand how to cook it, and find dishes using the ingredients you already have."*

- Browse recipes by category (Breakfast / Lunch / Dinner / Pantry) or food type (Vegetarian / Non-Vegetarian)
- Search recipes by name, ingredient, or category
- View full recipe details: ingredients, steps, nutrition, benefits, adjustable serving size
- Select ingredients you own and get ranked recipe matches ("What Can I Cook?")
- Register/login, save favorites, save a persistent pantry
- Admin dashboard to add/edit/delete recipes with full trilingual content

## 2. Features

| Area | What it does |
|---|---|
| Multilingual UI | Every screen, button, and recipe field is available in English, Telugu, and Hindi via `react-i18next`. The chosen language persists across refreshes. |
| Ingredient matching | `GET /api/recipes/find-by-ingredients` scores every recipe against your selected ingredients, ignoring common staples (salt, oil, water, turmeric), and groups results into "You Can Make This" / "Almost There" / "You Might Like". |
| Auth | JWT-based register/login/logout, passwords hashed with bcrypt, never stored in plain text. |
| Favorites & Pantry | Logged-in users can save recipes and a personal pantry list, persisted in MongoDB. |
| Admin dashboard | Role-protected CRUD for recipes, with a form covering every trilingual field. |
| Responsive design | Tailwind CSS, tested down to 320px mobile width up through desktop. |

## 3. Technology Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, react-i18next, axios
**Backend:** Node.js, Express, TypeScript, JWT, bcryptjs
**Database:** MongoDB with Mongoose

## 4. Folder Structure

```
ruchibook/
  backend/
    src/
      config/db.ts            MongoDB connection
      models/                 Mongoose schemas (Recipe, User)
      controllers/            Request handlers (business logic)
      routes/                 Express route definitions
      middleware/             auth (JWT check), error handling
      utils/                  matching algorithm, JWT helper, async wrapper
      seed/                   20 sample recipes + seed script
      server.ts               app entry point
    .env.example
  frontend/
    src/
      components/             reusable UI pieces (Navbar, RecipeCard, etc.)
      pages/                  one file per route/screen
      layouts/                MainLayout (navbar + footer wrapper)
      context/                React Context for auth & favorites state
      services/                axios API calls
      i18n/                    react-i18next setup + locale JSON files
      types/                   shared TypeScript interfaces
      utils/                   localize() helper for picking en/te/hi text
  README.md (this file)
```

## 5. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - **Local:** install MongoDB Community Server and run it (`mongod`), or
  - **Cloud (easiest for beginners):** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 6. Installation

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# edit .env and fill in MONGODB_URI and JWT_SECRET (see below)

# 2. Frontend
cd ../frontend
npm install
```

## 7. MongoDB Setup

- **Local:** set `MONGODB_URI=mongodb://127.0.0.1:27017/ruchibook`
- **Atlas:** create a free cluster, add a database user, allow your IP, then copy the connection string it gives you (looks like `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/ruchibook`)

## 8. Environment Variables

Edit `backend/.env`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/ruchibook
JWT_SECRET=any-long-random-string-you-make-up
PORT=5000
FRONTEND_URL=http://localhost:5173
```

`JWT_SECRET` is used to cryptographically sign login tokens — make it long and random. Never commit your real `.env` file (it's already git-ignored).

## 9. Sample Recipes Load Automatically

You don't need to run anything manually — the backend auto-seeds the 20 sample recipes and a default admin account the **first time it starts** against an empty database (see `backend/src/seed/autoSeed.ts`, called from `server.ts`). On every later restart it's a no-op since the database is no longer empty.

Default admin login:
- **Email:** `admin@ruchibook.com`
- **Password:** `admin123` (or whatever you set in `ADMIN_PASSWORD` in `.env` — see below)

**Change this password after your first login** once the app is public-facing.

If you ever want to wipe and reinsert fresh sample data (e.g. during development), run:
```bash
npm run seed
```
This is the **destructive** version — it deletes all existing recipes first. Use it deliberately, not automatically.

## 10. Running the Backend

```bash
cd backend
npm run dev
```

This starts the API at `http://localhost:5000` and auto-seeds sample data on first run (see Section 9). Visit `http://localhost:5000/api/health` in your browser — you should see `{"status":"ok", ...}`.

## 11. Running the Frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`. The frontend calls the backend at the URL in `VITE_API_URL` (see `frontend/.env.example`), falling back to `http://localhost:5000/api` if that variable isn't set — this is what makes it possible to point the frontend at a different backend URL once deployed.

## 11a. Deploying to the internet

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a full walkthrough: MongoDB Atlas setup, deploying the backend to Render, deploying the frontend to Vercel, connecting the two, and a troubleshooting table.

## 12. How Authentication Works

1. On **Register**, the backend hashes your password with bcrypt (a one-way function — it can check a password matches but can never reverse it back to plain text) and stores the hash, never the raw password.
2. On **Login**, the backend re-hashes the password you typed and compares it to the stored hash. If they match, it signs a **JWT (JSON Web Token)** containing your user ID and role, valid for 30 days.
3. The frontend stores that token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every subsequent request (see the axios interceptor in `frontend/src/services/api.ts`).
4. Protected backend routes use the `protect` middleware (`backend/src/middleware/auth.ts`) to verify the token and load the user; admin-only routes add `adminOnly` on top.

## 13. How Multilingual Support Works

- Every piece of recipe text (name, description, ingredient names, steps, benefits) is stored in the database as an object: `{ en: "...", te: "...", hi: "..." }` — see `backend/src/models/Recipe.ts`.
- All UI strings (buttons, labels, page titles) live in JSON files: `frontend/src/i18n/locales/{en,te,hi}/translation.json`, loaded by `react-i18next`.
- The `localize()` helper (`frontend/src/utils/localize.ts`) picks the right language key out of a recipe's `{en, te, hi}` field based on the currently selected UI language.
- Switching languages via the header dropdown calls `i18n.changeLanguage()`, which re-renders every `t("...")` string instantly and is persisted to `localStorage` so it survives a refresh.

## 14. How Ingredient Matching Works ("What Can I Cook?")

This is the core algorithm, in `backend/src/utils/matchIngredients.ts`:

1. Every ingredient name (yours and the recipe's) is lowercased and trimmed so "Tomato" and "tomato " are treated as identical.
2. A recipe's ingredients marked `isPantryStaple: true` (salt, water, cooking oil, turmeric) are excluded from the match calculation — it wouldn't be fair to say you're "missing" salt.
3. For the remaining (non-staple) ingredients:
   ```
   matchPercentage = (ingredients you have ∩ ingredients required) / (total required) × 100
   ```
4. Recipes are bucketed:
   - **90%+** → "You Can Make This"
   - **50–89%** → "Almost There"
   - **below 50% but at least 1 match** → "You Might Like"
   - **0 matches** → excluded entirely
5. Results are sorted highest match first.

Try it directly: `GET http://localhost:5000/api/recipes/find-by-ingredients?ingredients=rice,tomato,onion`

## 15. How to Create an Additional Admin

The seed script creates one admin automatically. To promote another user to admin, open your MongoDB database (via MongoDB Compass, Atlas's web UI, or the `mongosh` shell) and change their `role` field from `"user"` to `"admin"` in the `users` collection.

## 16. API Documentation

**Auth**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, returns a JWT |
| GET | `/api/auth/me` | user | Get current logged-in user |

**Recipes**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/recipes` | — | List recipes (supports `category`, `foodType`, `maxTime`, `calorieLevel`, `page`, `limit`) |
| GET | `/api/recipes/:id` | — | Get one recipe |
| GET | `/api/recipes/category/:category` | — | Recipes in a category |
| GET | `/api/recipes/type/:type` | — | Recipes by food type |
| GET | `/api/recipes/search?q=` | — | Keyword search |
| GET | `/api/recipes/find-by-ingredients?ingredients=a,b,c` | — | Ingredient matching |
| POST | `/api/recipes` | admin | Create a recipe |
| PUT | `/api/recipes/:id` | admin | Update a recipe |
| DELETE | `/api/recipes/:id` | admin | Delete a recipe |

**Users**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/favorites` | user | List favorites |
| POST | `/api/users/favorites/:recipeId` | user | Add a favorite |
| DELETE | `/api/users/favorites/:recipeId` | user | Remove a favorite |
| GET | `/api/users/pantry` | user | Get saved pantry |
| POST | `/api/users/pantry` | user | Replace saved pantry (body: `{ ingredients: string[] }`) |
| DELETE | `/api/users/pantry/:ingredientId` | user | Remove one pantry ingredient |

## 17. Future Improvements

- Password reset / "forgot password" flow and an in-app change-password screen
- Image upload (currently recipe images are just URLs — admin pastes a link)
- Pagination controls in the UI for large recipe lists (the API already supports `page`/`limit`)
- Recipe ratings and user reviews
- Unit tests for the matching algorithm and auth flows
- Deploy scripts / Docker Compose for one-command setup

---

Built as a learning/portfolio project demonstrating React, TypeScript, Node/Express, MongoDB, JWT auth, REST API design, search & filtering algorithms, and internationalization.
