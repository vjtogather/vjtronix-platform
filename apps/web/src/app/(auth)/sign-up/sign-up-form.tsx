"use client";

import { useActionState } from "react";

import { signUp, type SignUpState } from "@/app/(auth)/sign-up/actions";

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="mt-7 grid gap-4">
      {state.error ? (
        <p aria-live="polite" className="rounded-md border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm text-rose-100" role="alert">
          {state.error}
        </p>
      ) : null}
      <Field error={state.fieldErrors?.name?.[0]} id="name" label="Name" type="text" />
      <Field error={state.fieldErrors?.email?.[0]} id="email" label="Email address" type="email" />
      <Field error={state.fieldErrors?.password?.[0]} id="password" label="Password" type="password" />
      <Field error={state.fieldErrors?.confirmPassword?.[0]} id="confirmPassword" label="Confirm password" type="password" />
      <button className="rounded-md bg-sky-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function Field({ error, id, label, type }: { error?: string; id: string; label: string; type: "email" | "password" | "text" }) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-slate-200" htmlFor={id}>{label}</label>
      <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} autoComplete={id === "name" ? "name" : id === "email" ? "email" : id === "password" ? "new-password" : "new-password"} className="rounded-md border border-white/15 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300" id={id} name={id} required type={type} />
      {error ? <p className="text-sm text-rose-200" id={errorId}>{error}</p> : null}
    </div>
  );
}
