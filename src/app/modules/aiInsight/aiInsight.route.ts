import express from "express";
import { AIInsightController } from "./aiInsight.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole";

const router = express.Router();

router.use(requireAuth, authRole("ATHLETE"));

router.post("/generate-fatigue", AIInsightController.generateFatigueInsight);

export const AIInsightRoutes = router;