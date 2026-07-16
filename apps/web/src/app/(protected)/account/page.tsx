import type { Metadata } from "next";

import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const session = await requireUser();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-12 text-slate-100">
      <section
        aria-labelledby="account-title"
        className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-sky-950/30 sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
          Authenticated session
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white" id="account-title">
          Welcome{session.user.name ? `, ${session.user.name}` : ""}
        </h1>
        <dl className="mt-7 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-slate-400">Email</dt>
            <dd className="mt-1 text-white">{session.user.email ?? "Not available"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">Roles</dt>
            <dd className="mt-1 text-white">
              {session.user.roles.length > 0
                ? session.user.roles.join(", ")
                : "No role assigned"}
            </dd>
          </div>
        </dl>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-8"
        >
          <button
            className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
