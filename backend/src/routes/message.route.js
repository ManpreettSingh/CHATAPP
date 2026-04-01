import express from "express";
import rateLimit from "express-rate-limit";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessages, getChatStats, searchMessages } from "../controllers/message.controller.js";

const router = express.Router();

// Rate limiter for analytics and search endpoints
const queryLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});

// Static / specific routes first
router.get("/users", queryLimiter, protectRoute, getUsersForSidebar)
// Aggregation: chat analytics  GET /api/messages/stats/:id?days=7
router.get("/stats/:id", queryLimiter, protectRoute, getChatStats)
// Text search: search messages  GET /api/messages/search/:id?q=keyword
router.get("/search/:id", queryLimiter, protectRoute, searchMessages)
// Dynamic catch-all routes last
router.get("/:id", protectRoute, getMessages)
router.post("/send/:id", protectRoute, sendMessages)


export default router; 