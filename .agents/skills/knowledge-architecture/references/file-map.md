# File map (one line each)

## src/data/
- `openrouter-client.ts` — OpenRouter fetch + zod schema + in-memory cache (TTL 1h); `tokenPriceToPerMillion`, `extractProviderName`, `seedCache`/`invalidateCache`/`getCachedModels`.
- `artificial-analysis-client.ts` — AA fetch (`x-api-key`) + zod schema + in-memory cache (TTL 24h); `normalizeAAName`, `seedAACache`/`invalidateAACache`.
- `models.ts` — `ModelEntry` type; `toModelEntry` (OR→internal); `loadModels`, `getModelsCached`, `findModel`, `formatPrice`, `formatContext`.
- `enriched-model.ts` — `EnrichedModel` type; `buildEnrichedModels` (OR×AA name match); empty-AA constants.
- `bundled-benchmarks.json` — offline fallback data shipped in package `files`.

## src/hooks/
- `use-models.ts` — OpenRouter loading state machine (`loading|loaded|error`); API-first then disk/bundled fallback; persists fresh snapshot.
- `use-artificial-analysis.ts` — AA loading state machine (adds `idle` when no key); same fallback shape.

## src/services/
- `api-key-resolver.ts` — key precedence: explicit > `.env`(CWD, cached) > `process.env` > global config; `resolveApiKeys`, `clearEnvFileCache`.
- `global-config.ts` — `~/.model-selector-ink/config.json` read/write; `chmod 600` on save; zod-validated; returns `{}` on any error.
- `offline-benchmark-cache.ts` — disk cache (TTL 24h) + bundled loader + serialized write queue (`enqueueSave`); `configureCachePaths`, `formatCacheAge`, `isDiskCacheFresh`.

## src/components/
- `model-selector.tsx` — top-level container; wires hooks → enrichment → table; resolves keys; unified refresh.
- `enhanced-model-table.tsx` — the table, all keybindings, viewport scrolling (largest UI file).
- `table-columns.ts` — `COLUMNS` (key/label/width/align/group/sortable/getValue/format/color), preset `FILTER_*`, `pad`/`padR`.
- `filter-parser.ts` — pipe-filter DSL: `parseFilterString`, `serializeFilters`, `applyFilters`, `METRIC_ACCESSORS`, `AVAILABLE_METRICS`.
- `filter-builder-modal.tsx` / `column-selector-modal.tsx` / `sort-selector-modal.tsx` — interactive modals.

## root
- `src/index.ts` — public API barrel (re-export everything consumer-facing here).
- `src/dev.tsx` — visual dev harness (`npm run dev`); only file with `console` allowed.
- `scripts/release.sh` — guarded npm release.
