import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { WorkoutRoutes } from "../modules/workout/workout.route";
import { ProgramRoutes } from "../modules/program/program.route";
import path from "path";
import { ProgramDayRoutes } from "../modules/programDay/programDay.route";
import { ExerciseRoutes } from "../modules/exercise/exercise.route";
import { BiometricsRoutes } from "../modules/biometrics/biometrics.route";
import { AIInsightRoutes } from "../modules/aiInsight/aiInsight.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  // Add more routes for other modules here
  {
    path: "/programs",
    route: ProgramRoutes,
  },
  {
    path: "/workouts",
    route: WorkoutRoutes,
  },
  {
    path: "/programDays",
    route: ProgramDayRoutes,
  },
  {
    path: "/exercises",
    route: ExerciseRoutes,
  },
  {
    path: "/biometrics",
    route: BiometricsRoutes,
  },
  {
    path: "/aiInsights",
    route: AIInsightRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const AppRoutes = router;
