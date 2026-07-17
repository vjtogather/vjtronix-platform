import type { Metadata } from "next";
import Link from "next/link";

import { Prisma, RoleName } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

import { setUserStatus } from "./actions";

export const metadata: Metadata = { title: "User management", robots: { index: false, follow: false } };

const pageSize = 20;
const roleNames = Object.values(RoleName);
const statusValues = ["active", "inactive"] as const;

type UsersSearchParams = {
  page?: string;
  role?: string;
  search?: string;
  status?: string;
};

export default async function UsersPage({ searchParams }: { searchParams: Promise<UsersSearchParams> }) {
  const params = await searchParams;
  const filters = getFilters(params);
  const where = buildUsersWhere(filters);
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (requestedPage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const page = Math.min(requestedPage, totalPages);

  return (
    <div className="space-y-6 p-5 sm:p-8 lg:p-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">User management</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{totalUsers} platform account{totalUsers === 1 ? "" : "s"}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Account status, registration date, and assigned roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FilterBar filters={filters} />
          {users.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="pb-3 font-medium">User</th><th className="pb-3 font-medium">Roles</th><th className="pb-3 font-medium">Status</th><th className="pb-3 text-right font-medium">Joined</th><th className="pb-3 text-right font-medium">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-4"><p className="font-medium text-slate-200">{user.name || "Unnamed user"}</p><p className="mt-1 text-xs text-slate-500">{user.email || "No email address"}</p></td>
                      <td className="py-4"><div className="flex flex-wrap gap-1.5">{user.roles.length === 0 ? <span className="text-xs text-slate-500">No roles</span> : user.roles.map(({ role }) => <span className="rounded-full bg-sky-300/10 px-2 py-1 text-xs font-medium text-sky-100" key={role.name}>{role.name.replaceAll("_", " ")}</span>)}</div></td>
                      <td className="py-4"><span className={user.isActive ? "text-xs font-medium text-emerald-200" : "text-xs font-medium text-rose-200"}>{user.isActive ? "Active" : "Inactive"}</span></td>
                      <td className="py-4 text-right text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="py-4"><div className="flex justify-end gap-2"><Link className="text-xs font-medium text-sky-200 hover:text-sky-100" href={`/admin/users/${user.id}`}>View</Link><Link className="text-xs font-medium text-sky-200 hover:text-sky-100" href={`/admin/users/${user.id}#edit`}>Edit</Link><form action={setUserStatus}><input name="id" type="hidden" value={user.id} /><input name="isActive" type="hidden" value={String(!user.isActive)} /><button className="text-xs font-medium text-slate-400 hover:text-white" type="submit">{user.isActive ? "Disable" : "Enable"}</button></form></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 ? <Pagination filters={filters} page={page} totalPages={totalPages} /> : null}
      </Card>
    </div>
  );
}

function FilterBar({ filters }: { filters: UserFilters }) {
  return (
    <form className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-end" method="get">
      <label className="grid gap-1.5 lg:min-w-64 lg:flex-1"><span className="text-xs font-medium text-slate-400">Search</span><Input defaultValue={filters.search} name="search" placeholder="Search name or email" /></label>
      <label className="grid gap-1.5"><span className="text-xs font-medium text-slate-400">Role</span><select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate-200 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" defaultValue={filters.role ?? ""} name="role"><option value="">All roles</option>{roleNames.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select></label>
      <label className="grid gap-1.5"><span className="text-xs font-medium text-slate-400">Status</span><select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate-200 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" defaultValue={filters.status ?? ""} name="status"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      <div className="flex gap-2"><Button type="submit">Search</Button><Link className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-muted hover:text-foreground dark:bg-input/30 dark:hover:bg-input/50" href="/admin/users">Reset filters</Link></div>
    </form>
  );
}

function Pagination({ filters, page, totalPages }: { filters: UserFilters; page: number; totalPages: number }) {
  return <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm"><p className="text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2">{page > 1 ? <Link className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06]" href={usersUrl(filters, page - 1)}>Previous</Link> : null}{page < totalPages ? <Link className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06]" href={usersUrl(filters, page + 1)}>Next</Link> : null}</div></div>;
}

type UserFilters = { search: string; role?: RoleName; status?: (typeof statusValues)[number] };

function getFilters(params: UsersSearchParams): UserFilters {
  const role = roleNames.find((roleName) => roleName === params.role);
  const status = statusValues.find((statusValue) => statusValue === params.status);

  return { search: params.search?.trim() ?? "", role, status };
}

function buildUsersWhere({ search, role, status }: UserFilters): Prisma.UserWhereInput {
  return {
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {}),
    ...(role ? { roles: { some: { role: { name: role } } } } : {}),
    ...(status ? { isActive: status === "active" } : {}),
  };
}

function usersUrl(filters: UserFilters, page: number) {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.role) query.set("role", filters.role);
  if (filters.status) query.set("status", filters.status);
  query.set("page", String(page));
  return `/admin/users?${query.toString()}`;
}

function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date); }
