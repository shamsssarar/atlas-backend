import { z } from "zod";
import { ProgramCategory } from "@prisma/client";

const createProgramZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty"),
    description: z.string().optional(),
    durationWeeks: z
      .number({ required_error: "Duration in weeks is required" })
      .int()
      .positive("Duration must be a positive integer"),
    category: z.nativeEnum(ProgramCategory).optional(),
  }),
});

const updateProgramZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().optional(),
    durationWeeks: z
      .number()
      .int()
      .positive("Duration must be a positive integer")
      .optional(),
    category: z.nativeEnum(ProgramCategory).optional(),
  }),
});

export const ProgramValidation = {
  createProgramZodSchema,
  updateProgramZodSchema,
};
