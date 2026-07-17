import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { setRolePermission, updateRole } from "../actions";

export const metadata: Metadata = { title: "Role details", robots: { index: false, follow: false } };

export default async function RoleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  if (!session.user.roles.includes(RoleName.SUPER_ADMIN)) redirect("/admin");
  const { id } = await params;
  const [role, auditLogs] = await Promise.all([
    prisma.role.findUnique({ where: { id }, select: { id: true, name: true, description: true, createdAt: true, users: { orderBy: { assignedAt: "desc" }, take: 20, select: { assignedAt: true, user: { select: { id: true, name: true, email: true } } } }, permissions: { orderBy: { permission: { key: "asc" } }, select: { permission: { select: { id: true, key: true, description: true } } } } } }),
    prisma.auditLog.findMany({ where: { metadata: { path: ["roleId"], equals: id } }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, event: true, createdAt: true, actor: { select: { name: true, email: true } } } }),
  ]);
  if (!role) notFound();

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><Link className="text-sm font-medium text-sky-200 hover:text-sky-100" href="/admin/roles">← Back to roles</Link><p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Role management</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{role.name.replaceAll("_", " ")}</h1><p className="mt-2 text-sm text-slate-400">Created {formatDate(role.createdAt)}</p></div><div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><div className="space-y-6"><Card id="edit"><CardHeader><CardTitle>Role information</CardTitle><CardDescription>Update the description for this role.</CardDescription></CardHeader><CardContent><form action={updateRole} className="space-y-4"><input name="id" type="hidden" value={role.id} /><label className="grid gap-1.5"><span className="text-sm font-medium text-slate-300">Role name</span><Input disabled value={role.name.replaceAll("_", " ")} /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-slate-300">Description</span><Input defaultValue={role.description || ""} name="description" placeholder="Role description" /></label><Button type="submit">Save changes</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Assigned users</CardTitle><CardDescription>Most recently assigned users for this role.</CardDescription></CardHeader><CardContent>{role.users.length === 0 ? <p className="text-sm text-slate-500">No users have this role.</p> : <ul className="divide-y divide-white/10">{role.users.map(({ assignedAt, user }) => <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={user.id}><div><Link className="text-sm font-medium text-sky-100 hover:text-white" href={`/admin/users/${user.id}`}>{user.name || "Unnamed user"}</Link><p className="mt-1 text-xs text-slate-500">{user.email || "No email address"}</p></div><time className="text-xs text-slate-500">{formatDate(assignedAt)}</time></li>)}</ul>}</CardContent></Card></div><div className="space-y-6"><Card><CardHeader><CardTitle>Assigned permissions</CardTitle><CardDescription>Permissions granted by this role.</CardDescription></CardHeader><CardContent>{role.permissions.length === 0 ? <p className="text-sm text-slate-500">No permissions assigned.</p> : <ul className="divide-y divide-white/10">{role.permissions.map(({ permission }) => <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={permission.id}><div><p className="font-mono text-xs text-slate-200">{permission.key}</p><p className="mt-1 text-xs text-slate-500">{permission.description || "No description provided."}</p></div><form action={setRolePermission.bind(null, { roleId: role.id, permissionId: permission.id, enabled: false })}><Button size="sm" type="submit" variant="outline">Remove</Button></form></li>)}</ul>}</CardContent></Card><Card><CardHeader><CardTitle>Audit history</CardTitle><CardDescription>Role administration events.</CardDescription></CardHeader><CardContent>{auditLogs.length === 0 ? <p className="text-sm text-slate-500">No role audit events have been recorded.</p> : <ol className="divide-y divide-white/10">{auditLogs.map((log) => <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0" key={log.id}><div><p className="font-mono text-xs text-sky-100">{log.event}</p><p className="mt-1 text-xs text-slate-500">Actor: {log.actor?.name || log.actor?.email || "System"}</p></div><time className="shrink-0 text-xs text-slate-500">{formatDate(log.createdAt)}</time></li>)}</ol>}</CardContent></Card></div></div></div>;
}

function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date); }
