import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessages } from "../controllers/message.controller.js";

const router = express.Router();

// Specific routes first
router.get("/users", protectRoute, getUsersForSidebar)

// Dynamic routes last
router.get("/:id", protectRoute, getMessages)
router.post("/send/:id", protectRoute, sendMessages)


export default router;