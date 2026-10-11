"use client";

import { Card } from "@/components/ui/card";
import { bi, strings } from "@/lib/strings";

interface AskBoxProps {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  pending: boolean;
  error?: string;
}

export function AskBox({ text, onTextChange, onSubmit, onReset, pending, error }: AskBoxProps) {
  return (
    <Card as="section" className="print:hidden">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="ask" className="font-semibold text-zinc-800">
          {bi(strings.sections.ask)}
        </label>
        <textarea
          id="ask"
          rows={3}
          maxLength={1000}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={strings.placeholders.ask.hi}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {bi(pending ? strings.actions.checking : strings.actions.check)}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-800"
          >
            {bi(strings.actions.newCitizen)}
          </button>
          <span className="text-sm text-zinc-500">{bi(strings.actions.submitHint)}</span>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </form>
    </Card>
  );
}
