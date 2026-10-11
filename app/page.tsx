import { VersionBanner } from "@/components/version-banner";
import { Workspace } from "@/components/workspace/workspace";
import { bi, strings } from "@/lib/strings";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">{bi(strings.app.name)}</h1>
        <p className="text-zinc-600">{bi(strings.app.tagline)}</p>
      </header>
      <VersionBanner />
      <Workspace />
    </main>
  );
}
