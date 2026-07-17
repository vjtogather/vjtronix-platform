"use server";

import { PostStatus, RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations/blog";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(value: string) { return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function sanitizeHtml(value: string) { return value.replace(/<\/?(script|style)[^>]*>/gi, "").replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ""); }
function readingTime(value: string) { return Math.max(1, Math.ceil(value.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length / 200)); }

export async function savePost(input: unknown, id?: string) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: "Review the highlighted post fields." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) return { error: "Enter a title that can be used to create a slug." };
  const content = sanitizeHtml(data.content);
  const postData = { title: data.title, slug, excerpt: data.excerpt || null, content, coverImage: data.coverImage || null, status: data.status as PostStatus, seoTitle: data.seoTitle || null, seoDescription: data.seoDescription || null, readingTime: readingTime(content), publishedAt: data.status === "PUBLISHED" ? new Date() : null };
  try {
    if (id) await prisma.post.update({ where: { id }, data: { ...postData, categories: { set: data.categoryIds.map((id) => ({ id })) }, tags: { set: data.tagIds.map((id) => ({ id })) } } });
    else await prisma.post.create({ data: { ...postData, authorId: session.user.id, categories: { connect: data.categoryIds.map((id) => ({ id })) }, tags: { connect: data.tagIds.map((id) => ({ id })) } } });
  } catch { return { error: "A post with this slug already exists." }; }
  await prisma.auditLog.create({ data: { actorId: session.user.id, event: id ? "CMS_POST_UPDATED" : "CMS_POST_CREATED", metadata: { slug } } });
  revalidatePath("/admin/blog"); redirect("/admin/blog");
}

export async function deletePost(id: string) { const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]); await prisma.post.delete({ where: { id } }); await prisma.auditLog.create({ data: { actorId: session.user.id, event: "CMS_POST_DELETED", metadata: { id } } }); revalidatePath("/admin/blog"); }
