# RuchiBook — Running & Deployment Guide

This document covers everything from "I just unzipped this" to "it's live on the internet with a real URL I can share." Follow the sections in order.

---

## Part 0: How the pieces fit together

Before touching a terminal, it helps to know what talks to what:

```
 Browser  --->  Frontend (React, static files)  --->  Backend (Express API)  --->  MongoDB
 (user)         Vercel / Netlify                      Render / Railway            Atlas
```

- The **frontend** is just static HTML/CSS/JS after you build it — it has no server-side logic, so it's hosted on a static host (Vercel, Netlify).
- The **backend** is a long-running Node process that must stay alive to answer API requests — it needs a host that runs Node processes (Render, Railway, Fly.io). It **cannot** be hosted on Vercel/Netlify's static hosting.
- **MongoDB** needs its own home too — for a portfolio project, MongoDB Atlas's free tier is the standard choice; you don't self-host a database on Render's free tier (it doesn't persist storage on restarts).

That's three separate services talking to each other over the internet, connected by URLs and environment variables. Most of the "deployment work" below is just telling each service the correct URL/secret for the other two.

---

## Part 1: Run it locally first

Always get it running on your machine before deploying — it's much easier to debug locally than on a hosting dashboard.

### 1.1 Install dependencies

```bash
unzip RuchiBook.zip -d ruchibook
cd ruchibook/backend && npm install
cd ../frontend && npm install
```

### 1.2 Create a MongoDB database (Atlas — free, 5 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up (free)
2. Create a new **Project** → then **Build a Database** → choose the **M0 Free** tier → pick any cloud region close to you
3. **Database Access** (left sidebar) → Add New Database User → set a username and password (write these down — you'll need them in the connection string). Choose "Read and write to any database."
4. **Network Access** (left sidebar) → Add IP Address → for now click **Allow Access from Anywhere** (`0.0.0.0/0`) — you can lock this down later
5. Go back to **Database** → click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the real values, and add `/ruchibook` before the `?` so it points at a database named `ruchibook`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ruchibook?retryWrites=true&w=majority
   ```
   Save this whole string — this is your `MONGODB_URI`.

### 1.3 Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ruchibook?retryWrites=true&w=majority
JWT_SECRET=paste-a-long-random-string-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

For `JWT_SECRET`, any long random string works. Quick way to generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.4 Run the backend once to auto-seed

You don't need a separate seed step — the backend seeds 20 sample recipes and a default admin account automatically the first time it starts against an empty database:

```bash
npm run dev
```

Expected log lines: `MongoDB connected successfully`, then `Auto-seeded 20 sample recipes (database was empty).` and `Auto-created default admin account -> email: admin@ruchibook.com`.

If you don't see those lines and instead see a connection error, it's almost always the `MONGODB_URI` — double check the password has no typos and that you allowed your IP in Atlas's Network Access. Leave this running; you'll start the frontend in a second terminal in step 1.6.

(If you ever want to wipe and reinsert fresh sample data later, run `npm run seed` — that's the deliberate, destructive version.)

### 1.5 Configure the frontend (optional locally, required for deploy)

```bash
cd ../frontend
cp .env.example .env
```

`frontend/.env` for local dev can just stay as the default (`VITE_API_URL=http://localhost:5000/api`) — you don't strictly need this file locally since the code falls back to that value anyway. You *will* need to set this properly in Part 4.

### 1.6 Run the frontend

```bash
npm run dev
```

Open `http://localhost:5173`. Log in as `admin@ruchibook.com` / `admin123` to see the Admin Dashboard, or register a new account to test favorites/pantry.

**Checklist before moving to deployment:**
- [ ] `http://localhost:5000/api/health` returns `{"status":"ok"}`
- [ ] Home page loads recipes
- [ ] Search, filters, and "What Can I Cook?" all return results
- [ ] You can register, log in, and favorite a recipe
- [ ] Admin login works and you can add/edit/delete a recipe

---

## Part 2: Push your code to GitHub

Both hosting providers below deploy from a Git repository.

```bash
cd ruchibook
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repository on GitHub, then:
```bash
git remote add origin https://github.com/<your-username>/ruchibook.git
git branch -M main
git push -u origin main
```

**Before you push**, double-check `.env` files are NOT included (they're in `.gitignore` already, but verify with `git status` — you should see `backend/.env` and `frontend/.env` listed as ignored, not staged). Never commit real secrets.

---

## Part 3: Deploy the backend (Render, one-click blueprint)

The repo includes a `render.yaml` file at its root, which Render reads automatically as a **Blueprint** — this means you don't fill in build/start commands by hand, and Render generates your `JWT_SECRET` for you.

1. Go to [render.com](https://render.com) → sign up
2. **New +** → **Blueprint**
3. Connect your GitHub account and select the `ruchibook` repo — Render detects `render.yaml` and shows you the `ruchibook-api` service it's about to create
4. You'll be prompted to fill in the variables marked `sync: false` in the blueprint:
   - `MONGODB_URI` → paste your Atlas connection string from Part 1.2
   - `ADMIN_PASSWORD` → optional; leave blank to use the default `admin123` (change it after first login either way)
5. Click **Apply** — Render builds and deploys. Watch the logs; you should see the same `Auto-seeded 20 sample recipes...` line you saw locally, confirming the database populated itself.
6. When it's live you'll get a URL like:
   ```
   https://ruchibook-api.onrender.com
   ```
7. Verify it: visit `https://ruchibook-api.onrender.com/api/health` — you should see `{"status":"ok", ...}`.

**Note on Render's free tier:** free web services "spin down" after 15 minutes of inactivity and take ~30-50 seconds to wake up on the next request. That's fine for a portfolio demo — just know the first load after idling will be slow. (Paid tiers, or Railway's free tier, avoid this.)

### 3b. Alternatives to Render

- **Railway** ([railway.app](https://railway.app)): New Project → Deploy from GitHub → set root directory to `backend` → add `MONGODB_URI` and `JWT_SECRET` env vars manually (Railway doesn't read `render.yaml`) → Railway auto-detects the build/start commands from `package.json`.
- **Fly.io**: more manual (needs a `Dockerfile` or `fly launch` config) — better if you want more control, but more setup than Render/Railway for a first deploy.

---

## Part 4: Deploy the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign up → **Add New** → **Project**
2. Import the same `ruchibook` GitHub repo
3. When configuring the project:
   | Field | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite (should auto-detect) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://ruchibook-api.onrender.com/api
   ```
   (use the exact Render URL from Part 3, with `/api` on the end)
5. Click **Deploy**. When it finishes you'll get a URL like:
   ```
   https://ruchibook.vercel.app
   ```

### 4b. Alternative: Netlify

Same idea — New site from Git → base directory `frontend` → build command `npm run build` → publish directory `frontend/dist` → add `VITE_API_URL` under Site settings → Environment variables.

---

## Part 5: Connect the two (fix CORS)

Right now your backend's `FRONTEND_URL` is still set to `http://localhost:5173`, so it will reject requests from your live Vercel site (the backend uses this to configure CORS — see `backend/src/server.ts`).

1. Go back to your Render dashboard → `ruchibook-api` → **Environment**
2. Update `FRONTEND_URL` to your real Vercel URL:
   ```
   FRONTEND_URL=https://ruchibook.vercel.app
   ```
3. Save — Render will automatically redeploy with the new value.

---

## Part 6: Production data is already seeded

No manual step needed here — the moment Render's build finished in Part 3, the backend connected to your Atlas database and auto-seeded the 20 sample recipes and default admin account, exactly like it did locally. You can confirm this already happened by checking the Render deploy logs for the `Auto-seeded 20 sample recipes` line, or by opening your Atlas cluster's **Collections** view and confirming the `recipes` collection has 20 documents.

---

## Part 7: Final checklist

Visit your live Vercel URL and verify:

- [ ] Home page loads recipes (confirms frontend → backend → MongoDB all connected)
- [ ] Language switcher changes text to Telugu/Hindi and persists on refresh
- [ ] Search and "What Can I Cook?" return results
- [ ] Register a new account, log in, favorite a recipe, refresh — favorite persists
- [ ] Log in as `admin@ruchibook.com`, reach `/admin`, add or edit a recipe
- [ ] Open the site on your phone (or shrink your browser to ~375px) — layout doesn't overflow or break
- [ ] Check the browser console for errors (F12 → Console) — should be clean

**Change the default admin password now that it's public-facing.** The easiest way: open your Atlas cluster's **Collections** view, find the `users` collection, and delete the seeded admin document, then re-run the seed script after editing the password in `backend/src/seed/seed.ts` — or simply register a normal account and manually flip its `role` field to `"admin"` in Atlas's UI, then delete the default one.

---

## Part 8: Updating the live app later

Once connected to GitHub, both Render and Vercel auto-deploy on every push:

```bash
git add .
git commit -m "Describe your change"
git push
```

Render rebuilds the backend, Vercel rebuilds the frontend, both within a minute or two. No manual redeploy steps needed after this initial setup.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Frontend loads but no recipes appear | `VITE_API_URL` on Vercel doesn't match your Render URL, or you forgot the `/api` suffix |
| Browser console shows a CORS error | `FRONTEND_URL` on Render doesn't exactly match your Vercel URL (must include `https://`, no trailing slash) |
| No recipes appear even after backend deploys successfully | Check Render's logs for `Auto-seeded...` — if missing, `MONGODB_URI` is likely wrong or the database user lacks write permission in Atlas |
| Render deploy fails on build | Check the build logs — usually a missing dependency or TypeScript error; run `npm run build` locally in `backend/` first to catch it early |
| First request after idling is very slow | Normal on Render's free tier (cold start) — see Part 3 note |
| Login works locally but not deployed | `JWT_SECRET` differs between environments, or you're hitting `localhost:5000` from the deployed frontend by mistake — check `VITE_API_URL` |

---

## Cost summary

Everything above fits in free tiers for a portfolio project:
- MongoDB Atlas M0: free forever (512MB storage)
- Render free web service: free, with cold starts after inactivity
- Vercel free tier: free, generous bandwidth for a personal project

If you outgrow free tiers later, Render's starter paid plan (~$7/mo) removes cold starts, which is the main upgrade worth considering.
