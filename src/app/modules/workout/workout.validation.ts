import { z } from "zod";

const startWorkoutZodSchema = z.object({
  body: z.object({
    focus: z
      .string({
        required_error: "Workout focus is required",
      })
      .min(3, "Focus must be at least 3 characters"),
    programDayId: z.string().uuid("Invalid Program Day ID").optional(),
  }),
});

const addExerciseZodSchema = z.object({
  body: z.object({
    exerciseId: z.string().uuid("Invalid Exercise ID").optional(),
    exerciseName: z.string({
      required_error: "Exercise name is required",
    }),
    order: z.number().int().nonnegative().optional(), // Optional!
  }),
});

const logSetZodSchema = z.object({
  body: z.object({
    setNumber: z
      .number({
        required_error: "Set number is required",
      })
      .int("Set number must be an integer")
      .positive("Set number must be greater than 0"),

    weight: z
      .number({
        required_error: "Weight is required",
      })
      .nonnegative("Weight cannot be negative"), // 0 is allowed for bodyweight exercises

    reps: z
      .number({
        required_error: "Reps are required",
      })
      .int()
      .nonnegative("Reps cannot be negative"),

    rpe: z
      .number()
      .min(1, "RPE must be at least 1")
      .max(10, "RPE cannot exceed 10")
      .optional(),
    isWarmup: z.boolean().optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

const updateSetLogZodSchema = z.object({
  body: z.object({
    weight: z.number().nonnegative("Weight cannot be negative").optional(),
    reps: z.number().int().nonnegative("Reps cannot be negative").optional(),
    rpe: z.number().min(1, "RPE must be at least 1").max(10, "RPE cannot exceed 10").optional(),
    isWarmup: z.boolean().optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

export const WorkoutValidations = {
  startWorkoutZodSchema,
  logSetZodSchema,
  addExerciseZodSchema,
  updateSetLogZodSchema,
};
