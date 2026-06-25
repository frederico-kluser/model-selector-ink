---
name: task-add-filter-metric
description: Step-by-step procedure to add a new filterable metric alias to the model-selector-ink pipe-filter DSL. Use when asked to make a metric filterable with $alias syntax, add a filter operator target, or expose a value to the filter builder.
metadata:
  version: 0.1.0
  type: task
---

# Add a Filter Metric

Load `knowledge-table-ui` and `knowledge-code-style` first.

## When to use

A value on `EnrichedModel` should be filterable via `$alias>=value` syntax and/or
appear in the filter builder modal.

## Procedure

1. **Add accessor(s) to `METRIC_ACCESSORS`** in `components/filter-parser.ts`. Key is
   the lowercase alias; value is `(m: EnrichedModel) => number | null`.
   - Add every alias users might type (e.g. both `mmlu` and `mmlupro`).
   - **Return display-scale values.** Index metrics (intel/code/math) pass through;
     raw 0–1 knowledge metrics must be wrapped in `scaled100(...)` so a user typing
     `$mmlu>=75` means 75%, consistent with the column display.
2. **Add the primary alias to `AVAILABLE_METRICS`** (the array shown in the modal) so
   it is discoverable.
3. **(Optional) add a preset** to `FILTER_CYCLE`/`FILTER_LABELS` in `table-columns.ts`
   if it deserves a one-key quick filter.
4. **Validate** with `task-build-and-validate`. Manually test parsing, e.g. confirm
   `parseFilterString('$alias>=40')` yields a `metric` rule (operators are matched
   longest-first: `>=`,`<=`,`==` before `>`,`<`).

## Gotchas

- `parseMetricSegment` returns `null` (silently drops the rule) if the alias is not in
  `METRIC_ACCESSORS` — so the accessor MUST exist or the filter is a no-op.
- Matching semantics: metric rules AND together; text rules OR. Don't assume pipe = OR
  for metrics despite the file header comment.
- A null accessor result means "exclude from this metric filter" (model fails it).

## <evolution>

On completion:
1. Only persist learnings if `npm run typecheck` and `npm run lint` passed.
2. Capture surprises: alias collisions, scale mistakes, an operator edge case, a user
   correction. Skip the obvious.
3. Append to `LEARNINGS.md` with date + source (user > inference).
4. If a stable pattern emerged, distill it into the Procedure and bump `version`.
5. If a new knowledge area appeared, invoke `meta-skill-evolution`.
6. Leave the change as a git diff for human review — do not self-merge.
