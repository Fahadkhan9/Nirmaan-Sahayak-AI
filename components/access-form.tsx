"use client";

import { useActionState } from "react";
import { submitAccessCodeAction } from "@/app/actions/access";
import { bi, strings } from "@/lib/strings";

export function AccessForm() {
  const [state, formAction, pending] = useActionState(submitAccessCodeAction, { wrong: false });
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="code" className="font-semibold text-zinc-800">
        {bi(strings.access.title)}
      </label>
      <input
        id="code"
        name="code"
        type="password"
        required
        autoComplete="off"
        className="rounded-lg border border-zinc-300 px-3 py-2 text-base"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {bi(strings.access.submit)}
      </button>
      {state.wrong && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {bi(strings.access.wrong)}
        </p>
      )}
    </form>
  );
}
