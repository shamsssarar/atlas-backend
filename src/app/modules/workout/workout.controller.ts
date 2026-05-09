import { Request, Response } from "express";
import { WorkoutService } from "./workout.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AppError } from "../../errorHelpers/AppError";

const startWorkout = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await WorkoutService.startWorkout(req.user.uid, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Workout started successfully!",
    data: result,
  });
});

const logSet = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { workoutExerciseId } = req.params;
  const result = await WorkoutService.logSet(
    req.user.uid,
    workoutExerciseId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Set logged successfully!",
    data: result,
  });
});

const getWorkoutSummary = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { workoutId } = req.params;
  const result = await WorkoutService.getWorkoutSummary(
    workoutId as string,
    req.user.uid,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workout summary retrieved successfully!",
    data: result,
  });
});

export const WorkoutController = {
  startWorkout,
  logSet,
  getWorkoutSummary,
};
