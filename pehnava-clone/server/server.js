import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import customerRoutes from "./routes/customers.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import Customer from "./models/Customer.js";

dotenv.config();

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
  console.error("Missing required environment variables: MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json());
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://kashmirclothstores.vercel.app",
  ...(process.env.CLIENT_ORIGIN || "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
  allowedHeaders: ["Content-Type", "Authorization", "X-Customer-Authorization"],
  credentials: false
}));

app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => res.send("Kashmir Cloth Stores API is running"));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas connected");
    Customer.collection.dropIndex("email_1").catch(() => {});
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the existing server or set another PORT in .env.`);
      } else {
        console.error("Server listen error:", error.message);
      }
      mongoose.disconnect().finally(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
