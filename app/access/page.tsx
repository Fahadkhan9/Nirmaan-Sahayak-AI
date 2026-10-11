import { Suspense } from "react";
import { connection } from "next/server";
import { AccessForm } from "@/components/access-form";
import { Card } from "@/components/ui/card";
import { VersionBanner } from "@/components/version-banner";
import { bi, strings } from "@/lib/strings";

// Reads env per request (not at build time). The code reaches the browser only when ACCESS_DEMO_FILL=true.
async function AccessFormWithDemo() {
  await connection();
  const demoCode = process.env.ACCESS_DEMO_FILL === "true" ? (process.env.ACCESS_CODE ?? "") : "";
  return <AccessForm demoCode={demoCode} />;
}

export default function AccessPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">{bi(strings.app.name)}</h1>
      <Card>
        <Suspense fallback={<AccessForm demoCode="" />}>
          <AccessFormWithDemo />
        </Suspense>
      </Card>
      <VersionBanner />
    </main>
  );
}
