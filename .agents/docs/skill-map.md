# skill-map.md — proposed skill library

> Phase 2 artifact. The catalog + dependency graph, before generation.
> Lean by design (Recommendation #1): one router, four knowledge skills,
> four task skills, two meta-skills. Grow only when a pattern repeats.

## Catalog

| Skill | Type | Exists to… | Primary triggers |
|---|---|---|---|
| `project-router` | router | Dispatch every task to the right skills before any edit | any change/fix/feature/refactor/analysis request |
| `knowledge-architecture` | knowledge | Inject the layer map + data flow so the agent doesn't re-scan | "where does X live", cross-layer changes, onboarding |
| `knowledge-code-style` | knowledge | Inject conventions (bilingual, Result pattern, zod, ESM, eslint) | writing/editing any `src/**` code |
| `knowledge-data-pipeline` | knowledge | Inject client/enrichment/cache mechanics | touching `data/**`, `hooks/**`, cache, API fetch |
| `knowledge-table-ui` | knowledge | Inject Ink table, columns, filter DSL, keybindings | touching `components/**`, UI/table/filter changes |
| `task-add-table-column` | task | Procedure to add a metric column end-to-end | "add a column", surface a new benchmark |
| `task-add-filter-metric` | task | Procedure to add a filterable metric alias | "make X filterable", new `$metric` |
| `task-build-and-validate` | task | The exact validation commands (no test runner here) | "verify", "does it build", pre-commit gate |
| `task-release-package` | task | The guarded npm release flow | "release", "publish", "bump version" |
| `meta-skill-evolution` | meta | Decide update/create/discard for a learning; emit a diff | end-of-task evolution, new knowledge area |
| `meta-skill-consolidate` | meta | Periodic GC: dedup, contradiction, prune, token budget | weekly maintenance, "consolidate skills" |

## Dependency / composition graph

```
                         ┌──────────────────┐
   every task ──────────►│  project-router  │
                         └────────┬─────────┘
              selects & loads     │
   ┌───────────────┬──────────────┼───────────────┬───────────────┐
   ▼               ▼              ▼                ▼               ▼
knowledge-     knowledge-     knowledge-       knowledge-      (task skills)
architecture   code-style     data-pipeline    table-ui            │
   │               │              │                │               │
   └───────────────┴── injected before ───────────┴───────────────┘
                                                                    │
   task-add-table-column ── needs ──► knowledge-table-ui (+ code-style)
   task-add-filter-metric ─ needs ──► knowledge-table-ui (+ code-style)
   task-add-* ───────────── end with ─► task-build-and-validate
   any task ─────────────── ends with ─► <evolution> ──► meta-skill-evolution
   scheduled ──────────────────────────► meta-skill-consolidate
```

- **code-style** is loaded for essentially every edit (cross-cutting).
- Task skills compose: they `Use` the relevant knowledge skill, then end by invoking
  `task-build-and-validate` and their own `<evolution>` step.
- Meta-skills are invoked by the `<evolution>` step (evolution) and on a schedule (consolidate).

## Granularity rationale

- **Split knowledge by layer** (data vs UI) because tasks rarely touch both deeply, and a
  combined skill would blow the ~5k-token budget and lower signal.
- **Did NOT make a per-modal skill** — the three modals are small and covered by `knowledge-table-ui`.
- **Did NOT make a testing skill** — there is no test runner; validation is folded into
  `task-build-and-validate`.
- Two task skills (`add-table-column`, `add-filter-metric`) earn their place because they are
  the two most likely repeated mechanical changes and both have a precise, multi-file recipe.
