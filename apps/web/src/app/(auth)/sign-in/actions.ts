"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { signInSchema } from "@/lib/validations/auth";

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
  const parsedCredentials = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    redirect("/sign-in?error=CredentialsSignin");
  }

  try {
    await signIn("credentials", {
      ...parsedCredentials.data,
      redirectTo: "/account",
    });
  } catch (error) {
    handleSignInError(error);
  }
}
