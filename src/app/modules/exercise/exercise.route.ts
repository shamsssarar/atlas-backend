import express from "express";
import { ExerciseController } from "./exercise.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { ExerciseValidation } from "./exercise.validation";

const router = express.Router();

// Create a new exercise (ADMIN or COACH only)
router.post(
  "/",
  requireAuth,
  authRole("ADMIN", "COACH"),
  validateRequest(ExerciseValidation.createExerciseZodSchema),
  ExerciseController.createExercise,
);

// Get all exercises (Global + User's Custom)
router.get(
  "/",
  requireAuth,
  authRole("ADMIN", "COACH", "ATHLETE"),
  ExerciseController.getAllExercises,
);

// Get exercise by ID
router.get("/:id", requireAuth, ExerciseController.getExerciseById);

export const ExerciseRoutes = router;
