import express from "express";
import { Router } from "express";
import { createNewStore } from "../controllers/storeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";

const router = express.Router()

router.post("/createStore", protect, authorizeRoles("seller"), createNewStore)


export default router;