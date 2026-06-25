# Chai Al Saadah Cafeteria — Smart Billing & POS

A single-page React app (POS, billing, kitchen display, inventory, expenses,
daily profit & loss, reports) for **Chai Al Saadah Cafeteria LLC**, Dadnah,
Fujairah, UAE.

This is a complete, buildable project. It is **not** just one `.jsx` file — that
is why uploading only the component to Vercel produced `404: NOT_FOUND`. Vercel
needs the whole project (this folder) so it can run the build and serve the
generated site.

---

## Run it on your computer first (optional but recommended)

You need **Node.js 18 or newer** (https://nodejs.org).

```bash
npm install        # download dependencies (one time)
npm run dev        # start a local server, opens http://localhost:5173
```

Build the production version (this is exactly what Vercel runs):

```bash
npm run build      # output goes into the dist/ folder
npm run preview    # preview that production build locally
```

---

## Deploy to Vercel

### Option A — GitHub + Vercel (recommended)

1. Put **all the files in this folder** into your GitHub repository (the repo
   root must contain `package.json`, `index.html`, and the `src/` folder).
   Do **not** commit `node_modules` or `dist` (they are in `.gitignore`).
2. Commit and push to GitHub.
3. Go to https://vercel.com → **Add New… → Project** → import your repo.
4. Vercel auto-detects the settings. Confirm they are:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build` (or `npm run build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**. After it finishes, the site loads at your `*.vercel.app`
   URL — no more 404.

If you already had a repo connected to Vercel, just replace its files with these,
push, and Vercel will rebuild automatically.

### Option B — Vercel CLI (no GitHub needed)

```bash
npm install -g vercel
vercel              # follow the prompts; accept the detected Vite settings
vercel --prod       # promote to your production URL
```

---

## If you still see a 404 after deploying

It almost always means Vercel didn't build from source. Check, in your Vercel
project's **Settings → Build & Deployment**:

- Framework Preset is **Vite** (not "Other").
- Output Directory is **`dist`**.
- The repo root (not a subfolder) contains `package.json`.

A `vercel.json` is included to serve `index.html` for every route, so refreshing
the page never 404s.

---

## Demo logins

Sign in with a Staff ID + PIN. The PIN for every demo account is **1234**:

| Staff ID  | Role          |
|-----------|---------------|
| `owner`   | Owner         |
| `manager` | Manager       |
| `cashier` | Cashier       |
| `kitchen` | Kitchen Staff |

---

## Important: data is not saved yet

All data (orders, expenses, menu edits) lives in the browser for the current
session and resets on refresh. This is the **front-end**. To make data permanent
and shared across devices/registers, connect a backend (e.g. Supabase) — this UI
is built to wire straight into it.

## Tech

React 18 · Vite · Tailwind CSS · Recharts · SheetJS (xlsx) · lucide-react.
