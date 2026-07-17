import { z } from "zod";

import { phoneSchema } from "@/lib/validations/profile";

export const adminUserUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Enter a name.").max(100, "Name is too long."),
  phone: z.union([phoneSchema, z.literal("")]).transform((phone) => phone || null),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const adminUserRoleSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
});

export const adminUserStatusSchema = z.object({
  id: z.string().min(1),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
});
