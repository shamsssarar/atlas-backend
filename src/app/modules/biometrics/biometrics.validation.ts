import { z } from "zod";

const logBiometricsZodSchema = z.object({
  body: z.object({
    date: z.string().datetime().optional(),
    weight: z.number().positive("Weight must be positive").optional(),
    sleepQuality: z
      .number()
      .int()
      .min(1, "Sleep quality must be at least 1")
      .max(10, "Sleep quality cannot exceed 10")
      .optional(),
    sleepHours: z
      .number()
      .min(0, "Sleep hours cannot be negative")
      .max(24, "Sleep hours cannot exceed 24")
      .optional(),
    restingHeartRate: z
      .number()
      .int()
      .min(30, "Heart rate too low")
      .max(220, "Heart rate too high")
      .optional(),
    subjectiveStress: z
      .number()
      .int()
      .min(1, "Stress must be at least 1")
      .max(10, "Stress cannot exceed 10")
      .optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

export const BiometricsValidations = {
  logBiometricsZodSchema,
};
