import Link from "next/link";

import { AccountNavigation } from "@/components/account/account-navigation";
import { Logo } from "@/components/ui/Logo";
import { requireUser } from "@/lib/auth/authorization";

export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur lg:px-6">
        <Logo />
        <Link className="rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300" href="/">
          Back to site
        </Link>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl">
        <AccountNavigation user={session.user} />
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
