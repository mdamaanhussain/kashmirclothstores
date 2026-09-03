import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { requireCustomer, requireAdmin } from "../middleware/auth.js";
import { notifyOrder } from "../services/notifications.js";

const router = express.Router();
router.get("/", requireCustomer, async (req, res) => res.json(await Order.find({ customer: req.user.sub }).sort({ createdAt: -1 })));
router.post("/", requireCustomer, async (req, res) => {
  const { items, paymentMethod, shippingAddress, paymentId } = req.body;
  if (!Array.isArray(items) || !items.length || !shippingAddress || !["cod", "phonepe", "razorpay"].includes(paymentMethod)) return res.status(400).json({ message: "Valid order details are required" });
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, soldOut: false }).select("title images price discount stock variantStock");
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const trustedItems = items.map((item) => {
    const product = productMap.get(String(item.productId));
    const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
    if (!product) return null;
    const hasVariantInventory = product.variantStock?.length > 0;
    const variant = product.variantStock?.find((entry) => entry.size === item.size && entry.color === item.color);
    const available = hasVariantInventory ? variant?.stock ?? 0 : product.stock ?? 1;
    if (available < quantity) return null;
    const price = product.price * (1 - Math.min(99, product.discount || 0) / 100);
    return { productId: product._id.toString(), title: product.title, image: product.images?.[0] || "", quantity, price, size: item.size, color: item.color };
  }).filter(Boolean);
  if (trustedItems.length !== items.length) return res.status(400).json({ message: "One or more products are unavailable" });
  for (const item of trustedItems) {
    const product = productMap.get(item.productId);
    const variant = product.variantStock?.find((entry) => entry.size === item.size && entry.color === item.color);
    const updated = variant
      ? await Product.updateOne({ _id: product._id, stock: { $gte: item.quantity }, variantStock: { $elemMatch: { size: item.size, color: item.color, stock: { $gte: item.quantity } } } }, { $inc: { "variantStock.$.stock": -item.quantity, stock: -item.quantity } })
      : await Product.updateOne({ _id: product._id, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
    if (!updated.modifiedCount) return res.status(409).json({ message: "Selected product variant just went out of stock" });
  }
  const total = trustedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ customer: req.user.sub, items: trustedItems, total, paymentMethod, shippingAddress, paymentId, status: paymentMethod === "cod" ? "processing" : "paid", source: "website" });
    await notifyOrder(order, "created");
  res.status(201).json(order);
});
router.get("/:id", requireCustomer, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user.sub });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});
router.patch("/:id/tracking", requireAdmin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { trackingNumber: req.body.trackingNumber, carrier: req.body.carrier, status: "shipped" }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});
export default router;