import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyRequestPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-12 text-slate-100">
      <section
        aria-labelledby="verify-request-title"
        className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-sky-950/30 sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
          Sign-in link sent
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white" id="verify-request-title">
          Check your email
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          We sent a secure, single-use sign-in link. Open it in this browser to continue.
        </p>
        <Link
          className="mt-7 inline-flex rounded-md border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          href="/sign-in"
        >
          Use a different email
        </Link>
      </section>
    </main>
  );
}
