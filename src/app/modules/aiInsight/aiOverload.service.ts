import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";
import { config } from "../../config/env";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY as string);

interface WorkoutRecommendation {
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  recommendedWeight: number;
  overloadRationale: string;
}

const generateNextWorkout = async (
  athleteId: string,
): Promise<WorkoutRecommendation[]> => {
  try {
    // 1. Query for the most recent completed workout
    const previousWorkout = await prisma.workout.findFirst({
      where: {
        athleteId,
        isCompleted: true,
        deletedAt: null,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    // 2. Initialize the model with JSON output
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let prompt: string;

    // 3. Generate prompt based on workout history
    if (!previousWorkout) {
      // Baseline starter workout prompt
      prompt = `
        You are an Elite Strength & Conditioning Coach.
        The athlete has no previous workout history. Generate a balanced full-body starter routine for their first session.
        
        Focus on compound movements with appropriate volume for beginners.
        
        You MUST respond in raw, parseable JSON format without Markdown blocks.
        The expected JSON schema output should be:
        [
          {
            "exerciseName": "string",
            "targetSets": number,
            "targetReps": "string",
            "recommendedWeight": number,
            "overloadRationale": "string"
          }
        ]
        
        Respond with ONLY the JSON array, no additional text.
      `;
    } else {
      // Map previous workout to clean JSON for context
      const previousWorkoutJSON = JSON.stringify({
        date: previousWorkout.date,
        focus: previousWorkout.focus,
        exercises: previousWorkout.workoutExercises.map((we) => ({
          exerciseName: we.exercise.name,
          targetMuscle: we.exercise.targetMuscle,
          sets: we.sets.map((s) => ({
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe,
            isWarmup: s.isWarmup,
          })),
        })),
      });

      prompt = `
        You are an Elite Strength & Conditioning Coach specializing in progressive overload.
        
        The athlete's previous workout session was:
        ${previousWorkoutJSON}
        
        Generate the next workout session with progressive overload applied. For each exercise:
        - Increase weight by approximately 5 lbs (2.5 kg) if the last set felt like RPE 7-8
        - Add 1-2 reps if weight stayed the same
        - Maintain volume if the athlete struggled (RPE 9+)
        - Consider muscle recovery and avoid excessive frequency on the same movements
        
        You MUST respond in raw, parseable JSON format without Markdown blocks.
        The expected JSON schema output should be:
        [
          {
            "exerciseName": "string",
            "targetSets": number,
            "targetReps": "string",
            "recommendedWeight": number,
            "overloadRationale": "string"
          }
        ]
        
        Respond with ONLY the JSON array, no additional text.
      `;
    }

    // 4. Call Gemini API
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    // 5. Clean markdown formatting if present
    const cleanJsonStr = textResponse.replace(/```json\n?|```\n?/gi, "").trim();
    const parsedRecommendations: WorkoutRecommendation[] =
      JSON.parse(cleanJsonStr);

    // 6. Validate the response structure
    if (!Array.isArray(parsedRecommendations)) {
      throw new AppError(
        500,
        "AI returned invalid response format (expected array)",
      );
    }

    // Ensure all recommendations have required fields
    const validatedRecommendations = parsedRecommendations.map((rec) => ({
      exerciseName: rec.exerciseName || "Unknown Exercise",
      targetSets: rec.targetSets || 3,
      targetReps: rec.targetReps || "8-12",
      recommendedWeight: rec.recommendedWeight || 0,
      overloadRationale:
        rec.overloadRationale || "Progressive overload applied",
    }));

    return validatedRecommendations;
  } catch (error: any) {
    // Handle rate limits
    if (error.message?.includes("429") || error.status === 429) {
      throw new AppError(
        429,
        "AI service quota exceeded. Please try again later.",
      );
    }

    // Handle AppError (already properly formatted)
    if (error instanceof AppError) {
      throw error;
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new AppError(500, `Failed to parse AI response: ${error.message}`);
    }

    throw new AppError(
      500,
      `Workout generation failed: ${error.message || "Unknown error"}`,
    );
  }
};

export const AIOverloadService = {
  generateNextWorkout,
};
