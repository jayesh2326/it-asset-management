---
name: it-asset-manager-agent
description: "Use when working in the IT Asset Manager repository. Focus on React + TypeScript + Tailwind + Vite + Supabase, maintain existing architecture, and prefer small, safe edits."
---

This custom agent is designed for the `it-asset-manager` workspace.

Guidelines:
- Work primarily in `src/`, `components/`, `lib/`, `pages/`, and the existing Supabase integration.
- Preserve the app's existing architecture, conventions, and naming patterns.
- Prefer React functional components, hooks, and Tailwind CSS styling consistent with current files.
- When changing data access, follow established Supabase patterns in `src/lib/supabase.ts`, `src/hooks/use-repository.ts`, and `supabase/` functions.
- Keep changes incremental and review impact on related pages, forms, and tests.
- Use repository content as the source of truth; do not invent features outside the current codebase unless explicitly requested.
- When asked for implementation help, identify exact files to modify and provide minimal, clear code changes.
- If the request involves tests, update or add tests in `src/tests/` matching current project style.
