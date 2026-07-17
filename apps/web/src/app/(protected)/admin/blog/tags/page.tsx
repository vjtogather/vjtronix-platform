import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

import { deleteTag, saveTag } from "../taxonomy-actions";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><Link className="text-sm font-medium text-sky-200 hover:text-sky-100" href="/admin/blog">← Back to blog</Link><h1 className="mt-4 text-3xl font-semibold text-white">Tags</h1></div><Card><CardHeader><CardTitle>Create tag</CardTitle><CardDescription>Name and slug must be unique.</CardDescription></CardHeader><CardContent><form action={saveTag} className="grid gap-3 md:grid-cols-3"><Input name="name" placeholder="Name" required /><Input name="slug" placeholder="Slug (optional)" /><Button type="submit">Create</Button></form></CardContent></Card><Card><CardContent className="space-y-3 pt-6">{tags.map((tag) => <form action={saveTag} className="grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-[1fr_1fr_auto_auto]" key={tag.id}><input name="id" type="hidden" value={tag.id} /><Input defaultValue={tag.name} name="name" required /><Input defaultValue={tag.slug} name="slug" required /><Button type="submit" variant="outline">Save</Button><button className="h-8 text-sm text-rose-200" formAction={deleteTag} type="submit">Delete</button></form>)}</CardContent></Card></div>;
}
