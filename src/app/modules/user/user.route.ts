import express from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "../../lib/auth";

const router = express.Router();

router.post("/sync", requireAuth, UserController.syncUser);

export const UserRoutes = router;
