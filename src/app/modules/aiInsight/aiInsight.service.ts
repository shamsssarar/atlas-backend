import { AIInsight } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";
import { config } from "../../config/env";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY as string);

const generateFatigueInsight = async (
  athleteId: string,
): Promise<AIInsight> => {
  // 1. Fetch the last 7 days of biometrics for the athlete
  const biometrics = await prisma.biometrics.findMany({
    where: {
      athleteId,
      deletedAt: null,
    },
    orderBy: {
      date: "desc",
    },
    take: 7,
  });

  // 2. Guardrail: Ensure we have enough data for a reliable analysis
  if (biometrics.length < 1) {
    throw new AppError(
      400,
      "Not enough biometric data to generate a reliable AI insight. Minimum 1 day required.",
    );
  }

  // 3. Clean and format the data for the LLM context
  const biometricsContext = biometrics.map((b) => ({
    date: b.date,
    weight: b.weight,
    sleepQuality: b.sleepQuality,
    sleepHours: b.sleepHours,
    restingHeartRate: b.restingHeartRate,
    subjectiveStress: b.subjectiveStress,
  }));

  const biometricsJson = JSON.stringify(biometricsContext);

  // 4. System Prompt and Model Configuration
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json", // Enforces native JSON output format from Gemini
    },
  });

  const prompt = `
    You are an Elite Sports Scientist and CNS (Central Nervous System) Recovery Expert.
    Analyze the following up-to-7-day biometric data for an athlete and determine their current fatigue levels, recovery status, and if they require a deload.

    Biometric Data:
    ${biometricsJson}

    You MUST respond in raw, parseable JSON format without Markdown blocks.
    The expected JSON schema output from Gemini should be:
    {
      "fatigueScore": <number between 1-100>,
      "status": "<one of: OPTIMAL, MODERATE_FATIGUE, HIGH_CNS_FATIGUE>",
      "recommendation": "<detailed string recommending specific actions>",
      "isDeloadRecommended": <boolean>
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    // LLMs can sometimes be stubborn and still include markdown like ```json ... ```
    // We strip it here before parsing to prevent crash loops
    const cleanJsonStr = textResponse.replace(/```json\n?|```\n?/gi, "").trim();
    const parsedContent = JSON.parse(cleanJsonStr);

    // 5. Save the structured output to the database
    return await prisma.aIInsight.create({
      data: {
        athleteId,
        type: "FATIGUE_ALERT",
        content: JSON.stringify(parsedContent),
      },
    });
  } catch (error: any) {
    // Gracefully handle Gemini API Rate Limits and Billing Issues
    if (error.message?.includes("429") || error.status === 429) {
      throw new AppError(
        429,
        "AI service quota exceeded or billing depleted. Please try again later.",
      );
    }

    throw new AppError(
      500,
      `AI Insight Generation failed: ${error.message || "Failed to parse AI output"}`,
    );
  }
};

export const AIInsightService = {
  generateFatigueInsight,
};
