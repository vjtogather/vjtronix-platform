import type { Metadata } from "next";
import Link from "next/link";
import { Activity, KeyRound, ShieldCheck, UserCheck, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [users, activeUsers, roles, permissions, weeklyEvents, recentAuditLogs, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, event: true, createdAt: true, actor: { select: { name: true, email: true } } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, createdAt: true, isActive: true } }),
  ]);

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Administration</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Platform overview</h1><p className="mt-2 text-sm leading-6 text-slate-400">Monitor accounts, access controls, and recent platform activity.</p></div><section aria-label="Platform analytics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Users} label="Total users" value={String(users)} /><Metric icon={UserCheck} label="Active users" value={String(activeUsers)} /><Metric icon={ShieldCheck} label="Roles" value={String(roles)} /><Metric icon={KeyRound} label="Permissions" value={String(permissions)} /></section><div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><Card><CardHeader><CardTitle>Recent audit activity</CardTitle><CardDescription>{weeklyEvents} events recorded in the last 7 days.</CardDescription></CardHeader><CardContent>{recentAuditLogs.length === 0 ? <EmptyState icon={Activity} message="No audit events have been recorded yet." /> : <ol className="divide-y divide-white/10">{recentAuditLogs.map((log) => <li className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0" key={log.id}><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{formatEvent(log.event)}</p><p className="mt-1 truncate text-xs text-slate-500">{log.actor?.name || log.actor?.email || "System"}</p></div><time className="shrink-0 text-xs text-slate-500" dateTime={log.createdAt.toISOString()}>{formatDate(log.createdAt)}</time></li>)}</ol>}</CardContent><div className="border-t border-white/10 px-4 py-3"><Link className="text-sm font-medium text-sky-200 hover:text-sky-100" href="/admin/audit-logs">View all audit logs</Link></div></Card><Card><CardHeader><CardTitle>Newest users</CardTitle><CardDescription>Recently created platform accounts.</CardDescription></CardHeader><CardContent>{recentUsers.length === 0 ? <EmptyState icon={Users} message="New user accounts will appear here." /> : <ul className="space-y-3">{recentUsers.map((user) => <li className="rounded-lg bg-white/[0.04] px-4 py-3" key={user.id}><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-slate-200">{user.name || "Unnamed user"}</p><span className={user.isActive ? "text-xs text-emerald-200" : "text-xs text-rose-200"}>{user.isActive ? "Active" : "Inactive"}</span></div><p className="mt-1 truncate text-xs text-slate-500">{user.email || "No email"}</p></li>)}</ul>}</CardContent><div className="border-t border-white/10 px-4 py-3"><Link className="text-sm font-medium text-sky-200 hover:text-sky-100" href="/admin/users">Manage users</Link></div></Card></div></div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) { return <Card><CardContent className="flex items-center gap-4 pt-4"><span className="grid size-10 place-items-center rounded-lg bg-sky-300/10 text-sky-200"><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></div></CardContent></Card>; }
function EmptyState({ icon: Icon, message }: { icon: typeof Activity; message: string }) { return <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center"><div><Icon className="mx-auto size-6 text-slate-500" aria-hidden="true" /><p className="mt-3 text-sm text-slate-500">{message}</p></div></div>; }
function formatEvent(event: string) { return event.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()); }
function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(date); }
