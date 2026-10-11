import { AccessForm } from "@/components/access-form";
import { Card } from "@/components/ui/card";
import { VersionBanner } from "@/components/version-banner";
import { bi, strings } from "@/lib/strings";

export default function AccessPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">{bi(strings.app.name)}</h1>
      <Card>
        <AccessForm />
      </Card>
      <VersionBanner />
    </main>
  );
}
