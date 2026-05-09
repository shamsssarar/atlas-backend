import { z } from "zod";
import { MuscleGroup, Equipment } from "@prisma/client";

const createExerciseZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty"),
    targetMuscle: z.string({ required_error: "Target muscle is required" }),
    biomechanicsType: z.string().optional(),
    description: z.string().optional(),
    videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
    muscleGroup: z.nativeEnum(MuscleGroup, {
      required_error: "Muscle group is required",
    }),
    equipment: z.nativeEnum(Equipment, {
      required_error: "Equipment is required",
    }),
  }),
});

export const ExerciseValidation = {
  createExerciseZodSchema,
};
