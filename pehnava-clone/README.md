# E-Commerce Website — React (MERN)

Full responsive React clone of the Pehnava Lawns layout, with a MongoDB-Atlas-backed
admin panel for CRUD, likes/wishlist, recently viewed, category filters, search,
share, and an Instagram "Buy It Now" redirect.

## Folder structure
```
pehnava-clone/
  server/   -> Express + Mongoose API (connects to MongoDB Atlas)
  client/   -> React + Vite frontend
```

## 1. Backend setup
```bash
cd server
npm install
cp .env.example .env
```
Edit `.env`:
- `MONGODB_URI` — your MongoDB Atlas connection string (Atlas dashboard -> Connect -> Drivers)
- `ADMIN_PASSWORD` — password to log into `/admin`
- `JWT_SECRET` — any long random string

Seed 10 starter products (safe to re-run, it replaces existing products):
```bash
npm run seed
```

Run the API:
```bash
npm run dev
```
API runs on `http://localhost:5000/api`.

## 2. Frontend setup
```bash
cd client
npm install
cp .env.example .env
```
Edit `.env`:
- `VITE_API_URL` — e.g. `http://localhost:5000/api`
- `VITE_INSTAGRAM_USERNAME` — **replace with your real Instagram username.**
  This powers the "Buy It Now" button: it copies the product name + code to the
  clipboard and opens `https://ig.me/m/<username>` (Instagram's direct-message
  compose link — works reliably for Instagram **business/creator** accounts;
  for a personal account it opens your profile instead, since Instagram
  doesn't allow pre-filled DM text from outside links).

Run it:
```bash
npm run dev
```
Opens on `http://localhost:5173`.

## 3. Admin Panel
Go to `/admin`, log in with `ADMIN_PASSWORD`. From `/admin/dashboard` you can
add/edit/delete products — set price, images (paste your own photo URLs),
sizes, colors (name:hex), fabric/dupatta, and tick every category the product
should appear under (a product can be in New Drop **and** Daily Wear **and**
Party Wear at once, etc.) — Budget categories (Under ₹1,699 etc.) are computed
automatically from price, so you don't pick those.

Only 10 placeholder products are seeded on purpose so your home page isn't
empty — add your real ones (with real photos) from the admin panel any time.

## 4. Features implemented
- Fully responsive layout (desktop / tablet / mobile), same structure as the
  reference site: announcement bar, sticky header + search, hero, "Our
  Category" strip, product grid, category/collection pages with a sidebar
  (categories, price range, color palette with name-only-on-hover tooltip,
  dupatta filter), product detail page (gallery, tabs, size/color, recently
  viewed).
- Hover effects: product title underlines, product photo shows size/type
  badge overlay, Buy-It-Now turns black on hover, category tiles lift + zoom,
  share/like icon buttons fill in.
- Buy It Now → copies "product name + code" to clipboard and opens your
  Instagram DM link.
- Share button → native mobile share sheet (falls back to "copy link").
- Like/Wishlist → stored per-device in the browser (no login needed); the ♥
  icon in the header opens `/likes` showing everything you've liked.
- Recently viewed → stored per-device, shown at the bottom of each product page.
- Search bar in the header searches title/SKU.
- One product can carry any number of categories, so it shows up under every
  matching menu/collection automatically.

## 5. Deploying
- **Frontend** (`client/`): deploy to Vercel or Netlify as a normal Vite app
  (`npm run build` → publish `dist/`). Set `VITE_API_URL` to your deployed
  backend URL and `VITE_INSTAGRAM_USERNAME` as an environment variable there.
- **Backend** (`server/`): Vercel/Netlify don't run a persistent Node+Mongo
  server well — deploy it to **Render** or **Railway** (free tiers work fine),
  set the same env vars as `.env`, and point MongoDB Atlas's Network Access
  to allow connections from anywhere (`0.0.0.0/0`) or that host's IP.
- After both are live, update the frontend's `VITE_API_URL` to the live
  backend URL and redeploy the frontend.

## 6. Notes
- Product photos are placeholder images by default — swap them for your real
  photos (any image URL works — Shopify CDN, Imgur, Cloudinary, etc.) from
  the admin panel.
- There's no shopping cart/checkout, matching what was asked for — customers
  finalize the order over Instagram DM instead.
