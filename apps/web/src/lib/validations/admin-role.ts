import { z } from "zod";

import { RoleName } from "@/generated/prisma/client";

const text = z.string().trim().max(500).transform((value) => value || null);

export const createRoleSchema = z.object({ name: z.enum(RoleName), description: text });
export const updateRoleSchema = z.object({ id: z.string().min(1), description: text });
export const roleIdSchema = z.object({ id: z.string().min(1) });
export const rolePermissionSchema = z.object({ roleId: z.string().min(1), permissionId: z.string().min(1), enabled: z.boolean() });
