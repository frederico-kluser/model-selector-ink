---
name: knowledge-architecture
description: Injects the model-selector-ink layer map and data flow so the agent knows where code lives without re-scanning. Use when locating functionality, planning a cross-layer change, deciding which file owns a concern, or onboarding to the repo.
metadata:
  version: 0.1.0
  type: knowledge
---

# Architecture & Data Flow

`model-selector-ink` is an ESM-only npm library (Node >= 20): an Ink/React TUI
that merges two live APIs into one enriched model list and renders a
filterable/sortable table.

## Layers (strict separation)

- **`src/data/`** — pure data: fetch, zod-validate, normalize, enrich. No React, no fs side effects beyond what clients need.
- **`src/services/`** — side-effecting infra: filesystem, env, global config, disk cache.
- **`src/hooks/`** — React state machines that orchestrate data + services.
- **`src/components/`** — Ink UI. `table-columns.ts` and `filter-parser.ts` are data/logic that happen to live here (no JSX).
- **`src/index.ts`** — the barrel. **The entire public API.** Anything not re-exported here is invisible to consumers.
- **`src/dev.tsx`** — local visual harness (the only file allowed `console`).

## The data spine

```
OpenRouter API ─fetch+zod─► OpenRouterModel ─toModelEntry─► ModelEntry ┐
                                                                       ├─buildEnrichedModels─► EnrichedModel ─► EnhancedModelTable
Artificial Analysis API ─fetch+zod─► AAModel ─────────────────────────┘   (name-normalized match)
```

- `ModelEntry` = OpenRouter base (pricing, context, capabilities).
- `EnrichedModel extends ModelEntry` + an `aa` block (benchmarks/speed/pricing, `matched: boolean`).
- Matching is **name-normalized** and best-effort: no AA key or no match ⇒ `aa.matched = false`, and the table simply hides benchmark columns.

## Loading strategy (why it looks the way it does)

Hooks are **API-first every run**: try the live API → on failure fall back to disk
cache (any age) → bundled JSON → error. On success they persist a fresh disk
snapshot. See `knowledge-data-pipeline` for the cache hierarchy details.

## Where to make common changes

- New benchmark/metric in the table → `components/table-columns.ts` (+ `filter-parser.ts` to filter it). See `task-add-table-column`.
- New API field → the relevant zod schema in `data/*-client.ts`, then the mapping (`toModelEntry` / `buildEnrichedModels`), then surface it.
- New public export → add it to `src/index.ts`.
- Key/config behavior → `services/api-key-resolver.ts` / `services/global-config.ts`.

## References

- `references/file-map.md` — one-line purpose for every source file.
