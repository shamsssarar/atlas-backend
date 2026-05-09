import { Exercise, MuscleGroup, Equipment } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

interface CreateExercisePayload {
  name: string;
  targetMuscle: string;
  biomechanicsType?: string;
  description?: string;
  videoUrl?: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

const createExercise = async (
  userId: string,
  role: string,
  payload: CreateExercisePayload,
): Promise<Exercise> => {
  const existing = await prisma.exercise.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError(400, "An exercise with this name already exists");
  }

  // ADMIN creates globally (null), COACH creates custom to their roster
  const coachId = role === "ADMIN" ? null : userId;

  return await prisma.exercise.create({
    data: {
      ...payload,
      coachId,
    },
  });
};

const getAllExercises = async (
  userId: string,
  role: string,
): Promise<Exercise[]> => {
  let targetCoachId: string | null = null;

  if (role === "COACH") {
    targetCoachId = userId; // Coaches see their own custom exercises
  } else if (role === "ATHLETE") {
    // Athletes need to see their assigned coach's custom exercises
    const athlete = await prisma.user.findUnique({ where: { id: userId } });
    targetCoachId = athlete?.coachId || null;
  }

  return await prisma.exercise.findMany({
    where: {
      OR: [
        { coachId: null }, // Everyone sees global exercises
        { coachId: targetCoachId }, // Plus the specific coach's custom ones
      ],
      deletedAt: null,
    },
    orderBy: { name: "asc" },
  });
};

const getExerciseById = async (id: string): Promise<Exercise> => {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise || exercise.deletedAt) {
    throw new AppError(404, "Exercise not found");
  }

  return exercise;
};

export const ExerciseService = {
  createExercise,
  getAllExercises,
  getExerciseById,
};
