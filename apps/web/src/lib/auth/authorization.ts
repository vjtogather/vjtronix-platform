import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { RoleName } from "@/generated/prisma/client";

export class AuthorizationError extends Error {
  constructor() {
    super("You do not have permission to access this resource.");
    this.name = "AuthorizationError";
  }
}

export function hasRole(
  roles: readonly RoleName[],
  requiredRoles: RoleName | readonly RoleName[],
) {
  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return required.some((role) => roles.includes(role));
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(requiredRoles: RoleName | readonly RoleName[]) {
  const session = await requireUser();

  if (!hasRole(session.user.roles, requiredRoles)) {
    throw new AuthorizationError();
  }

  return session;
}
