import { Request, Response } from "express";
import { ProgramService } from "./program.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

const createProgram = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await ProgramService.createProgram(req.user.uid, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Program created successfully!",
    data: result,
  });
});

const getCoachPrograms = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await ProgramService.getCoachPrograms(req.user.uid);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coach programs retrieved successfully!",
    data: result,
  });
});

const getAllProgramsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await ProgramService.getAllProgramsForAdmin(page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All programs retrieved successfully for admin!",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getProgramById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProgramService.getProgramById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Program retrieved successfully!",
    data: result,
  });
});

const updateProgram = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { id } = req.params;
  const result = await ProgramService.updateProgram(
    id as string,
    req.user.uid,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Program updated successfully!",
    data: result,
  });
});

const deleteProgram = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    throw new AppError(401, "Unauthorized");
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: req.user.uid },
    select: { role: true },
  });

  const result = await ProgramService.deleteProgram(
    id as string,
    req.user.uid,
    user?.role || "ATHLETE",
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Program deleted successfully!",
    data: result,
  });
});

export const ProgramController = {
  createProgram,
  getCoachPrograms,
  getAllProgramsForAdmin,
  getProgramById,
  updateProgram,
  deleteProgram,
};
