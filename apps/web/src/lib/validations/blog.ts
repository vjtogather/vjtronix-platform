import { z } from "zod";

export const postSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(200).optional(),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().min(1).max(200_000),
  coverImage: z.string().url().max(2_000).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().trim().max(60).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  categoryIds: z.array(z.string()).max(10),
  tagIds: z.array(z.string()).max(20),
});
