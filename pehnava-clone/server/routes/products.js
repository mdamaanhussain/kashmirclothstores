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

    const products = await Product.find(q).sort({ createdAt: -1 });
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
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);
    const product = await Product.create({ ...body, slug });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.title && !body.slug) body.slug = slugify(body.title);
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
