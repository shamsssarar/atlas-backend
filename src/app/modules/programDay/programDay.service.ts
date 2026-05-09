import { ProgramDay, ExerciseTarget } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

interface CreateProgramDayPayload {
  programId: string;
  dayNumber: number;
}

interface UpdateProgramDayPayload {
  dayNumber?: number;
}

interface AddExerciseTargetPayload {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  order: number;
}

interface UpdateExerciseTargetPayload {
  targetSets?: number;
  targetReps?: string;
  order?: number;
}

/**
 * HELPER: Verifies that the current coach owns the parent program.
 */
const verifyProgramOwnership = async (programId: string, coachId: string) => {
  const program = await prisma.program.findUnique({
    where: { id: programId },
  });

  if (!program || program.deletedAt) {
    throw new AppError(404, "Program not found");
  }

  if (program.coachId !== coachId) {
    throw new AppError(403, "Forbidden: You do not own this program");
  }

  return program;
};

/**
 * HELPER: Verifies ownership of a program based on the ProgramDay ID.
 */
const verifyProgramOwnershipByDayId = async (
  programDayId: string,
  coachId: string,
) => {
  const programDay = await prisma.programDay.findUnique({
    where: { id: programDayId },
    include: { program: true },
  });

  if (!programDay || programDay.deletedAt) {
    throw new AppError(404, "ProgramDay not found");
  }

  if (!programDay.program || programDay.program.deletedAt) {
    throw new AppError(404, "Parent Program not found");
  }

  if (programDay.program.coachId !== coachId) {
    throw new AppError(
      403,
      "Forbidden: You do not own the parent program for this day",
    );
  }

  return programDay;
};

/**
 * HELPER: Verifies ownership of a program based on the ExerciseTarget ID.
 */
const verifyProgramOwnershipByTargetId = async (
  targetId: string,
  coachId: string,
) => {
  const target = await prisma.exerciseTarget.findUnique({
    where: { id: targetId },
    include: { programDay: { include: { program: true } } },
  });

  if (!target || target.deletedAt) {
    throw new AppError(404, "Exercise target not found");
  }

  if (!target.programDay || target.programDay.deletedAt) {
    throw new AppError(404, "Parent ProgramDay not found");
  }

  if (!target.programDay.program || target.programDay.program.deletedAt) {
    throw new AppError(404, "Parent Program not found");
  }

  if (target.programDay.program.coachId !== coachId) {
    throw new AppError(403, "Forbidden: You do not own the parent program for this target");
  }

  return target;
};

const createProgramDay = async (
  coachId: string,
  payload: CreateProgramDayPayload,
): Promise<ProgramDay> => {
  await verifyProgramOwnership(payload.programId, coachId);

  return await prisma.programDay.create({
    data: payload,
  });
};

const updateProgramDay = async (
  programDayId: string,
  coachId: string,
  payload: UpdateProgramDayPayload,
): Promise<ProgramDay> => {
  await verifyProgramOwnershipByDayId(programDayId, coachId);

  return await prisma.programDay.update({
    where: { id: programDayId },
    data: payload,
  });
};

const deleteProgramDay = async (
  programDayId: string,
  coachId: string,
): Promise<ProgramDay> => {
  await verifyProgramOwnershipByDayId(programDayId, coachId);

  return await prisma.programDay.update({
    where: { id: programDayId },
    data: { deletedAt: new Date() },
  });
};

const addExerciseTargetToDay = async (
  programDayId: string,
  coachId: string,
  payload: AddExerciseTargetPayload,
): Promise<ExerciseTarget> => {
  await verifyProgramOwnershipByDayId(programDayId, coachId);

  return await prisma.exerciseTarget.create({
    data: {
      ...payload,
      programDayId,
    },
  });
};

const updateExerciseTarget = async (
  targetId: string,
  coachId: string,
  payload: UpdateExerciseTargetPayload,
): Promise<ExerciseTarget> => {
  await verifyProgramOwnershipByTargetId(targetId, coachId);

  return await prisma.exerciseTarget.update({
    where: { id: targetId },
    data: payload,
  });
};

const deleteExerciseTarget = async (
  targetId: string,
  coachId: string,
): Promise<ExerciseTarget> => {
  await verifyProgramOwnershipByTargetId(targetId, coachId);

  return await prisma.exerciseTarget.update({
    where: { id: targetId },
    data: { deletedAt: new Date() },
  });
};

export const ProgramDayService = {
  createProgramDay,
  updateProgramDay,
  deleteProgramDay,
  addExerciseTargetToDay,
  updateExerciseTarget,
  deleteExerciseTarget,
};
