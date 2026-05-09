import { Request, Response } from "express";
import { BiometricsService } from "./biometrics.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AppError } from "../../errorHelpers/AppError";

const logDailyBiometrics = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await BiometricsService.logDailyBiometrics(
    req.user.uid,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Daily biometrics logged successfully!",
    data: result,
  });
});

const getBiometricsHistory = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
  const validDays = isNaN(days) ? 7 : days;
  const result = await BiometricsService.getBiometricsHistory(
    req.user.uid,
    validDays,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Biometrics history retrieved successfully!",
    data: result,
  });
});

export const BiometricsController = {
  logDailyBiometrics,
  getBiometricsHistory,
};
