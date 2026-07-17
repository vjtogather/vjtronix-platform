"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/authorization";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema, profileSchema } from "@/lib/validations/profile";
import { prisma } from "@/lib/prisma";

type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

const MAX_AVATAR_BYTES = 600 * 1024;
const avatarPattern = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

function validateAvatar(avatarDataUrl?: string | null) {
  if (!avatarDataUrl) {
    return null;
  }

  const match = avatarPattern.exec(avatarDataUrl);

  if (!match) {
    throw new Error("Upload a PNG, JPEG, or WebP image.");
  }

  const [, type, base64] = match;
  const bytes = Buffer.from(base64, "base64");

  if (bytes.length === 0 || bytes.length > MAX_AVATAR_BYTES) {
    throw new Error("Avatar image must be smaller than 600 KB.");
  }

  const hasValidSignature =
    (type === "png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (type === "jpeg" && bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) ||
    (type === "webp" && bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP");

  if (!hasValidSignature) {
    throw new Error("The uploaded file is not a valid image.");
  }

  return avatarDataUrl;
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await requireUser();
  const parsedInput = profileSchema.safeParse(input);

  if (!parsedInput.success) {
    return { fieldErrors: parsedInput.error.flatten().fieldErrors };
  }

  let avatarDataUrl: string | null | undefined;
  try {
    avatarDataUrl = validateAvatar(parsedInput.data.avatarDataUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to validate avatar." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsedInput.data.name,
        phone: parsedInput.data.phone,
        ...(avatarDataUrl !== undefined ? { image: avatarDataUrl } : {}),
      },
    });
    await prisma.auditLog.create({
      data: { actorId: session.user.id, event: "ACCOUNT_PROFILE_UPDATED" },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors: { phone: ["This phone number is already in use."] } };
    }

    throw error;
  }

  revalidatePath("/account");
  return { success: "Profile updated." };
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await requireUser();
  const parsedInput = changePasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    return { fieldErrors: parsedInput.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (user.password) {
    const passwordMatches = await verifyPassword(parsedInput.data.currentPassword, user.password);

    if (!passwordMatches) {
      return { fieldErrors: { currentPassword: ["Your current password is incorrect."] } };
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { password: await hashPassword(parsedInput.data.newPassword) },
    }),
    prisma.auditLog.create({
      data: { actorId: session.user.id, event: "ACCOUNT_PASSWORD_CHANGED" },
    }),
  ]);

  return { success: user.password ? "Password changed." : "Password created." };
}
