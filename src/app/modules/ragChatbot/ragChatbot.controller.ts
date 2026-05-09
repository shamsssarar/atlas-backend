import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { RagChatbotService } from "./ragChatbot.service";
import { AppError } from "../../errorHelpers/AppError";
import { DocumentEmbeddingService } from "../aiInsight/documentEmbedding.service";

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

const addCoachKnowledge = catchAsync(async (req: Request, res: Response) => {
  const coachId = req.user?.uid;
  const { content } = req.body;

  // Create a unique key for this chunk of knowledge
  const chunkKey = `coach-${coachId}-${Date.now()}`;

  await DocumentEmbeddingService.addDocumentChunk({
    chunkKey,
    sourceType: "COACH_RULE",
    sourceId: coachId as string,
    content,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Knowledge successfully embedded and saved to database",
    data: null,
  });
});

export const RagChatbotController = { askCoach, addCoachKnowledge };
