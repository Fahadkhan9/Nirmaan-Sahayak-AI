"use client";

import { useState, useTransition } from "react";
import { getHindiPageAction } from "@/app/actions/hindi";
import { bi, strings } from "@/lib/strings";

interface HindiTextProps {
  page: number;
}

// Loads one Hindi page from the server only when the clerk opens it.
export function HindiText({ page }: HindiTextProps) {
  const [text, setText] = useState<string | null | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  return (
    <details
      className="text-sm print:hidden"
      onToggle={(e) => {
        if (!e.currentTarget.open || text !== undefined) return;
        startTransition(async () => setText(await getHindiPageAction(page)));
      }}
    >
      <summary className="cursor-pointer text-zinc-600">{bi(strings.hindiText.summary)}</summary>
      {pending && <p className="mt-2 text-zinc-500">{bi(strings.hindiText.loading)}</p>}
      {text === null && <p className="mt-2 text-zinc-500">{bi(strings.hindiText.notAvailable)}</p>}
      {text && (
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-xs font-medium text-amber-800">{bi(strings.hindiText.autoConverted)}</p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm">{text}</pre>
        </div>
      )}
    </details>
  );
}
