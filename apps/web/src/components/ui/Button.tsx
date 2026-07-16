import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-sky-300/70 bg-sky-300 text-slate-950 shadow-[0_16px_48px_rgba(56,189,248,0.22)] hover:bg-sky-200",
  secondary:
    "border-white/12 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
  ghost:
    "border-transparent bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white",
};

export function Button({
  className,
  children,
  href,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
        variants[variant],
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
