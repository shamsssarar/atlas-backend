import { z } from "zod";

const createProgramDayZodSchema = z.object({
  body: z.object({
    programId: z
      .string({ required_error: "Program ID is required" })
      .uuid("Invalid Program ID"),
    dayNumber: z
      .number({ required_error: "Day number is required" })
      .int()
      .positive("Day number must be positive"),
  }),
});

const updateProgramDayZodSchema = z.object({
  body: z.object({
    dayNumber: z
      .number()
      .int()
      .positive("Day number must be positive")
      .optional(),
  }),
});

const addExerciseTargetZodSchema = z.object({
  body: z.object({
    exerciseId: z
      .string({ required_error: "Exercise ID is required" })
      .uuid("Invalid Exercise ID"),
    targetSets: z
      .number({ required_error: "Target sets is required" })
      .int()
      .positive("Sets must be a positive integer"),
    targetReps: z
      .string({ required_error: "Target reps is required" })
      .min(1, "Target reps cannot be empty"),
    order: z
      .number({ required_error: "Order index is required" })
      .int()
      .nonnegative("Order must be a non-negative integer"),
  }),
});

export const ProgramDayValidation = {
  createProgramDayZodSchema,
  updateProgramDayZodSchema,
  addExerciseTargetZodSchema,
};
