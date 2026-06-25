---
name: knowledge-table-ui
description: Injects how the model-selector-ink Ink TUI works — column definitions, the pipe-filter DSL, preset filters, modals, and keyboard shortcuts. Use when touching anything under components/, or any table/column/filter/sort/modal/keybinding change.
metadata:
  version: 0.1.0
  type: knowledge
---

# Table UI

Built with Ink 6 + React 19. `model-selector.tsx` wires data → `enhanced-model-table.tsx`,
which owns rendering, scrolling, and all input.

## Columns (`components/table-columns.ts`)

- `COLUMNS: ColumnDef[]` is the single source of truth. Each `ColumnDef` has:
  `key`, `label`, `description` (shown in column-selector modal), `width`, `align`,
  `group: 'base'|'benchmark'|'speed'`, `sortable`, `getValue(m)→number|null`,
  `format(m)→string`, optional `color(m)→string|undefined`.
- `group: 'base'` columns are always visible; `benchmark`/`speed` are toggleable
  (`METRIC_COLUMNS` = non-base; `DEFAULT_VISIBLE_METRICS` = all metric keys).
- Format helpers: `fb100` (0–100, 1 dp), `fb1` (0–1 → ×100, 1 dp), `fSpeed` (0 dp),
  `fLat` (seconds, 2 dp + 's'). Color helpers: `priceColor`, `benchColor(val,lo,hi)`, `speedColor`.
- `SortKey = COLUMNS[number]['key']`. Sorting uses `getValue`; null sorts last.

## Filter DSL (`components/filter-parser.ts`)

- Syntax: `$Metric>=value|$Other<=val|freetext`. `$` = metric filter (alias is
  case-insensitive); no `$` = free-text. Operators (matched longest-first):
  `>=`, `<=`, `==`, `>`, `<`.
- **Semantics gotcha:** the file header comment says pipe is "UNION (OR)", but
  `applyFilters` is **hybrid** — text rules OR together, metric rules AND together,
  and the two groups AND. Trust `applyFilters` + its JSDoc, not the header.
- `METRIC_ACCESSORS` maps each alias → accessor returning the value **in display
  scale** (knowledge metrics already ×100 via `scaled100`). `AVAILABLE_METRICS` is
  the alias list shown in the modal.
- Free-text matches across: name, provider, id, tokenizer, `aa.creatorSlug`.
- Preset filters live in `table-columns.ts`: `FILTER_MODE`, `FILTER_LABELS`,
  `FILTER_CYCLE` (`none → has-benchmarks → high-intel → best-value → fast`).

## Keyboard shortcuts (from `enhanced-model-table.tsx`)

- `↑/↓` move cursor, `PgUp/PgDn` page, `←/→` scroll columns horizontally.
- `Enter` select, `Esc` cancel (calls `onCancel`).
- `f` quick text filter (inline), `F`/`Shift+f` open Filter Builder modal.
- `s` open Sort Selector modal, `S`/`Shift+s` toggle asc/desc.
- Modals: `Esc` closes (returns state), `↑/↓` navigate; column modal `space`/Enter
  toggles, `a` all, `n` none; filter-builder `a` add, `d`/`x` delete.

## Modals

- `filter-builder-modal.tsx` — build/remove rules; serializes back via `serializeFilters`.
- `column-selector-modal.tsx` — toggle visible `METRIC_COLUMNS`.
- `sort-selector-modal.tsx` — pick a sortable column + direction.

## Sizing

`widthPercent`/`heightPercent` props: positive 1–100 = percent of terminal;
negative = full minus |value| columns/rows; undefined/100 = full.
