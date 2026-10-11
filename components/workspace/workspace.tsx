"use client";

import { useMemo, useState, useTransition } from "react";
import { askAction } from "@/app/actions/ask";
import { runChecks } from "@/lib/engine";
import { bi, strings } from "@/lib/strings";
import type { AskResult, PlanInput } from "@/lib/types";
import { AnswerCard } from "./answer-card";
import { AskBox } from "./ask-box";
import { CheckList } from "./check-list";
import { CheckSummary } from "./check-summary";
import { PlanForm } from "./plan-form";
import { PrintSlip } from "./print-slip";

export function Workspace() {
  const [text, setText] = useState("");
  const [fields, setFields] = useState<PlanInput>({});
  const [ask, setAsk] = useState<AskResult | null>(null);
  const [pending, startTransition] = useTransition();
  // The engine runs in the browser, so checks update on every edit, with or without Claude.
  const checks = useMemo(() => runChecks(fields), [fields]);

  function submit() {
    startTransition(async () => {
      try {
        const result = await askAction(text);
        setAsk(result);
        setFields((prev) => ({ ...prev, ...result.fields }));
      } catch {
        setAsk({ kind: "question", fields: {}, missing: [], error: bi(strings.errors.askFailed) });
      }
    });
  }

  function reset() {
    setText("");
    setFields({});
    setAsk(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <AskBox
        text={text}
        onTextChange={setText}
        onSubmit={submit}
        onReset={reset}
        pending={pending}
        error={ask?.error}
      />
      <PrintSlip />
      {ask?.answer && <AnswerCard answer={ask.answer} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlanForm fields={fields} onChange={setFields} missing={ask?.missing ?? []} />
        <section className="flex flex-col gap-4" aria-label={bi(strings.sections.checks)}>
          <CheckSummary checks={checks} />
          <CheckList checks={checks} />
        </section>
      </div>
    </div>
  );
}
