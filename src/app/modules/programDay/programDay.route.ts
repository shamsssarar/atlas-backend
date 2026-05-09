import express from "express";
import { ProgramDayController } from "./programDay.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProgramDayValidation } from "./programDay.validation";

const router = express.Router();

// Create a new program day (COACH only)
router.post(
  "/",
  requireAuth,
  authRole("COACH"),
  validateRequest(ProgramDayValidation.createProgramDayZodSchema),
  ProgramDayController.createProgramDay,
);

// Update a program day (COACH only)
router.patch(
  "/:id",
  requireAuth,
  authRole("COACH"),
  validateRequest(ProgramDayValidation.updateProgramDayZodSchema),
  ProgramDayController.updateProgramDay,
);

// Delete a program day (COACH only)
router.delete(
  "/:id",
  requireAuth,
  authRole("COACH"),
  ProgramDayController.deleteProgramDay,
);

// Add an exercise target to a specific program day (COACH only)
router.post(
  "/:id/targets",
  requireAuth,
  authRole("COACH"),
  validateRequest(ProgramDayValidation.addExerciseTargetZodSchema),
  ProgramDayController.addExerciseTargetToDay,
);

export const ProgramDayRoutes = router;
