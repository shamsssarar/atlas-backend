import { Request, Response } from "express";
import { ProgramDayService } from "./programDay.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AppError } from "../../errorHelpers/AppError";

const createProgramDay = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await ProgramDayService.createProgramDay(
    req.user.uid,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Program day created successfully!",
    data: result,
  });
});

const updateProgramDay = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { id } = req.params;
  const result = await ProgramDayService.updateProgramDay(
    id as string,
    req.user.uid,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Program day updated successfully!",
    data: result,
  });
});

const deleteProgramDay = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { id } = req.params;
  const result = await ProgramDayService.deleteProgramDay(
    id as string,
    req.user.uid,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Program day deleted successfully!",
    data: result,
  });
});

const addExerciseTargetToDay = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.uid) {
      throw new AppError(401, "Unauthorized");
    }

    // We expect the programDayId in the route params, e.g., POST /program-days/:id/targets
    const { id } = req.params;
    const result = await ProgramDayService.addExerciseTargetToDay(
      id as string,
      req.user.uid,
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Exercise target added to day successfully!",
      data: result,
    });
  },
);

export const ProgramDayController = {
  createProgramDay,
  updateProgramDay,
  deleteProgramDay,
  addExerciseTargetToDay,
};
