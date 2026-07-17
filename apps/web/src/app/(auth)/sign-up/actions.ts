"use server";

import { Prisma } from "@/generated/prisma/client";
import { RoleName } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

export type SignUpState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsedInput = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsedInput.success) {
    return { fieldErrors: parsedInput.error.flatten().fieldErrors };
  }

  const { email, name, password } = parsedInput.data;
  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (transaction) => {
      const customerRole = await transaction.role.upsert({
        where: { name: RoleName.CUSTOMER },
        create: {
          name: RoleName.CUSTOMER,
          description: "Purchased-product access.",
        },
        update: {},
      });
      const user = await transaction.user.create({
        data: {
          email,
          name,
          password: passwordHash,
          roles: {
            create: { roleId: customerRole.id },
          },
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: user.id,
          event: "AUTH_USER_CREATED",
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "An account already exists for this email address." };
    }

    throw error;
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/account",
  });

  redirect("/account");
}
