import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Roles", robots: { index: false, follow: false } };

export default async function RolesPage() {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  if (!session.user.roles.includes(RoleName.SUPER_ADMIN)) redirect("/admin");
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true, _count: { select: { users: true, permissions: true } } } });

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Super Admin</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Roles</h1><p className="mt-2 text-sm leading-6 text-slate-400">Review the platform roles and their assigned access.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{roles.length === 0 ? <Card className="md:col-span-2 xl:col-span-3"><CardContent className="py-12 text-center text-sm text-slate-500">No roles are configured.</CardContent></Card> : roles.map((role) => <Card key={role.id}><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle>{role.name.replaceAll("_", " ")}</CardTitle><CardDescription className="mt-2">{role.description || "No description provided."}</CardDescription></div><ShieldCheck className="size-5 shrink-0 text-sky-300" aria-hidden="true" /></div></CardHeader><CardContent className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">Users</p><p className="mt-1 text-lg font-semibold text-white">{role._count.users}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Permissions</p><p className="mt-1 text-lg font-semibold text-white">{role._count.permissions}</p></div></CardContent></Card>)}</div></div>;
}
