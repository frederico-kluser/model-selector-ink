# Skill Catalog — model-selector-ink

> llms.txt-style index. Every task routes through `project-router`, which consults
> this catalog to pick the skill chain. Source of truth: `.agents/skills/`
> (symlinked to `.claude/skills/`).

## Router

- [project-router](./project-router/SKILL.md) — dispatches EVERY task to the right
  skills before any edit. Always first.

## Knowledge (semantic memory)

- [knowledge-architecture](./knowledge-architecture/SKILL.md) — layer map + data
  flow; where code lives. Load for locating things / cross-layer / onboarding.
- [knowledge-code-style](./knowledge-code-style/SKILL.md) — bilingual comments,
  Result pattern, zod, strict ESM `.js` imports, eslint limits. Load for any `src/**` edit.
- [knowledge-data-pipeline](./knowledge-data-pipeline/SKILL.md) — clients,
  enrichment/matching, cache hierarchy, API-key precedence. Load for `data/`, `hooks/`, `services/`.
- [knowledge-table-ui](./knowledge-table-ui/SKILL.md) — Ink table, `COLUMNS`,
  filter DSL, presets, keybindings, modals. Load for `components/`.

## Task (procedural memory)

- [task-add-table-column](./task-add-table-column/SKILL.md) — add a metric/benchmark column end to end.
- [task-add-filter-metric](./task-add-filter-metric/SKILL.md) — add a filterable `$alias` to the DSL.
- [task-build-and-validate](./task-build-and-validate/SKILL.md) — typecheck/lint/build (no test runner here).
- [task-release-package](./task-release-package/SKILL.md) — guarded npm release flow.

## Meta

- [meta-skill-evolution](./meta-skill-evolution/SKILL.md) — update/create/discard a learning; emit a diff.
- [meta-skill-consolidate](./meta-skill-consolidate/SKILL.md) — periodic dedup/contradiction/prune/GC.

## Conventions

- Frontmatter is intentionally minimal (`name` + `description` + `metadata`) for
  cross-agent portability (Claude Code, Cursor, Codex read the same files).
- Task skills end with an `<evolution>` step and own a `LEARNINGS.md`.
- All skill edits are reviewed as a git diff before merge (curation gate).
