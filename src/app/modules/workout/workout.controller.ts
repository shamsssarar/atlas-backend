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

const addExerciseToLiveWorkout = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.uid) {
      throw new AppError(401, "Unauthorized");
    }

    const athleteId = req.user.uid;
    const { workoutId } = req.params;
    const result = await WorkoutService.addExerciseToLiveWorkout(
      athleteId,
      workoutId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Exercise added to live workout successfully",
      data: result,
    });
  },
);

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

const deleteWorkoutExercise = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.uid) {
      throw new AppError(401, "Unauthorized");
    }

    const { workoutExerciseId } = req.params;
    const result = await WorkoutService.deleteWorkoutExercise(
      workoutExerciseId as string,
      req.user.uid,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Workout exercise deleted successfully!",
      data: result,
    });
  },
);

const updateSetLog = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { setId } = req.params;
  const result = await WorkoutService.updateSetLog(
    setId as string,
    req.user.uid,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Set log updated successfully!",
    data: result,
  });
});

const deleteSetLog = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { setId } = req.params;
  const result = await WorkoutService.deleteSetLog(
    setId as string,
    req.user.uid,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Set log deleted successfully!",
    data: result,
  });
});

export const WorkoutController = {
  startWorkout,
  logSet,
  getWorkoutSummary,
  addExerciseToLiveWorkout,
  deleteWorkoutExercise,
  updateSetLog,
  deleteSetLog,
};
