import { Router } from "express";
import { authorizeRoles, protect } from "../middleware/authMiddlware.js";
import express from "express";
import {
  getUserCart,
  addToCart,
  updateItemQuantity,
  removeItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/cart", protect, authorizeRoles("buyer"), getUserCart);
router.post("/cart/add", protect, authorizeRoles("buyer"), addToCart);
router.put(
  "/cart/update/:productId",
  protect,
  authorizeRoles("buyer"),
  updateItemQuantity
);
router.delete(
  "/cart/remove/:productId",
  protect,
  authorizeRoles("buyer"),
  removeItem
);
router.delete("/cart/clear", protect, authorizeRoles("buyer"), clearCart);

export default router;
