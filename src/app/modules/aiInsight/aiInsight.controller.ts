import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AIInsightService } from "./aiInsight.service";

const generateFatigueInsight = catchAsync(async (req: Request, res: Response) => {
  const athleteId = req.user?.uid;

  if (!athleteId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "User is not authenticated",
    });
  }

  const result = await AIInsightService.generateFatigueInsight(athleteId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI Fatigue Insight generated successfully",
    data: result,
  });
});

export const AIInsightController = {
  generateFatigueInsight,
};