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

interface AddExercisePayload {
  exerciseId: string;
  order?: number;
}

interface UpdateSetLogPayload {
  weight?: number;
  reps?: number;
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

const addExerciseToLiveWorkout = async (
  athleteId: string,
  workoutId: string,
  payload: AddExercisePayload,
): Promise<any> => {
  // Returns WorkoutExercise with nested Exercise data
  // 1. Zero Trust: Verify workout exists and belongs to this athlete
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: { workoutExercises: true },
  });

  if (!workout || workout.deletedAt) {
    throw new AppError(404, "Workout not found");
  }

  if (workout.athleteId !== athleteId) {
    throw new AppError(403, "Forbidden: You do not own this workout");
  }

  // 2. Verify the requested Exercise actually exists in the global dictionary
  const exercise = await prisma.exercise.findUnique({
    where: { id: payload.exerciseId },
  });

  if (!exercise || exercise.deletedAt) {
    throw new AppError(404, "Exercise not found");
  }

  // 3. Pro-Move: Auto-calculate the order if the frontend didn't provide it
  const nextOrder = payload.order ?? workout.workoutExercises.length + 1;

  // 4. Create the bridge record
  return await prisma.workoutExercise.create({
    data: {
      workoutId,
      exerciseId: payload.exerciseId,
      order: nextOrder,
    },
    include: {
      exercise: true, // Return the exercise details so the UI can render "Barbell Squat"
    },
  });
};

const deleteWorkoutExercise = async (
  workoutExerciseId: string,
  athleteId: string,
): Promise<any> => {
  const workoutExercise = await prisma.workoutExercise.findUnique({
    where: { id: workoutExerciseId },
    include: { workout: true },
  });

  if (!workoutExercise || workoutExercise.deletedAt) {
    throw new AppError(404, "Workout exercise not found");
  }

  if (workoutExercise.workout.athleteId !== athleteId) {
    throw new AppError(403, "Forbidden: You do not own this workout");
  }

  return await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: { deletedAt: new Date() },
  });
};

const verifySetLogOwnership = async (setId: string, athleteId: string) => {
  const setLog = await prisma.setLog.findUnique({
    where: { id: setId },
    include: { workoutExercise: { include: { workout: true } } },
  });

  if (!setLog || setLog.deletedAt) {
    throw new AppError(404, "Set not found");
  }

  if (!setLog.workoutExercise || setLog.workoutExercise.deletedAt) {
    throw new AppError(404, "Workout exercise not found");
  }

  if (
    !setLog.workoutExercise.workout ||
    setLog.workoutExercise.workout.deletedAt
  ) {
    throw new AppError(404, "Workout not found");
  }

  if (setLog.workoutExercise.workout.athleteId !== athleteId) {
    throw new AppError(403, "Forbidden: You do not own this workout");
  }

  return setLog;
};

const updateSetLog = async (
  setId: string,
  athleteId: string,
  payload: UpdateSetLogPayload,
): Promise<SetLog> => {
  await verifySetLogOwnership(setId, athleteId);

  return await prisma.setLog.update({
    where: { id: setId },
    data: payload,
  });
};

const deleteSetLog = async (
  setId: string,
  athleteId: string,
): Promise<SetLog> => {
  await verifySetLogOwnership(setId, athleteId);

  // Hard deletion is also an option here for transient sets,
  // but adhering to the SOP soft-delete pattern ensures integrity
  return await prisma.setLog.update({
    where: { id: setId },
    data: { deletedAt: new Date() },
  });
};

export const WorkoutService = {
  startWorkout,
  logSet,
  getWorkoutSummary,
  addExerciseToLiveWorkout,
  deleteWorkoutExercise,
  updateSetLog,
  deleteSetLog,
};
