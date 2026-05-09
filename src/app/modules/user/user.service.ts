import { User, Role } from "@prisma/client";
import prisma from "../../../shared/prisma";

interface ProfileData {
  firstName: string;
  lastName: string;
  role?: Role;
  bio?: string;
  avatarUrl?: string;
}

const syncUserToPrisma = async (
  uid: string,
  email: string,
  profileData: ProfileData,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: uid },
    include: { profile: true },
  });

  if (existingUser) {
    return { isNew: false, user: existingUser };
  }

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
        firstName: profileData.firstName,
        lastName: profileData.lastName,
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
