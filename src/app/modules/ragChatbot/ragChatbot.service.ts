import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";
import { DocumentEmbeddingService } from "../aiInsight/documentEmbedding.service";
import { config } from "../../config/env";

// Initialize Gemini with the blazing fast flash model for conversational responses
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const askCoach = async (
  athleteId: string,
  question: string,
): Promise<string> => {
  // 1. Verify the athlete and retrieve their assigned Coach's ID
  const athlete = await prisma.user.findUnique({
    where: { id: athleteId },
    select: { coachId: true },
  });

  if (!athlete) {
    throw new AppError(404, "Athlete not found in the database.");
  }

  if (!athlete.coachId) {
    throw new AppError(
      400,
      "You must be assigned to a coach to use the RAG Chatbot.",
    );
  }

  // 2. Perform the Vector Similarity Search via the Embedding Service
  const similarDocs = await DocumentEmbeddingService.searchSimilarDocuments(
    question,
    "COACH_RULE",
    athlete.coachId,
    3,
  );

  // 3. Combine retrieved chunks into a single context string
  const context = similarDocs.map((doc) => doc.content).join("\n\n---\n\n");

  // 4. Construct the prompt with strict RAG guardrails
  const prompt = `
    You are an elite AI assistant trained exclusively on the proprietary methodology of this specific coach.
    Answer the athlete's question using ONLY the provided Coach Context below. 
    If the context does not contain the answer, say "I don't have enough context from your coach to answer that, but I will flag this for them to review." Do not attempt to guess or use outside knowledge.

    Coach Context:
    ${context}

    Athlete Question:
    ${question}
  `;

  // 5. Generate and return the response
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const RagChatbotService = { askCoach };
