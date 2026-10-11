import tables from "@/data/tables.json";
import { Card } from "@/components/ui/card";
import { RulePill } from "@/components/ui/rule-pill";
import { bi, strings } from "@/lib/strings";
import type { AnswerResult } from "@/lib/types";
import { QuoteBlock } from "./quote-block";

interface AnswerCardProps {
  answer: AnswerResult;
}

const amendment = tables.amendments[0];

export function AnswerCard({ answer }: AnswerCardProps) {
  const { ref } = answer;
  return (
    <Card as="section" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-zinc-900">{bi(strings.sections.answer)}</h2>
      {!answer.found && <p className="font-semibold text-zinc-800">{bi(strings.answer.notFound)}</p>}
      <p className="text-base text-zinc-900" lang={answer.language}>
        {answer.answer}
      </p>
      {ref && (
        <>
          <RulePill rule={ref.rule} page={ref.page} />
          <QuoteBlock quote={ref.quote} page={ref.page} verified={ref.verified} />
          {ref.ruleId === amendment.ruleId && (
            <p role="note" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {amendment.messageHi}
              <br />
              {amendment.message}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
