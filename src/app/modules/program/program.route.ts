import express from "express";
import { ProgramController } from "./program.controller";
import { requireAuth } from "../../lib/auth";
import { authRole } from "../../middlewares/authRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProgramValidation } from "./program.validation";

const router = express.Router();

// Create a new program (COACH only)
router.post(
  "/",
  requireAuth,
  authRole("COACH"),
  validateRequest(ProgramValidation.createProgramZodSchema),
  ProgramController.createProgram,
);

// Get all programs created by the logged-in coach (COACH only)
router.get(
  "/my-programs",
  requireAuth,
  authRole("COACH"),
  ProgramController.getCoachPrograms,
);

// Get all programs globally (ADMIN only)
router.get(
  "/programs",
  requireAuth,
  authRole("ADMIN"),
  ProgramController.getAllProgramsForAdmin,
);

// Get all programs globally (Public)
router.get("/public", ProgramController.getAllPublicPrograms);

// Get a specific program by ID (Authenticated)
router.get("/:id", ProgramController.getProgramById);

// Update a specific program (COACH only, ownership verified in service)
router.patch(
  "/:id",
  requireAuth,
  authRole("COACH"),
  validateRequest(ProgramValidation.updateProgramZodSchema),
  ProgramController.updateProgram,
);

// Soft delete a specific program (COACH or ADMIN, ownership verified in service)
router.delete(
  "/:id",
  requireAuth,
  authRole("COACH", "ADMIN"),
  ProgramController.deleteProgram,
);

export const ProgramRoutes = router;
