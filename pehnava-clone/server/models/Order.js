import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
  items: [{ productId: String, title: String, image: String, quantity: Number, price: Number, size: String, color: String }],
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["cod", "phonepe", "razorpay", "phonepe-manual", "razorpay-manual", "instagram", "whatsapp"], required: true },
  source: { type: String, enum: ["website", "whatsapp", "instagram", "admin"], default: "website" },
  paymentId: String,
  status: { type: String, enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  trackingNumber: String,
  carrier: String,
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);