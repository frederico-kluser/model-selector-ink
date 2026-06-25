---
name: task-add-table-column
description: Step-by-step procedure to add a new metric/benchmark column to the model-selector-ink table end to end. Use when asked to surface a new benchmark, add a column, or display a model field that exists in the data but is not yet shown.
metadata:
  version: 0.1.0
  type: task
---

# Add a Table Column

Load `knowledge-table-ui` and `knowledge-code-style` first. If the value comes
from a new API field, also load `knowledge-data-pipeline`.

## When to use

The data exists (or can be added to the pipeline) and the user wants it shown as a
column in the table, optionally sortable and color-coded.

## Procedure

1. **Confirm the value is reachable** on `EnrichedModel`. If not, add it first:
   schema field in `data/*-client.ts` → mapping in `toModelEntry`/`buildEnrichedModels`
   → type in `models.ts`/`enriched-model.ts`. (That sub-task is `knowledge-data-pipeline` work.)
2. **Add a `ColumnDef`** to `COLUMNS` in `components/table-columns.ts`. Match the
   existing object style on one line per field group:
   - Pick `group` (`base` always-visible; `benchmark`/`speed` toggleable).
   - `getValue` returns `number | null` (null when absent — drives sort-last).
   - `format` uses an existing helper (`fb100`/`fb1`/`fSpeed`/`fLat`) or a new small one.
   - Choose a `width` that fits the `label`; set `align: 'right'` for numbers.
   - Add `color` via `benchColor(val, lo, hi)` / `speedColor` / `priceColor` if useful.
   - Set `sortable: true` unless it is a label-only column.
3. **(Optional) make it filterable** → follow `task-add-filter-metric` to add an alias.
4. **No barrel change needed** — `COLUMNS` is already exported; the column shows up
   automatically and becomes toggleable via `METRIC_COLUMNS`/`DEFAULT_VISIBLE_METRICS`.
5. **Validate** with `task-build-and-validate` (`npm run typecheck && npm run lint`).
   Visually check with `npm run dev` (needs an AA key for benchmark columns).

## Gotchas

- Knowledge metrics from AA are 0–1; if displaying as a percent use `fb1` (×100).
  Index metrics (intel/code/math) are already 0–100 → use `fb100`.
- Keep `table-columns.ts` under the 500-line file warn limit; extract helpers if needed.

## <evolution>

On completion:
1. Only persist learnings if `npm run typecheck` and `npm run lint` passed.
2. Capture anything surprising: a new format/color helper you had to add, a width
   that needed tuning, a metric scale subtlety, a user correction. Skip the obvious.
3. Append to `LEARNINGS.md` with date + source (user correction > your inference).
4. If a stable pattern emerged, distill it into the Procedure above and bump `version`.
5. If a genuinely new knowledge area appeared, invoke `meta-skill-evolution`.
6. Leave the change as a git diff for human review — do not self-merge skill edits.
