import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-24">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Template Next
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Agent-ready Next.js starter
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Routing, layout, and font tokens are wired. Agent rules live in{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            AGENTS.md
          </code>
          . Start by replacing this page.
        </p>
      </header>

      <nav className="flex flex-wrap gap-3 text-sm font-medium">
        <Link
          href="/api/health"
          className="rounded-full border border-black/[.08] px-4 py-2 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          Health endpoint
        </Link>
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-black/[.08] px-4 py-2 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          Next.js docs
        </a>
      </nav>
    </main>
  );
}
