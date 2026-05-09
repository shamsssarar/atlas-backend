import express from "express";
import { WorkoutController } from "./workout.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { WorkoutValidations } from "./workout.validation";

const router = express.Router();

// Start a new workout session (ATHLETE only)
router.post(
  "/",
  requireAuth,
  authRole("ATHLETE"),
  validateRequest(WorkoutValidations.startWorkoutZodSchema),
  WorkoutController.startWorkout,
);

router.post(
  "/:workoutId/exercises",
  requireAuth,
  authRole("ATHLETE"),
  validateRequest(WorkoutValidations.addExerciseZodSchema),
  WorkoutController.addExerciseToLiveWorkout,
);

// Log a set for a specific workout exercise (ATHLETE only)
router.post(
  "/exercises/:workoutExerciseId/sets",
  requireAuth,
  authRole("ATHLETE"),
  validateRequest(WorkoutValidations.logSetZodSchema),
  WorkoutController.logSet,
);

// Get a detailed summary of a specific workout (ATHLETE only)
router.get(
  "/:workoutId",
  requireAuth,
  authRole("ATHLETE"),
  WorkoutController.getWorkoutSummary,
);

export const WorkoutRoutes = router;
