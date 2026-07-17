import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { assignUserRole, removeUserRole, updateUser } from "../actions";

export const metadata: Metadata = { title: "User details", robots: { index: false, follow: false } };

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  const { id } = await params;
  const [user, roles, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, image: true, isActive: true, emailVerified: true, createdAt: true, updatedAt: true, password: true,
        accounts: { select: { provider: true } },
        roles: { select: { roleId: true, role: { select: { name: true } } } },
      },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true } }),
    prisma.auditLog.findMany({
      where: { actorId: id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, event: true, createdAt: true, actor: { select: { name: true, email: true } } },
    }),
  ]);
  if (!user) notFound();
  const assignedRoleIds = new Set(user.roles.map(({ roleId }) => roleId));
  const canManage = session.user.roles.includes(RoleName.SUPER_ADMIN) || !user.roles.some(({ role }) => role.name === RoleName.SUPER_ADMIN);
  const initials = (user.name || user.email || "U").slice(0, 1).toUpperCase();
  const providers = new Set(user.accounts.map(({ provider }) => provider));

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link className="text-sm font-medium text-sky-200 hover:text-sky-100" href="/admin/users">← Back to users</Link><p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">User management</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{user.name || "Unnamed user"}</h1><p className="mt-2 text-sm text-slate-400">{user.email || "No email address"}</p></div><Avatar className="size-16" size="lg"><AvatarImage alt="" src={user.image || undefined} /><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar></div><div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><div className="space-y-6"><Card><CardHeader><CardTitle>Profile</CardTitle><CardDescription>Account contact and verification information.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Detail label="Email" value={user.email || "No email address"} /><Detail label="Phone" value={user.phone || "Not provided"} /><Detail label="Status" value={user.isActive ? "Active" : "Inactive"} valueClassName={user.isActive ? "text-emerald-200" : "text-rose-200"} /><Detail label="Email verification" value={user.emailVerified ? `Verified ${formatDate(user.emailVerified)}` : "Not verified"} /><Detail label="Created" value={formatDate(user.createdAt)} /><Detail label="Last updated" value={formatDate(user.updatedAt)} /></CardContent></Card><Card id="edit"><CardHeader><CardTitle>Edit user</CardTitle><CardDescription>{canManage ? "Email is managed by the authentication provider and cannot be changed here." : "Only a super administrator can edit a super administrator account."}</CardDescription></CardHeader><CardContent><form action={updateUser} className="grid gap-4 sm:grid-cols-2"><input name="id" type="hidden" value={user.id} /><label className="grid gap-1.5"><span className="text-sm font-medium text-slate-300">Name</span><Input defaultValue={user.name || ""} disabled={!canManage} name="name" required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-slate-300">Phone</span><Input defaultValue={user.phone || ""} disabled={!canManage} name="phone" placeholder="+919876543210" /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-slate-300">Email</span><Input disabled value={user.email || "No email address"} /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-slate-300">Status</span><select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate-200 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" defaultValue={String(user.isActive)} disabled={!canManage} name="isActive"><option value="true">Active</option><option value="false">Inactive</option></select></label><div className="sm:col-span-2"><Button disabled={!canManage} type="submit">Save changes</Button></div></form></CardContent></Card><Card><CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Most recent audit events recorded for this user.</CardDescription></CardHeader><CardContent>{activity.length === 0 ? <p className="text-sm text-slate-500">No activity has been recorded.</p> : <ol className="divide-y divide-white/10">{activity.map((entry) => <li className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0" key={entry.id}><div><p className="font-mono text-xs text-sky-100">{entry.event}</p><p className="mt-1 text-xs text-slate-500">Actor: {entry.actor?.name || entry.actor?.email || "System"}</p></div><time className="shrink-0 text-xs text-slate-500" dateTime={entry.createdAt.toISOString()}>{formatDate(entry.createdAt)}</time></li>)}</ol>}</CardContent></Card></div><div className="space-y-6"><Card><CardHeader><CardTitle>Connected accounts</CardTitle><CardDescription>Authentication methods linked to this account.</CardDescription></CardHeader><CardContent className="space-y-3"><Connection label="Google" connected={providers.has("google")} /><Connection label="GitHub" connected={providers.has("github")} /><Connection label="Email / Password" connected={Boolean(user.password)} /></CardContent></Card><Card><CardHeader><CardTitle>Assigned roles</CardTitle><CardDescription>{canManage ? "Manage the user&apos;s access roles." : "Only a super administrator can manage this account's roles."}</CardDescription></CardHeader><CardContent className="space-y-3">{user.roles.length === 0 ? <p className="text-sm text-slate-500">No roles assigned.</p> : user.roles.map(({ role, roleId }) => <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2" key={roleId}><div><p className="text-sm font-medium text-slate-200">{role.name.replaceAll("_", " ")}</p></div><form action={removeUserRole}><input name="userId" type="hidden" value={user.id} /><input name="roleId" type="hidden" value={roleId} /><Button disabled={!canManage} size="sm" type="submit" variant="outline">Remove</Button></form></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Assign role</CardTitle><CardDescription>Roles are assigned once; duplicate assignments are prevented.</CardDescription></CardHeader><CardContent><form action={assignUserRole} className="flex gap-2"><input name="userId" type="hidden" value={user.id} /><select className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate-200 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" defaultValue="" disabled={!canManage} name="roleId"><option disabled value="">Select a role</option>{roles.filter((role) => !assignedRoleIds.has(role.id)).map((role) => <option key={role.id} value={role.id}>{role.name.replaceAll("_", " ")}</option>)}</select><Button disabled={!canManage || assignedRoleIds.size === roles.length} type="submit">Assign</Button></form></CardContent></Card></div></div></div>;
}

function Detail({ label, value, valueClassName = "text-slate-200" }: { label: string; value: string; valueClassName?: string }) { return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 text-sm font-medium ${valueClassName}`}>{value}</p></div>; }
function Connection({ label, connected }: { label: string; connected: boolean }) { return <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5"><span className="text-sm font-medium text-slate-200">{label}</span><span className={connected ? "text-xs font-medium text-emerald-200" : "text-xs font-medium text-slate-500"}>{connected ? "Connected" : "Not connected"}</span></div>; }
function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date); }
