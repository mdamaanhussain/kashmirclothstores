import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Wrong password" });
  }
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

export default router;
