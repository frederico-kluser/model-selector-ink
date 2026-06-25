---
name: knowledge-code-style
description: Injects the non-obvious coding conventions of model-selector-ink (bilingual comments, Result pattern, zod validation, strict ESM imports, eslint limits). Use before writing or editing any code under src/ so new code matches the surrounding style and passes lint/typecheck.
metadata:
  version: 0.1.0
  type: knowledge
---

# Code Style & Conventions

Match the surrounding file. These are the conventions a fresh scan would miss.

## Language (bilingual, on purpose)

- **Comments and doc-prose are pt-BR**; **identifiers, types, and public-API JSDoc
  tags are English.** When you edit a file, write comments in the language already
  used there (almost always pt-BR for internal notes). Public `@param`/`@example`
  JSDoc stays English.

## Error handling — Result pattern, don't throw

- Cross-boundary functions return `{ ok: true, ... } | { ok: false, error: string }`.
  Callers branch on `.ok`. Reserve `throw` for truly unexpected programmer errors.
- Fetch functions catch `AbortError` (timeout) and unknown errors and convert them
  to `{ ok: false, error }`. Follow that shape for any new fetch/cache function.

## External data — always zod

- Every payload from an API, disk, or config file is parsed with a zod schema using
  `.default()`, `.nullable()`, and `.catch(...)` so a malformed field degrades
  gracefully (null / default) instead of throwing. Use `safeParse` and handle
  `!parsed.success`. Never trust `JSON.parse` output as a typed value.

## Modules — ESM with explicit `.js`

- `module: NodeNext`. Import local files with the **`.js`** extension even from
  `.ts` source (e.g. `from './models.js'`). Omitting it breaks the build.
- Package is `type: module`; no CommonJS. New public symbols must be re-exported
  from `src/index.ts`.

## TypeScript strictness (will fail CI if violated)

- `@typescript-eslint/no-explicit-any` is an **error** — never use `any`; use
  `unknown` + a zod parse or a narrow type.
- `no-console` is an **error** everywhere except `src/dev.tsx`.
- `strict` + `noUncheckedIndexedAccess`: indexed access is `T | undefined`. Use a
  non-null `!` only when an adjacent guard proves presence (the codebase does this,
  e.g. `arr[i]!` right after a length check).
- `readonly` is used pervasively on interface fields and array params
  (`readonly T[]`). Keep new public types `readonly`.

## Size limits (eslint warns — keep under)

- File `max-lines` 500, function `max-lines-per-function` 50, `complexity` 10,
  `max-depth` 4. If a change pushes past these, extract a helper. These explain why
  files like `offline-benchmark-cache.ts` split logic into small named functions.

## Style defaults

- Prefer small arrow-function helpers with a one-line JSDoc over inline logic.
- Module-level singletons for caches (`let cached... ; let timestamp`) with
  `seed*`/`invalidate*`/`isValid*` accessors — match this if adding a cache.
- Default + escape hatch: give options sensible defaults (`?? DEFAULT`) rather than
  forcing callers to pass everything.

## References

- `references/snippets.md` — canonical copy-paste patterns (Result, zod, fetch-with-timeout).
