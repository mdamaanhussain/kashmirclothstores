# E-Commerce Website — React (MERN)

Full responsive React e-commerce app for Kashmir Cloth Stores, with a MongoDB-Atlas-backed
admin panel for CRUD, likes/wishlist, recently viewed, category filters, search,
share, and an Instagram "Buy It Now" redirect.

## Folder structure
```
kashmir-cloth-stores/
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

Use **Homepage media** from the dashboard to manage Influencer Picks, the
curated Instagram feed, and approved customer reviews. Influencer title and
creator name are optional. Add public HTTPS photo/video URLs (including public
Google Cloud Storage object URLs); Instagram feed entries also need the
Instagram post/reel URL and a public thumbnail URL. Reviews entered by an
administrator are displayed as approved homepage testimonials. The app stores
and displays these links but does not upload files to a GCS bucket.

The Homepage media page also supports multiple desktop hero images, matching
mobile hero images, per-category image URLs, and multiple showroom image URLs
(displayed as a showroom carousel). Enter one public HTTPS URL per line for
hero and showroom images. Admin Products, Orders, and Customers are available
as separate dashboard pages.

The homepage showroom section uses the store photo at
`client/public/showroom/kashmir-storefront.png`, the provided Google Maps
location link, and the published opening hours and phone number.

Use **Storefront settings** in the admin panel to edit and add categories,
choose homepage category visibility/order, update announcement messages, manage
multiple showroom locations and their map links, and edit Shop by Color,
Contact Us, Our Story, and footer content. Product categories use the matching
product tag configured on each category. Collection pages also support sorting
by price and product name; custom color names and shades can be added from the
product editor.

Use the separate **Homepage carousels** page under Storefront settings to edit
carousel titles, add or remove sections, control visibility and display order,
and choose newest products, a category tag, or a price range. Each section can
link to a collection. Opening Search from the mobile navigation displays
products to explore even when no search phrase has been entered.

From the admin Orders page, update orders through Order Placed, Payment
Confirmed, Processing / Packed, Shipped, Out for Delivery, Delivered, and
Cancelled / Refund. Cancellation updates the order and restores stock once; it
does not issue a payment-provider refund, which must be processed manually.
Order delivery details can be edited, and edits are marked in the customer's
order history. Deleting an order is separate from deleting a customer.

Customers can sign in with their email address or phone number at `/account`
to follow order status and submit a review after delivery. These order reviews
are visible to admins in the Orders page and are not published as homepage
testimonials automatically. Deleting a customer removes their profile and
anonymizes personal details and review content on retained order records.

Customer sign-up requires both a valid email address and a 10-digit Indian
mobile number. The admin customer editor applies the same validation; older
records with malformed phone or email values are marked for correction and
must be fixed before saving.

The admin panel has separate Products, Add Product, Sales, Orders, and
Customers pages. Product stock is reviewed in a confirmation preview before
saving. When size/color quantities are configured, those rows are the source of
truth and automatically determine each color total and the product total.
Without size rows, color stock totals determine the product total.

The admin Sales History defaults to Today. Sales history and customer/order
exports can be filtered by today, this week, this month, this year, last year,
or a custom date range before downloading/printing a PDF or image.

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
