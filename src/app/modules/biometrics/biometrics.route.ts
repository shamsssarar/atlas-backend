import express from "express";
import { BiometricsController } from "./biometrics.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { BiometricsValidations } from "./biometrics.validation";

const router = express.Router();

// Log or update daily biometrics (ATHLETE only)
router.post(
  "/",
  requireAuth,
  authRole("ATHLETE"),
  validateRequest(BiometricsValidations.logBiometricsZodSchema),
  BiometricsController.logDailyBiometrics,
);

// Get biometrics history (ATHLETE only)
router.get(
  "/",
  requireAuth,
  authRole("ATHLETE"),
  BiometricsController.getBiometricsHistory,
);

export const BiometricsRoutes = router;
