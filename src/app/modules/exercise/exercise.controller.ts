import { Request, Response } from "express";
import { ExerciseService } from "./exercise.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

const createExercise = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  // Fetch the role dynamically since the JWT token only contains uid/email
  const user = await prisma.user.findUnique({
    where: { id: req.user.uid },
    select: { role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const result = await ExerciseService.createExercise(
    req.user.uid,
    user.role,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Exercise created successfully!",
    data: result,
  });
});

const getAllExercises = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  // Fetch the role dynamically since the JWT token only contains uid/email
  const user = await prisma.user.findUnique({
    where: { id: req.user.uid },
    select: { role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const result = await ExerciseService.getAllExercises(req.user.uid, user.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Exercises retrieved successfully!",
    data: result,
  });
});

const getExerciseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ExerciseService.getExerciseById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Exercise retrieved successfully!",
    data: result,
  });
});

export const ExerciseController = {
  createExercise,
  getAllExercises,
  getExerciseById,
};
