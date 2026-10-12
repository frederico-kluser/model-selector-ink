# Skill Catalog — model-selector-ink

> llms.txt-style index. Every task routes through `project-router`, which consults
> this catalog to pick the skill chain. Source of truth: `.agents/skills/`
> (symlinked to `.claude/skills/`).

## Router

- [project-router](./project-router/SKILL.md) — dispatches EVERY task to the right
  skills before any edit. Always first.

## Knowledge (semantic memory — CoALA records)

> The `knowledge-*` skills were migrated to the local CoALA memory and deleted on 2026-09-27.
> Retrieve with `coala.py search "<terms>" --tags <skill>` (key `knowledge/<skill>`).

- CoALA `knowledge-architecture` — layer map + data
  flow; where code lives. Retrieve for locating things / cross-layer / onboarding.
- CoALA `knowledge-code-style` — bilingual comments,
  Result pattern, zod, strict ESM `.js` imports, eslint limits. Retrieve for any `src/**` edit.
- CoALA `knowledge-data-pipeline` — clients,
  enrichment/matching, cache hierarchy, API-key precedence. Retrieve for `data/`, `hooks/`, `services/`.
- CoALA `knowledge-table-ui` — Ink table, `COLUMNS`,
  filter DSL, presets, keybindings, modals. Retrieve for `components/`.

## Task (procedural memory)

- [task-add-table-column](./task-add-table-column/SKILL.md) — add a metric/benchmark column end to end.
- [task-add-filter-metric](./task-add-filter-metric/SKILL.md) — add a filterable `$alias` to the DSL.
- [task-build-and-validate](./task-build-and-validate/SKILL.md) — typecheck/lint/build (no test runner here).
- [task-release-package](./task-release-package/SKILL.md) — guarded npm release flow.

## Meta

- Local CoALA memory (`coala.py add`) — update/create/discard a learning; emit a diff.
- Maintenance (supersession by `--key` + `doctor`/`backup`) — periodic dedup/contradiction/prune/GC.

## Conventions

- Frontmatter is intentionally minimal (`name` + `description` + `metadata`) for
  cross-agent portability (Claude Code, Cursor, Codex read the same files).
- Task skills end with an learning step (memória CoALA local) and own a `LEARNINGS.md`.
- All skill edits are reviewed as a git diff before merge (curation gate).
