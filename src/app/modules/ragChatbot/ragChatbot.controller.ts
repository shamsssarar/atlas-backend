import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { RagChatbotService } from "./ragChatbot.service";
import { AppError } from "../../errorHelpers/AppError";

const askCoach = catchAsync(async (req: Request, res: Response) => {
  const athleteId = req.user?.uid;
  const { question } = req.body;

  if (!athleteId) throw new AppError(401, "Unauthorized access.");
  if (!question) throw new AppError(400, "Question payload is required.");

  const answer = await RagChatbotService.askCoach(athleteId, question);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coach insight retrieved successfully",
    data: { answer },
  });
});

export const RagChatbotController = { askCoach };
