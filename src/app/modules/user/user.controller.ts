import { Request, Response } from "express";

import { UserService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AppError } from "../../errorHelpers/AppError";

const syncUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized: User context missing");
  }

  const { uid, email } = req.user;
  const { firstName, lastName, role, bio, avatarUrl, name } = req.body;

  const fullName = name || [firstName, lastName].filter(Boolean).join(" ");

  const result = await UserService.syncUserToPrisma(uid, email || "", {
    name: fullName,
    role,
    bio,
    avatarUrl,
  });

  sendResponse(res, {
    statusCode: result.isNew ? 201 : 200,
    success: true,
    message: result.isNew
      ? "User created successfully!"
      : "User synced successfully!",
    data: result.user,
  });
});

export const UserController = {
  syncUser,
};
