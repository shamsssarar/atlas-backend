import { User, Role } from "@prisma/client";
import prisma from "../../../shared/prisma";

// Define or update your interface so TypeScript knows 'name' is coming from the frontend
interface ProfileData {
  name?: string;
  role?: Role;
  bio?: string;
  avatarUrl?: string;
}

const syncUserToPrisma = async (
  uid: string,
  email: string,
  profileData: ProfileData,
) => {
  // 1. Idempotency Check: Does the user already exist?
  const existingUser = await prisma.user.findUnique({
    where: { id: uid },
    include: { profile: true },
  });

  if (existingUser) {
    return { isNew: false, user: existingUser };
  }

  // 2. The Data Transformer: Split the single "name" into first and last
  const nameParts = profileData.name
    ? profileData.name.trim().split(" ")
    : ["Unknown"];
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  // 3. Database Transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: uid,
        email,
        role: profileData.role || "ATHLETE",
      },
    });

    await tx.profile.create({
      data: {
        userId: uid,
        firstName: firstName as string, // Use the extracted variable
        lastName: lastName, // Use the extracted variable
        bio: profileData.bio ?? null,
        avatarUrl: profileData.avatarUrl ?? null,
      },
    });

    if (user.role === "ATHLETE") {
      // @ts-ignore - Assuming AthleteDetails model exists in Prisma schema
      await tx.athleteDetails.create({ data: { userId: uid } });
    } else if (user.role === "COACH") {
      // @ts-ignore - Assuming CoachDetails model exists in Prisma schema
      await tx.coachDetails.create({ data: { userId: uid } });
    }

    return tx.user.findUnique({
      where: { id: uid },
      include: { profile: true },
    });
  });

  return { isNew: true, user: newUser };
};

export const UserService = {
  syncUserToPrisma,
};
