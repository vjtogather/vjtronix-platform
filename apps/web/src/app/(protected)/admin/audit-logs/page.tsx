import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Audit logs", robots: { index: false, follow: false } };
const pageSize = 30;

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [totalLogs, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, event: true, metadata: true, createdAt: true, actor: { select: { name: true, email: true } } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Administration</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Audit logs</h1><p className="mt-2 text-sm leading-6 text-slate-400">Immutable record of authentication and account activity.</p></div><Card><CardHeader><CardTitle>Event history</CardTitle><CardDescription>{totalLogs} event{totalLogs === 1 ? "" : "s"} recorded.</CardDescription></CardHeader><CardContent>{logs.length === 0 ? <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">No audit events have been recorded.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-medium">Event</th><th className="pb-3 font-medium">Actor</th><th className="pb-3 font-medium">Metadata</th><th className="pb-3 text-right font-medium">Recorded</th></tr></thead><tbody className="divide-y divide-white/10">{logs.map((log) => <tr key={log.id}><td className="py-4 font-mono text-xs text-sky-100">{log.event}</td><td className="py-4"><p className="text-sm text-slate-200">{log.actor?.name || "System"}</p><p className="mt-1 text-xs text-slate-500">{log.actor?.email || "No user"}</p></td><td className="max-w-xs py-4"><p className="truncate font-mono text-xs text-slate-500">{log.metadata ? JSON.stringify(log.metadata) : "—"}</p></td><td className="py-4 text-right text-xs text-slate-500">{formatDate(log.createdAt)}</td></tr>)}</tbody></table></div>}</CardContent>{totalPages > 1 ? <Pagination page={page} totalPages={totalPages} /> : null}</Card></div>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) { return <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm"><p className="text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2">{page > 1 ? <Link className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06]" href={`/admin/audit-logs?page=${page - 1}`}>Previous</Link> : null}{page < totalPages ? <Link className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06]" href={`/admin/audit-logs?page=${page + 1}`}>Next</Link> : null}</div></div>; }
function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date); }
