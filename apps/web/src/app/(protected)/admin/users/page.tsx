import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "User management", robots: { index: false, follow: false } };
const pageSize = 20;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [totalUsers, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, email: true, isActive: true, createdAt: true, roles: { select: { role: { select: { name: true } } } } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  return <div className="space-y-6 p-5 sm:p-8 lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Administration</p><h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">User management</h1><p className="mt-2 text-sm leading-6 text-slate-400">{totalUsers} platform account{totalUsers === 1 ? "" : "s"}.</p></div><Card><CardHeader><CardTitle>Users</CardTitle><CardDescription>Account status, registration date, and assigned roles.</CardDescription></CardHeader><CardContent>{users.length === 0 ? <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">No users found.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-medium">User</th><th className="pb-3 font-medium">Roles</th><th className="pb-3 font-medium">Status</th><th className="pb-3 text-right font-medium">Joined</th></tr></thead><tbody className="divide-y divide-white/10">{users.map((user) => <tr key={user.id}><td className="py-4"><p className="font-medium text-slate-200">{user.name || "Unnamed user"}</p><p className="mt-1 text-xs text-slate-500">{user.email || "No email address"}</p></td><td className="py-4"><div className="flex flex-wrap gap-1.5">{user.roles.length === 0 ? <span className="text-xs text-slate-500">No roles</span> : user.roles.map(({ role }) => <span className="rounded-full bg-sky-300/10 px-2 py-1 text-xs font-medium text-sky-100" key={role.name}>{role.name.replaceAll("_", " ")}</span>)}</div></td><td className="py-4"><span className={user.isActive ? "text-xs font-medium text-emerald-200" : "text-xs font-medium text-rose-200"}>{user.isActive ? "Active" : "Inactive"}</span></td><td className="py-4 text-right text-xs text-slate-500">{formatDate(user.createdAt)}</td></tr>)}</tbody></table></div>}</CardContent>{totalPages > 1 ? <Pagination page={page} totalPages={totalPages} /> : null}</Card></div>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) { return <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm"><p className="text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2">{page > 1 ? <Link className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06]" href={`/admin/users?page=${page - 1}`}>Previous</Link> : null}{page < totalPages ? <Link className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06]" href={`/admin/users?page=${page + 1}`}>Next</Link> : null}</div></div>; }
function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date); }
