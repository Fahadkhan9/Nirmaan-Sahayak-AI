import { bi, strings } from "@/lib/strings";
import { HindiText } from "./hindi-text";

interface QuoteBlockProps {
  quote: string;
  page: number;
  verified: boolean;
}

export function QuoteBlock({ quote, page, verified }: QuoteBlockProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <blockquote className="rounded-lg border-l-4 border-zinc-400 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-800">
        “{quote}”
      </blockquote>
      <span
        className={`self-start rounded-full px-2 py-0.5 text-xs font-semibold ${
          verified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
        }`}
      >
        <span aria-hidden="true">{verified ? "✓ " : "! "}</span>
        {bi(verified ? strings.answer.verified : strings.answer.unverified)}
      </span>
      <HindiText page={page} />
    </div>
  );
}
