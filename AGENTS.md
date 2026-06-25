# AGENTS.md — model-selector-ink

Hand-written, minimal, always-on. Only non-inferable facts live here; everything
else is in the on-demand skill library (`.agents/skills/`).

## Commands

- build: `npm run build`  (tsc → dist/ + copies `src/data/bundled-benchmarks.json`)
- typecheck: `npm run typecheck`  (`tsc --noEmit`)
- lint: `npm run lint`  (`eslint src/`)
- dev / visual run: `npm run dev`  (`npx tsx src/dev.tsx`; flags `--openrouter-key=`, `--aa-key=`, `--width=`, `--height=`)
- release: `npm run release[:patch|:minor|:major]`  (guarded `scripts/release.sh`)
- **No test runner exists.** Validation = typecheck + lint + build. Do not scaffold one unless asked.

## Rules (only what differs from language defaults)

- ESM with `module: NodeNext`: import local files with the **`.js`** extension even
  from `.ts` sources — omitting it fails the build.
- `@typescript-eslint/no-explicit-any` and `no-console` are **errors** (console is
  allowed only in `src/dev.tsx`).
- External data (APIs, disk, config) is validated with **zod** using
  `.default()`/`.nullable()`/`.catch()`; boundary functions return a Result
  (`{ ok: true, ... } | { ok: false, error }`) instead of throwing.
- Comments/doc-prose are **pt-BR**; identifiers, types, and public JSDoc are English.
  Match the file you edit.
- Every consumer-facing symbol must be re-exported from `src/index.ts`.

## Skills

Every task goes through `.agents/skills/project-router` first.
Catalog: `.agents/skills/catalog.md`. Source of truth is `.agents/skills/`
(symlinked to `.claude/skills/`); edit skills only via a reviewed git diff.

## Security

- Never read or commit secrets: `.env`, `.env.local`, `~/.model-selector-ink/config.json`.
- API keys come from the resolver chain (explicit > `.env` > `process.env` > global
  config); never hard-code one.
