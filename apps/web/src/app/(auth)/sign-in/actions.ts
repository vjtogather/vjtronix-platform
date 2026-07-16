"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";

const emailSchema = z.string().trim().email();

function handleSignInError(error: unknown): never {
  if (error instanceof AuthError) {
    redirect(`/sign-in?error=${error.type}`);
  }

  throw error;
}

export async function signInWithProvider(provider: "google" | "github") {
  try {
    await signIn(provider, { redirectTo: "/account" });
  } catch (error) {
    handleSignInError(error);
  }
}

export async function signInWithEmail(formData: FormData) {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));

  if (!parsedEmail.success) {
    redirect("/sign-in?error=EmailSignin");
  }

  try {
    await signIn("nodemailer", {
      email: parsedEmail.data,
      redirectTo: "/account",
    });
  } catch (error) {
    handleSignInError(error);
  }
}
