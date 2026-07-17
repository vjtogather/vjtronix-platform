import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

import { signOutAdmin } from "@/app/(protected)/admin/actions";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Logo } from "@/components/ui/Logo";
import { RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  const isSuperAdmin = session.user.roles.includes(RoleName.SUPER_ADMIN);

  return <div className="min-h-screen bg-slate-950 text-slate-100"><header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur lg:px-6"><Logo /><div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-medium text-sky-100 sm:inline-flex"><ShieldCheck className="size-3.5" aria-hidden="true" />{isSuperAdmin ? "Super Admin" : "Admin"}</span><Link className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white sm:block" href="/account">Account</Link><form action={signOutAdmin}><button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300" type="submit"><LogOut className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Sign out</span></button></form></div></header><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl"><AdminNavigation isSuperAdmin={isSuperAdmin} /><main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main></div></div>;
}
