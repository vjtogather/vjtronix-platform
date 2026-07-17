import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

import { deleteCategory, saveCategory } from "../taxonomy-actions";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, description: true } });
  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><Link className="text-sm font-medium text-sky-200 hover:text-sky-100" href="/admin/blog">← Back to blog</Link><h1 className="mt-4 text-3xl font-semibold text-white">Categories</h1></div><Card><CardHeader><CardTitle>Create category</CardTitle><CardDescription>Name and slug must be unique.</CardDescription></CardHeader><CardContent><form action={saveCategory} className="grid gap-3 md:grid-cols-3"><Input name="name" placeholder="Name" required /><Input name="slug" placeholder="Slug (optional)" /><Button type="submit">Create</Button></form></CardContent></Card><Card><CardContent className="space-y-3 pt-6">{categories.map((category) => <form action={saveCategory} className="grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-[1fr_1fr_2fr_auto_auto]" key={category.id}><input name="id" type="hidden" value={category.id} /><Input defaultValue={category.name} name="name" required /><Input defaultValue={category.slug} name="slug" required /><Input defaultValue={category.description || ""} name="description" placeholder="Description" /><Button type="submit" variant="outline">Save</Button><button className="h-8 text-sm text-rose-200" formAction={deleteCategory} type="submit">Delete</button></form>)}</CardContent></Card></div>;
}
