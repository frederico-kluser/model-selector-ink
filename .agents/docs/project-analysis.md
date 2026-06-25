# project-analysis.md — model-selector-ink

> Phase 1 artifact. Annotated map of the repo + candidate knowledge areas.
> Curated from direct source reads (not auto-summarized).

## What this is

A publishable npm library (`model-selector-ink`, v4.0.0, MIT) that renders an
interactive Ink/React TUI for picking an LLM. It merges two live data sources —
**OpenRouter** (pricing, context, capabilities) and **Artificial Analysis**
(benchmarks, speed) — into an `EnrichedModel`, then shows a filterable, sortable
table. Ships as ESM only, Node >= 20.

## Stack (exact)

- **Language:** TypeScript 5.7, `strict: true`, `module: NodeNext`, target ES2022, `jsx: react-jsx`.
- **Runtime:** React 19 + Ink 6 (TUI). `ink-text-input` for text fields. Zod 3 for all external-data validation.
- **Build:** `tsc` → `dist/`, plus a copy of `src/data/bundled-benchmarks.json`.
- **Lint:** ESLint flat config (`eslint.config.js`) + typescript-eslint.
- **Peer deps** (consumer supplies): ink, ink-text-input, react, zod. Dev deps mirror them.

## Commands (copy-pasteable, from package.json / scripts)

- Build: `npm run build`  → `tsc && cp src/data/bundled-benchmarks.json dist/data/bundled-benchmarks.json`
- Typecheck: `npm run typecheck`  → `tsc --noEmit`
- Lint: `npm run lint`  → `eslint src/`
- Dev/visual run: `npm run dev`  → `npx tsx src/dev.tsx` (accepts `--openrouter-key=`, `--aa-key=`, `--width=`, `--height=`)
- Release: `npm run release[:patch|:minor|:major]`  → `./scripts/release.sh`
- There is **no test runner / no test files** in the repo. "Validation" = typecheck + lint + build + visual `dev`.

## Directory map (annotated)

```
src/
  index.ts                       Barrel: the ENTIRE public API surface. Update when adding exports.
  dev.tsx                        Dev harness; only file allowed to use console (eslint override).
  data/                          Pure data layer — fetch, validate, normalize, enrich. No React.
    openrouter-client.ts         OpenRouter fetch + zod schema + in-memory cache (TTL 1h) + price/provider helpers.
    artificial-analysis-client.ts AA fetch (x-api-key) + zod schema + in-memory cache (TTL 24h) + name normalizer.
    models.ts                    ModelEntry type + toModelEntry() OR→internal mapping + format helpers.
    enriched-model.ts            EnrichedModel type + buildEnrichedModels() name-based OR×AA matching.
    bundled-benchmarks.json      Offline fallback data, shipped in the package `files`.
  hooks/                         React glue. API-first-then-cache strategy.
    use-models.ts                OpenRouter loading state machine (loading|loaded|error).
    use-artificial-analysis.ts   AA loading state machine (adds 'idle' when no key).
  services/                      Side-effecting infra (fs, env, config). No React.
    api-key-resolver.ts          Key precedence chain: explicit > .env(CWD) > process.env > global config.
    global-config.ts             ~/.model-selector-ink/config.json read/write (chmod 600 on save).
    offline-benchmark-cache.ts   Disk cache + bundled fallback + serialized write queue. Largest file (359 LOC).
  components/                    Ink UI.
    model-selector.tsx           Top-level container: wires hooks → enrichment → table. Main export.
    enhanced-model-table.tsx     The table + all keybindings + viewport scrolling. Largest UI file (380 LOC).
    table-columns.ts             COLUMN definitions (data/format/color), preset filters. Data, not JSX.
    filter-parser.ts             Pipe-filter DSL: parse/serialize/apply + metric alias map.
    filter-builder-modal.tsx     Modal to build filter rules interactively.
    column-selector-modal.tsx    Modal to toggle visible metric columns.
    sort-selector-modal.tsx      Modal to pick sort key.
scripts/release.sh               Guarded npm release (clean tree, npm login, typecheck/lint/build, publish, tag).
```

## Data flow (the spine)

```
OpenRouter API ─fetch+zod─► OpenRouterModel ─toModelEntry─► ModelEntry ┐
                                                                       ├─buildEnrichedModels─► EnrichedModel ─► EnhancedModelTable
Artificial Analysis API ─fetch+zod─► AAModel ─────────────────────────┘   (name-normalized match)
        ▲                                   ▲
        └── in-memory cache (TTL) ◄── disk cache (24h) ◄── bundled-benchmarks.json  (fallback hierarchy)
```

Hooks drive it: **always try the live API first each run; on failure fall back to
disk cache (any age) → bundled JSON → error.** On success, hooks persist a fresh
disk snapshot. Enrichment is best-effort: no AA key or no match ⇒ `aa.matched = false`
and the table just hides benchmark columns.

## Conventions observed (high-signal, non-obvious)

- **Bilingual by design:** doc comments / inline comments are **pt-BR**; identifiers, types,
  and public API JSDoc are **English**. Match the language of the file you edit.
- **Result pattern, never throw across boundaries:** fetch/cache return
  `{ ok: true, ... } | { ok: false, error }`. Callers branch on `.ok`.
- **Zod validates every external payload** with `.default()`/`.catch()`/`.nullable()` so a
  malformed field degrades gracefully instead of throwing.
- **ESM with explicit `.js` import specifiers** even from `.ts` sources (NodeNext). Required.
- **`@typescript-eslint/no-explicit-any` is an error**, `no-console` is an error (except `dev.tsx`).
- **Soft size limits (warn):** file `max-lines` 500, function `max-lines-per-function` 50,
  `complexity` 10, `max-depth` 4. Keep new code under these.
- **`noUncheckedIndexedAccess` is on** → indexed access is `T | undefined`; code uses `!` only
  where an adjacent guard proves presence.
- **In-memory caches are module-level singletons** with `seed*`/`invalidate*`/`isValid` helpers.

## Known gotchas

- `filter-parser.ts` header comment says pipe `|` is "UNION (OR)", but `applyFilters` is **hybrid**:
  text rules OR together, metric rules AND together, the two groups AND. Trust the code + the
  `applyFilters` JSDoc, not the file header.
- Benchmark scales differ: Index metrics (intel/code/math) are 0–100 already; knowledge metrics
  (mmlu/gpqa/hle/lcb/sci/m500/aime) are raw 0–1 and multiplied by 100 for display/filtering.
- Every new public symbol must be re-exported from `src/index.ts` or it is invisible to consumers.
- Disk-cache writes go through a serialized `enqueueSave` queue to avoid read-modify-write races
  between the OR and AA save paths — preserve that when touching the cache.

## Candidate knowledge areas (→ skills)

1. **Architecture / module map & data flow** → `knowledge-architecture`
2. **Code style & conventions** → `knowledge-code-style`
3. **Data pipeline: clients, enrichment, caching** → `knowledge-data-pipeline`
4. **Table UI: Ink components, columns, filter DSL, keybindings** → `knowledge-table-ui`

## Candidate recurring tasks (→ skills)

- Add a metric/benchmark column to the table → `task-add-table-column`
- Add a filterable metric alias to the filter DSL → `task-add-filter-metric`
- Validate a change (typecheck/lint/build) → `task-build-and-validate`
- Cut a release → `task-release-package`
