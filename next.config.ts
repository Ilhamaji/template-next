import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disabled deliberately for a template.
    // What it does: `next dev` appends a managed block to AGENTS.md, asking the
    // agent to file anonymized Next.js feedback. It makes no network request
    // itself and does not affect the production bundle (Next's own default is
    // `false` in the production runtime).
    // Why off here: it dirties the working tree on first `next dev` and injects
    // ~21 lines of unrelated instructions into a file consumers of this
    // template read as the source of truth. Enable it in your real project.
    agentFeedback: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
