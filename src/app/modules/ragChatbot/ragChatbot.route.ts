import { Router } from "express";
import { RagChatbotController } from "./ragChatbot.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole"; // Assuming standard path based on Atlas SOP

const router = Router();

// POST /api/ai/ask
router.post(
  "/ask",
  requireAuth,
  authRole("ATHLETE"),
  RagChatbotController.askCoach,
);

router.post(
  "/knowledge",
  requireAuth,
  authRole("COACH"),
  RagChatbotController.addCoachKnowledge,
);

export const RagChatbotRoutes = router;
