import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Server Up and Running"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use("/api/v1", userRoutes);
app.use("/api/v1", storeRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", wishlistRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1/order", orderRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
