import { Program, ProgramCategory, Role } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

interface CreateProgramPayload {
  name: string;
  description?: string;
  durationWeeks: number;
  category?: ProgramCategory;
}

const createProgram = async (
  coachId: string,
  payload: CreateProgramPayload,
): Promise<Program> => {
  return await prisma.program.create({
    data: {
      ...payload,
      coachId,
    },
  });
};

const getCoachPrograms = async (coachId: string): Promise<Program[]> => {
  return await prisma.program.findMany({
    where: {
      coachId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllProgramsForAdmin = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.program.findMany({
      where: { deletedAt: null },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.program.count({ where: { deletedAt: null } }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const getProgramById = async (id: string): Promise<Program> => {
  const program = await prisma.program.findUnique({
    where: { id },
  });

  if (!program || program.deletedAt) {
    throw new AppError(404, "Program not found");
  }

  return program;
};

const updateProgram = async (
  id: string,
  coachId: string,
  payload: Partial<CreateProgramPayload>,
): Promise<Program> => {
  const program = await getProgramById(id);

  if (program.coachId !== coachId) {
    throw new AppError(
      403,
      "Forbidden: You are not authorized to update this program",
    );
  }

  return await prisma.program.update({
    where: { id },
    data: payload,
  });
};

const deleteProgram = async (
  id: string,
  coachId: string,
  userRole: string,
): Promise<Program> => {
  const program = await getProgramById(id);

  if (program.coachId !== coachId && userRole !== "ADMIN") {
    throw new AppError(
      403,
      "Forbidden: You are not authorized to delete this program",
    );
  }

  return await prisma.program.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const ProgramService = {
  createProgram,
  getCoachPrograms,
  getAllProgramsForAdmin,
  getProgramById,
  updateProgram,
  deleteProgram,
};
