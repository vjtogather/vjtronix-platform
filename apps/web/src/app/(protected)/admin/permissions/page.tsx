import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";

import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Permissions", robots: { index: false, follow: false } };

export default async function PermissionsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  if (!session.user.roles.includes(RoleName.SUPER_ADMIN)) redirect("/admin");
  const search = (await searchParams).search?.trim() ?? "";
  const where = search ? { OR: [{ key: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }] } : undefined;
  const [permissions, roles] = await Promise.all([
    prisma.permission.findMany({
      where,
      orderBy: { key: "asc" },
      select: {
        id: true,
        key: true,
        description: true,
        roles: { select: { roleId: true, role: { select: { name: true } } } },
        _count: { select: { roles: true } },
      },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Super Admin</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Permissions</h1><p className="mt-2 text-sm leading-6 text-slate-400">Granular access permissions assigned through roles.</p></div><Card><CardHeader><CardTitle>Permission registry</CardTitle><CardDescription>Search permissions and review the roles that hold them.</CardDescription></CardHeader><CardContent className="space-y-5"><form className="flex gap-2" method="get"><Input defaultValue={search} name="search" placeholder="Search permissions" /><Button type="submit" variant="outline">Search</Button></form>{permissions.length === 0 ? <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">No permissions found.</div> : <ul className="divide-y divide-white/10">{permissions.map((permission) => <li className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0" key={permission.id}><div className="min-w-0"><div className="flex items-center gap-3"><KeyRound className="size-4 shrink-0 text-sky-300" aria-hidden="true" /><p className="truncate font-mono text-sm text-slate-200">{permission.key}</p></div><p className="mt-1 pl-7 text-sm text-slate-500">{permission.description || "No description provided."}</p><p className="mt-1 pl-7 text-xs text-slate-500">Assigned roles: {permission.roles.length ? permission.roles.map(({ role }) => role.name.replaceAll("_", " ")).join(", ") : "None"}</p></div><span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-1 text-xs text-slate-400">{permission._count.roles} role{permission._count.roles === 1 ? "" : "s"}</span></li>)}</ul>}</CardContent></Card><Card><CardHeader><CardTitle>Permission matrix</CardTitle><CardDescription>Toggle a cell to grant or revoke that permission for a role.</CardDescription></CardHeader><CardContent>{permissions.length === 0 || roles.length === 0 ? <p className="text-sm text-slate-500">Permissions and roles are required to populate the matrix.</p> : <PermissionMatrix permissions={permissions.map(({ id, key, roles: assignments }) => ({ id, key, roleIds: assignments.map(({ roleId }) => roleId) }))} roles={roles} />}</CardContent></Card></div>;
}
