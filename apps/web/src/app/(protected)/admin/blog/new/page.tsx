import { PostEditor } from "@/app/(protected)/admin/blog/post-editor";
import { prisma } from "@/lib/prisma";
export default async function NewPostPage() { const [categories, tags] = await Promise.all([prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.tag.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })]); return <div className="p-5 sm:p-8 lg:p-10"><h1 className="mb-6 text-3xl font-semibold text-white">New blog post</h1><PostEditor categories={categories} tags={tags} /></div>; }
