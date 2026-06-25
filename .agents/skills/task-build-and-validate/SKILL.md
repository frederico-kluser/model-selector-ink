---
name: task-build-and-validate
description: The exact commands to validate a change in model-selector-ink (typecheck, lint, build, visual dev run). Use before committing, when asked whether a change builds or is correct, or as the closing gate of any code task. There is no test runner in this repo.
metadata:
  version: 0.1.0
  type: task
---

# Build & Validate

This repo has **no unit-test suite**. Validation = types + lint + build (+ optional
visual check). Do not invent or scaffold a test runner unless explicitly asked.

## Commands (in order)

```bash
npm run typecheck   # tsc --noEmit  — strict; must be clean
npm run lint        # eslint src/   — no-explicit-any & no-console are errors
npm run build       # tsc → dist/ + copies bundled-benchmarks.json   (run for shipped changes)
npm run dev         # npx tsx src/dev.tsx — interactive visual check (optional)
```

`npm run dev` flags: `--openrouter-key=`, `--aa-key=`, `--width=`, `--height=`.
Benchmark columns only render when an AA key is supplied.

## What "passing" means

- `typecheck` exits 0 (no `tsc` errors). `strict` + `noUncheckedIndexedAccess` are on.
- `lint` exits 0. **Warnings are allowed** (size/complexity limits warn), but the two
  error rules (`no-explicit-any`, `no-console` outside `dev.tsx`) must not fire.
- For anything that ships to npm, `build` must succeed and emit `dist/`.

## Gotchas

- ESM: a missing `.js` import extension passes the editor but **fails `tsc`/build**.
- A new public symbol that compiles but isn't re-exported from `src/index.ts` is a
  silent miss — grep `src/index.ts` to confirm it's there.
- `npm run dev` needs a TTY; in non-interactive CI just run typecheck+lint+build.

## <evolution>

On completion:
1. Persist learnings only if the commands above passed.
2. Capture any new failure mode and its fix (a lint rule that bit you, a tsc quirk,
   an env requirement). Skip the obvious.
3. Append to `LEARNINGS.md` with date + source (user > inference).
4. Distill stable patterns into this skill and bump `version`.
5. Leave the change as a git diff for human review.
