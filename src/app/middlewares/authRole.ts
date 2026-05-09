import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../errorHelpers/AppError";
import prisma from "../../shared/prisma";

export const authRole = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.uid) {
        throw new AppError(401, "Unauthorized: User context missing");
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.uid },
        select: { role: true },
      });

      if (!user || !roles.includes(user.role)) {
        throw new AppError(
          403,
          "Forbidden: You do not have the required permissions",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
