import { Workout, SetLog } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

interface StartWorkoutPayload {
  focus: string;
  programDayId?: string;
}

interface LogSetPayload {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
  notes?: string;
}

const startWorkout = async (
  athleteId: string,
  payload: StartWorkoutPayload,
): Promise<Workout> => {
  let workoutExercisesData: { exerciseId: string; order: number }[] = [];

  // If a program day is linked, pre-populate the workout with its target exercises
  if (payload.programDayId) {
    const programDay = await prisma.programDay.findUnique({
      where: { id: payload.programDayId },
      include: { ExerciseTarget: true },
    });

    if (!programDay || programDay.deletedAt) {
      throw new AppError(404, "Linked Program Day not found");
    }

    const targets = programDay.ExerciseTarget ?? [];
    workoutExercisesData = targets.map((target) => ({
      exerciseId: target.exerciseId,
      order: target.order,
    }));
  }

  return await prisma.workout.create({
    data: {
      athleteId,
      focus: payload.focus,
      date: new Date(),
      programDayId: payload.programDayId ?? null,
      workoutExercises: {
        create: workoutExercisesData,
      },
    },
    include: {
      workoutExercises: true,
    },
  });
};

const logSet = async (
  athleteId: string,
  workoutExerciseId: string,
  payload: LogSetPayload,
): Promise<SetLog> => {
  const workoutExercise = await prisma.workoutExercise.findUnique({
    where: { id: workoutExerciseId },
    include: { workout: true },
  });

  if (!workoutExercise || workoutExercise.deletedAt) {
    throw new AppError(404, "Workout exercise not found");
  }

  // Zero Trust: Ensure the athlete logging the set actually owns the parent workout
  if (workoutExercise.workout.athleteId !== athleteId) {
    throw new AppError(403, "Forbidden: You do not own this workout");
  }

  return await prisma.setLog.create({
    data: {
      ...payload,
      workoutExerciseId,
    },
  });
};

const getWorkoutSummary = async (
  workoutId: string,
  athleteId: string,
): Promise<Workout> => {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId, athleteId, deletedAt: null },
    include: {
      workoutExercises: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            where: { deletedAt: null },
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });

  if (!workout) {
    throw new AppError(
      404,
      "Workout not found or you do not have permission to view it",
    );
  }

  return workout;
};

export const WorkoutService = {
  startWorkout,
  logSet,
  getWorkoutSummary,
};
