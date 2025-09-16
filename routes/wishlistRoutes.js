import { Router } from "express";
import express from "express";
import { getWishlist, removeFromWishlist, addToWishlist } from "../controllers/wishlistController.js";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";


const router = express.Router()

router.post("/wishlist/:productId", protect, authorizeRoles("buyer"), addToWishlist)
router.delete("/wishlist/:productId", protect, authorizeRoles("buyer"), removeFromWishlist)
router.get("/wishlist", protect, authorizeRoles("buyer"), getWishlist)

export default router;