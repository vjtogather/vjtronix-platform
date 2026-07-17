"use server";

import { signOut } from "@/auth";

export async function signOutAccount() {
  await signOut({ redirectTo: "/" });
}
