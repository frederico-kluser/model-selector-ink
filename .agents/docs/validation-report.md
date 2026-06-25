# validation-report.md

> Phase 5 artifact. Evals per skill (should-trigger vs near-miss), routing checks,
> and a pass over the success criteria.

## Routing evals (does project-router pick the right chain?)

| # | Example task | Expected chain | Rationale |
|---|---|---|---|
| 1 | "Add a column showing AA output price" | router → knowledge-table-ui, knowledge-code-style → task-add-table-column → task-build-and-validate | new column; price already on model |
| 2 | "Make GPQA filterable with $gpqa" | router → knowledge-table-ui, knowledge-code-style → task-add-filter-metric → task-build-and-validate | new `$alias` in DSL |
| 3 | "OpenRouter returns a new field, expose it" | router → knowledge-data-pipeline, knowledge-code-style → (then task-add-table-column) | schema + mapping change first |
| 4 | "Why aren't benchmarks showing?" | router → knowledge-data-pipeline (matching + AA key) | enrichment/key question, read-only |
| 5 | "Where is the cache written?" | router → knowledge-architecture / knowledge-data-pipeline | locate + mechanics |
| 6 | "Publish a minor release" | router → task-release-package | release flow |
| 7 | "Does this build?" | router → task-build-and-validate | validation gate |
| 8 | "Change a keybinding to delete a filter row" | router → knowledge-table-ui, knowledge-code-style → task-build-and-validate | UI input change |

## Per-skill should-trigger vs near-miss

- **knowledge-code-style** — TRIGGER: any `src/**` edit. NEAR-MISS (should NOT alone
  drive routing): editing `.agents/docs/*.md` (docs, not code).
- **knowledge-data-pipeline** — TRIGGER: fetch/cache/enrichment/key. NEAR-MISS:
  changing a column's color (that's table-ui, not pipeline).
- **knowledge-table-ui** — TRIGGER: columns/filters/modals/keybindings. NEAR-MISS:
  adding an API schema field (pipeline, even though it later surfaces in the table).
- **knowledge-architecture** — TRIGGER: "where does X live", cross-layer planning.
  NEAR-MISS: a one-line fix in a file you already have open (no need to load the map).
- **task-add-table-column** — TRIGGER: "add a column". NEAR-MISS: "add a filter"
  (that's task-add-filter-metric) — though the two compose.
- **task-add-filter-metric** — TRIGGER: "$alias / make filterable". NEAR-MISS:
  "add a column" (column first, filter optional).
- **task-build-and-validate** — TRIGGER: verify/build/pre-commit. NEAR-MISS: "write
  tests" — there is no runner; this skill says so rather than scaffolding one.
- **task-release-package** — TRIGGER: release/publish/bump. NEAR-MISS: "build the
  project" (that's just `npm run build`, not a release).
- **meta-skill-evolution** — TRIGGER: end-of-task learning / new area. NEAR-MISS:
  routine edit with nothing surprising (discard, don't persist).
- **meta-skill-consolidate** — TRIGGER: scheduled GC / bloat. NEAR-MISS: a single new
  learning (that's evolution, not a full consolidation pass).

## Success criteria check

1. Lean skills, correct frontmatter (name + 3rd-person description, "what + when") — **PASS** (all bodies well under 5k tokens; longest is data-pipeline).
2. Exactly one `project-router` — **PASS**.
3. Each task skill ends with `<evolution>` + has `LEARNINGS.md` — **PASS** (4/4).
4. Meta-skills for evolution and consolidation exist — **PASS**.
5. Curated knowledge (exact commands, constraints, non-obvious patterns; no generic
   overviews; no unexplained MUST/ALWAYS caps) — **PASS**.
6. Portable structure: `.agents/skills/` source, documented symlinks, minimal
   frontmatter — **PASS** (`.claude/skills` → `../.agents/skills`, `CLAUDE.md` → `AGENTS.md`).
7. Each phase produced a review artifact (`project-analysis.md`, `skill-map.md`, this
   report) — **PASS**.

## Notes / known gaps

- All `LEARNINGS.md` carry a single seed entry dated 2026-06-25 (source: inference);
  real episodic memory accrues as tasks run. This is expected for a fresh bootstrap.
- No source code was modified — the system is additive (docs + skills + symlinks), so
  `npm run build` behavior is unchanged. Verified typecheck/lint/build still green.
- An optional Claude Code Stop hook to make the evolution step deterministic was
  considered (Phase 4) but left out of the default install to avoid forcing harness
  config; `meta-skill-evolution` + the per-skill `<evolution>` section cover it via
  the prompt path. Add a hook later if drift shows the step being skipped.
