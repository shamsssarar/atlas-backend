import { Biometrics } from "@prisma/client";
import prisma from "../../../shared/prisma";

interface LogBiometricsPayload {
  date?: string;
  weight?: number;
  sleepQuality?: number;
  sleepHours?: number;
  restingHeartRate?: number;
  subjectiveStress?: number;
  notes?: string;
}

const logDailyBiometrics = async (
  athleteId: string,
  payload: LogBiometricsPayload,
): Promise<Biometrics> => {
  // Timezone Logic: Standardize the "Day" to Midnight UTC
  const logDate = payload.date ? new Date(payload.date) : new Date();
  logDate.setUTCHours(0, 0, 0, 0);

  const { date, ...dataToUpdate } = payload;

  const biometrics = await prisma.biometrics.upsert({
    where: {
      athleteId_date: {
        athleteId,
        date: logDate,
      },
    },
    update: dataToUpdate,
    create: {
      ...dataToUpdate,
      athleteId,
      date: logDate,
    },
  });

  // TODO: Trigger Redis BullMQ job here to run the Gemini "Fatigue Score" analysis asynchronously.

  return biometrics;
};

const getBiometricsHistory = async (
  athleteId: string,
  days: number = 7,
): Promise<Biometrics[]> => {
  const targetDate = new Date();
  targetDate.setUTCHours(0, 0, 0, 0);
  targetDate.setDate(targetDate.getDate() - days);

  return await prisma.biometrics.findMany({
    where: { athleteId, date: { gte: targetDate }, deletedAt: null },
    orderBy: { date: "desc" },
  });
};

export const BiometricsService = {
  logDailyBiometrics,
  getBiometricsHistory,
};
