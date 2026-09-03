import express from "express";
import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeVariantInventory(variants = []) {
  const seen = new Set();
  return variants.map((variant) => {
    const size = String(variant.size || "").trim();
    const color = String(variant.color || "").trim();
    const key = `${color.toLowerCase()}::${size.toLowerCase()}`;
    if (!size || !color) throw new Error("Every inventory row needs a color and size");
    if (seen.has(key)) throw new Error(`Duplicate inventory variant: ${color} + ${size}`);
    seen.add(key);
    return { size, color, stock: Math.max(0, Number(variant.stock) || 0) };
  });
}

function normalizeProductPayload(payload) {
  const body = { ...payload };
  if (Array.isArray(body.variantStock) && body.variantStock.length) {
    body.variantStock = normalizeVariantInventory(body.variantStock);
    body.sizes = [...new Set(body.variantStock.map((variant) => variant.size))];
    body.stock = body.variantStock.reduce((total, variant) => total + variant.stock, 0);
    body.soldOut = body.stock === 0;
  }
  if (Array.isArray(body.colors)) {
    const colorNames = new Set();
    body.colors = body.colors.map((color) => {
      const name = String(color.name || "").trim();
      const key = name.toLowerCase();
      if (!name || colorNames.has(key)) throw new Error(`Duplicate color: ${name}`);
      colorNames.add(key);
      return { ...color, name, images: Array.isArray(color.images) ? color.images : [] };
    });
  }
  return body;
}

// GET /api/products  -> list with filters
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, dupatta, search, ids } =
      req.query;
    const q = {};
    if (category) q.categories = category;
    if (color) q["colors.name"] = color;
    if (dupatta) q.dupatta = dupatta;
    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = Number(minPrice);
      if (maxPrice) q.price.$lte = Number(maxPrice);
    }
    if (search) q.$text = { $search: search };
    if (ids) q._id = { $in: ids.split(",") };

    const products = (await Product.find(q).sort({ createdAt: -1 })).map((product) => {
      const item = product.toObject();
      item.stock = Number.isFinite(item.stock) ? item.stock : 1;
      item.soldOut = item.soldOut || item.stock <= 0;
      item.salePrice = item.price * (1 - Math.min(99, item.discount || 0) / 100);
      return item;
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Not found" });
    const item = product.toObject();
    item.stock = Number.isFinite(item.stock) ? item.stock : 1;
    item.soldOut = item.soldOut || item.stock <= 0;
    item.salePrice = item.price * (1 - Math.min(99, item.discount || 0) / 100);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = normalizeProductPayload(req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);
    const product = await Product.create({ ...body, slug, soldOut: Boolean(body.soldOut) || Number(body.stock) <= 0 });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const body = normalizeProductPayload(req.body);
    if (body.title && !body.slug) body.slug = slugify(body.title);
    if (body.stock !== undefined && Number(body.stock) <= 0) body.soldOut = true;
    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
