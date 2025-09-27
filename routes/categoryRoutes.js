import { Router } from "express";
import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", protect, authorizeRoles("admin"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;
