import express from "express";
import { Router } from "express";
import { createNewStore, getSellerStore } from "../controllers/storeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";

const router = express.Router()

router.post("/createStore", protect, authorizeRoles("seller"), createNewStore)
router.get("/myStore", protect, authorizeRoles("seller"), getSellerStore)


export default router;