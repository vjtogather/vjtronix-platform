import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Prisma, RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { createRole, deleteRole } from "./actions";

export const metadata: Metadata = { title: "Roles", robots: { index: false, follow: false } };
const protectedRoles = new Set<RoleName>([RoleName.SUPER_ADMIN, RoleName.ADMIN]);

export default async function RolesPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  if (!session.user.roles.includes(RoleName.SUPER_ADMIN)) redirect("/admin");
  const search = (await searchParams).search?.trim() ?? "";
  const matchingRoleNames = Object.values(RoleName).filter((name) => name.toLowerCase().includes(search.toLowerCase()));
  const where: Prisma.RoleWhereInput | undefined = search ? { OR: [{ description: { contains: search, mode: "insensitive" } }, ...(matchingRoleNames.length ? [{ name: { in: matchingRoleNames } }] : [])] } : undefined;
  const [roles, existingRoleNames] = await Promise.all([
    prisma.role.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { users: true, permissions: true } },
      },
    }),
    prisma.role.findMany({ select: { name: true } }),
  ]);
  const availableRoleNames = Object.values(RoleName).filter((name) => !existingRoleNames.some((role) => role.name === name));

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Super Admin</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Roles</h1><p className="mt-2 text-sm leading-6 text-slate-400">Review role membership and permission assignments.</p></div><Card><CardHeader><CardTitle>Create role</CardTitle><CardDescription>Roles are defined by the platform&apos;s existing role enum.</CardDescription></CardHeader><CardContent>{availableRoleNames.length === 0 ? <p className="text-sm text-slate-500">All available role types are already configured.</p> : <form action={createRole} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"><select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate-200 dark:bg-input/30" defaultValue="" name="name"><option disabled value="">Select a role</option>{availableRoleNames.map((name) => <option key={name} value={name}>{name.replaceAll("_", " ")}</option>)}</select><Input name="description" placeholder="Role description (optional)" /><Button type="submit">Create role</Button></form>}</CardContent></Card><Card><CardHeader><CardTitle>Role registry</CardTitle><CardDescription>Search, view, and manage configured roles.</CardDescription></CardHeader><CardContent className="space-y-5"><form className="flex gap-2" method="get"><Input defaultValue={search} name="search" placeholder="Search roles" /><Button type="submit" variant="outline">Search</Button>{search ? <Link className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm text-slate-400 hover:text-white" href="/admin/roles">Reset</Link> : null}</form>{roles.length === 0 ? <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">No roles found.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">Users</th><th className="pb-3 font-medium">Permissions</th><th className="pb-3 font-medium">Created</th><th className="pb-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-white/10">{roles.map((role) => <tr key={role.id}><td className="py-4"><p className="font-medium text-slate-200">{role.name.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{role.description || "No description provided."}</p></td><td className="py-4 text-slate-300">{role._count.users}</td><td className="py-4 text-slate-300">{role._count.permissions}</td><td className="py-4 text-xs text-slate-500">{formatDate(role.createdAt)}</td><td className="py-4"><div className="flex justify-end gap-3"><Link className="text-xs font-medium text-sky-200 hover:text-sky-100" href={`/admin/roles/${role.id}`}>View</Link><Link className="text-xs font-medium text-sky-200 hover:text-sky-100" href={`/admin/roles/${role.id}#edit`}>Edit</Link>{protectedRoles.has(role.name) ? <span className="text-xs text-slate-600">Protected</span> : <form action={deleteRole}><input name="id" type="hidden" value={role.id} /><button className="text-xs font-medium text-rose-200 hover:text-rose-100" type="submit">Delete</button></form>}</div></td></tr>)}</tbody></table></div>}</CardContent></Card></div>;
}

function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date); }
