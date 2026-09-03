import express from "express";
import crypto from "node:crypto";
import { requireCustomer } from "../middleware/auth.js";

const router = express.Router();

router.post("/razorpay/order", requireCustomer, async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: "Razorpay is not configured" });
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}` },
    body: JSON.stringify({ amount: Math.round(Number(req.body.amount) * 100), currency: "INR", receipt: String(req.body.receipt || `kcs-${Date.now()}`).slice(0, 40) }),
  });
  if (!response.ok) return res.status(502).json({ message: "Unable to create Razorpay order" });
  res.json({ ...(await response.json()), keyId: process.env.RAZORPAY_KEY_ID });
});

router.post("/razorpay/verify", requireCustomer, (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
  const received = Buffer.from(String(signature || ""));
  const expectedBuffer = Buffer.from(expected);
  const verified = received.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, received);
  res.json({ verified });
});

router.post("/phonepe/order", requireCustomer, async (req, res) => {
  if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_SALT_KEY || !process.env.PHONEPE_SALT_INDEX) return res.status(503).json({ message: "PhonePe is not configured" });
  const payload = Buffer.from(JSON.stringify({ merchantId: process.env.PHONEPE_MERCHANT_ID, merchantTransactionId: `PP${Date.now()}`, merchantUserId: req.user.sub, amount: Math.round(Number(req.body.amount) * 100), redirectUrl: req.body.redirectUrl, redirectMode: "REDIRECT", callbackUrl: process.env.PHONEPE_CALLBACK_URL, paymentInstrument: { type: "PAY_PAGE" } })).toString("base64");
  const path = "/pg/v1/pay";
  const checksum = crypto.createHash("sha256").update(payload + path + process.env.PHONEPE_SALT_KEY).digest("hex") + "###" + process.env.PHONEPE_SALT_INDEX;
  const response = await fetch(`${process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox"}${path}`, { method: "POST", headers: { "Content-Type": "application/json", "X-VERIFY": checksum }, body: JSON.stringify({ request: payload }) });
  if (!response.ok) return res.status(502).json({ message: "Unable to create PhonePe payment" });
  res.json(await response.json());
});

export default router;