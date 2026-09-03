import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import { requireCustomer } from "../middleware/auth.js";

const router = express.Router();
const tokenFor = (customer) => jwt.sign({ sub: customer._id.toString(), role: "customer", phone: customer.phone }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password, marketingConsent = false } = req.body;
    if (!name || !phone || !password || password.length < 8) return res.status(400).json({ message: "Name, phone number and an 8 character password are required" });
    const normalizedPhone = phone.trim().replace(/[\s-]/g, "");
    if (await Customer.exists({ phone: normalizedPhone })) return res.status(409).json({ message: "An account already exists for this phone number" });
    const customer = await Customer.create({ name: name.trim(), phone: normalizedPhone, email: email?.trim().toLowerCase() || undefined, passwordHash: await bcrypt.hash(password, 12), marketingConsent: Boolean(marketingConsent) });
    res.status(201).json({ token: tokenFor(customer), customer: { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email, marketingConsent: customer.marketingConsent } });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.post("/login", async (req, res) => {
  const customer = await Customer.findOne({ phone: String(req.body.phone || "").trim().replace(/[\s-]/g, "") });
  if (!customer || !(await bcrypt.compare(req.body.password || "", customer.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: tokenFor(customer), customer: { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email, marketingConsent: customer.marketingConsent } });
});

router.get("/me", requireCustomer, async (req, res) => res.json(await Customer.findById(req.user.sub).select("name phone email marketingConsent createdAt")));
export default router;