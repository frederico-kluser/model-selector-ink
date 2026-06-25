---
name: project-router
description: Routes EVERY implementation task in the model-selector-ink codebase to the correct knowledge and task skills BEFORE any step. Use whenever the user asks for any change, fix, feature, analysis, or refactor here — even when they do not mention skills — so the agent loads project conventions and data flow instead of re-scanning the repo.
metadata:
  version: 0.1.0
  type: router
---

# Project Router

This is the entry point for all work in **model-selector-ink** (an Ink/React TUI
that merges OpenRouter + Artificial Analysis data into a model picker). Run this
protocol before editing anything, so you inherit project knowledge instead of
re-deriving it from a cold scan.

## Protocol (run BEFORE any work)

1. **Classify the task:** which layer(s) does it touch — `data/`, `hooks/`,
   `services/`, `components/`? What type — bug / feature / refactor / analysis?
2. **Select skills** from `catalog.md`:
   - Editing any `src/**` code → always load **knowledge-code-style**.
   - Data fetch / enrichment / cache / API / `data/` / `hooks/` / `services/` → **knowledge-data-pipeline**.
   - Table / columns / filters / modals / keybindings / `components/` → **knowledge-table-ui**.
   - "Where does X live" / cross-layer / onboarding → **knowledge-architecture**.
   - Matches a known recipe → the matching **task-*** skill (see below).
3. **Build the chain:** load knowledge skills first, then follow the task skill's
   procedure. Independent read-only investigation can fan out to subagents (isolated
   context); keep edits in the main session.
4. **Load knowledge before implementing.** Read the selected SKILL.md bodies (and
   only the `references/` you need) before the first edit.
5. **Validate.** Any code change ends by running **task-build-and-validate**
   (`npm run typecheck && npm run lint`; `npm run build` for shipped changes).
   There is no test runner in this repo — do not invent one.
6. **Evolve.** At task end, run the task skill's `<evolution>` step. If the work
   revealed a genuinely new knowledge area, invoke **meta-skill-evolution**.

## Task → skill quick map

- "add a column / surface a benchmark" → `task-add-table-column`
- "make metric X filterable / new `$metric`" → `task-add-filter-metric`
- "verify / does it build / pre-commit" → `task-build-and-validate`
- "release / publish / bump version" → `task-release-package`

## Rules

- If no skill covers the task, do the work using `knowledge-code-style` + the
  relevant layer skill, then invoke `meta-skill-evolution` to propose capturing it.
- On ambiguity between two skills, prefer the more specific layer skill.
- Never skip validation, and never skip the evolution step at completion.
- A new public symbol is only "done" once it is re-exported from `src/index.ts`.
