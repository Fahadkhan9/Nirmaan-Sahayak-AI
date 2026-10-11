import { bi, strings } from "@/lib/strings";

export function VersionBanner() {
  const { guidance, rulesVersionLabel, rulesVersion } = strings.banner;
  return (
    <aside
      role="note"
      className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-amber-950"
    >
      <p className="font-semibold">{bi(guidance)}</p>
      <p className="text-sm">
        {bi(rulesVersionLabel)}: {bi(rulesVersion)}
      </p>
    </aside>
  );
}
