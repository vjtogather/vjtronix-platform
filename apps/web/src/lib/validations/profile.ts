import { z } from "zod";

import { passwordSchema } from "@/lib/validations/auth";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number with country code.");

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Name is too long."),
  phone: z.union([phoneSchema, z.literal("")]).transform((phone) => phone || null),
  avatarDataUrl: z.string().nullable().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
