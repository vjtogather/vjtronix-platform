import Link from "next/link";

import { SITE } from "@/constants/site";

export function Logo() {
  return (
    <Link
      aria-label={`${SITE.name} home`}
      className="inline-flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
      href="/"
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-lg border border-sky-300/30 bg-sky-300/10 text-sm font-black text-sky-200 shadow-[0_0_32px_rgba(56,189,248,0.22)]"
      >
        VJ
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold text-white">{SITE.name}</span>
        <span className="mt-1 text-xs text-slate-400">{SITE.tagline}</span>
      </span>
    </Link>
  );
}
