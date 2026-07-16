import type { DefaultSession } from "next-auth";

import type { RoleName } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: RoleName[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: RoleName[];
  }
}
