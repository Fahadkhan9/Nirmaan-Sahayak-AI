"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { bi, strings } from "@/lib/strings";

function referenceId(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `NS-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// The button hides on paper; the reference line shows only on paper.
export function PrintSlip() {
  const [refId, setRefId] = useState("");

  function print() {
    // Render the new reference ID before the print dialog snapshots the page.
    flushSync(() => setRefId(referenceId(new Date())));
    window.print();
  }

  return (
    <div>
      <button
        type="button"
        onClick={print}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-800 print:hidden"
      >
        {bi(strings.print.button)}
      </button>
      {refId && (
        <p className="hidden font-mono text-sm print:block">
          {bi(strings.print.reference)}: {refId}
        </p>
      )}
    </div>
  );
}
