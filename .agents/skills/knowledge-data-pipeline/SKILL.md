---
name: knowledge-data-pipeline
description: Injects how model-selector-ink fetches, validates, enriches, and caches model data (OpenRouter + Artificial Analysis clients, name-based matching, the in-memory/disk/bundled cache hierarchy, and the API-key precedence chain). Use when touching anything under data/, hooks/, or services/, or any fetch/cache/enrichment/API-key change.
metadata:
  version: 0.1.0
  type: knowledge
---

# Data Pipeline

Two sources are fetched, validated, normalized, then merged.

## OpenRouter client (`data/openrouter-client.ts`)

- Endpoint `https://openrouter.ai/api/v1/models`, **public** (API key optional, only improves rate limits → `Authorization: Bearer`).
- Filters applied after fetch (all overridable via `FetchModelsOptions`): text output, `created >= 2025-01-01` (`DEFAULT_MIN_CREATED = 1735689600`), exclude `:free` variants, require non-zero pricing. Then **sorted by input price asc**.
- In-memory cache **TTL 1h**. Prices are stored per-token strings; `tokenPriceToPerMillion` converts to USD/1M. `extractProviderName` splits `author/model`.

## Artificial Analysis client (`data/artificial-analysis-client.ts`)

- Endpoint `https://artificialanalysis.ai/api/v2/data/llms/models`, **requires** `x-api-key`. `prompt_length` ∈ `medium|long|100k` (default `medium`).
- Explicit status handling: **401** → invalid key, **429** → rate limit (1000 req/day). In-memory cache **TTL 24h**.
- `normalizeAAName` = lowercase + strip spaces/`-`/`_`/parens, used for matching.

## Enrichment (`data/enriched-model.ts`)

- `buildEnrichedModels(orModels, aaModels)`: builds a normalized-name index over AA `slug` AND `name`, then for each OR model tries: normalized model-id segment → normalized display name → **partial substring** match either direction.
- No AA models (e.g. no key) ⇒ every model gets `EMPTY_AA` (`matched: false`).
- **Scale gotcha:** Index metrics (intelligence/coding/math) are already 0–100; the
  raw knowledge metrics (mmlu_pro, gpqa, hle, livecodebench, scicode, math_500, aime)
  are 0–1 and are scaled ×100 only at display/filter time, not here.

## Cache hierarchy (`services/offline-benchmark-cache.ts`)

Fallback order, highest to lowest:
1. In-memory cache (in each client).
2. Global disk cache `~/.model-selector-ink/benchmark-cache.json` (TTL 24h; `loadGlobalCacheIgnoreTTL` ignores TTL for offline fallback).
3. Bundled `src/data/bundled-benchmarks.json` (shipped, loaded via `createRequire` so symlinks/npm-link work).
4. Live API fetch.

- Writes go through a **serialized queue** (`enqueueSave`) so concurrent OR+AA saves
  don't clobber each other in a read-modify-write race. `saveOpenRouterToCache` /
  `saveAAToCache` each preserve the other source's slice. Preserve this if you touch writes.
- `configureCachePaths({ namespace | cacheDir })` overrides location (call before any cache op).

## Hooks orchestration (`hooks/*`)

- **API-first every run:** invalidate memory → fetch live API → on success set state + persist a fresh disk snapshot; on failure fall back to disk (any age) → bundled → `error`.
- `use-artificial-analysis` adds an **`idle`** state: with no AA key it never calls the API, only disk/bundled.
- Both use a `useRef` init guard so the first fetch fires once.

## API-key precedence (`services/api-key-resolver.ts`)

`explicit (prop/flag/arg) > .env in CWD > process.env > global config`. Vars:
`OPENROUTER_API_KEY`, `ARTIFICIAL_ANALYSIS_API_KEY`. `.env` reads are cached per CWD
(`clearEnvFileCache` to reset). `resolveApiKeys` also reports the `source` of each key.
Global config saved with `chmod 600`.

## References

- `references/api-shapes.md` — exact response fields consumed from each API.
