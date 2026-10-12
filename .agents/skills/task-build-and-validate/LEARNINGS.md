> **MEMÓRIA APOSENTADA (2026-09-27):** o conteúdo deste ficheiro foi migrado para a memória CoALA local do projeto (`.agents/model-selector-ink-coala-memory-agent-skill/`). Fica só como **fonte histórica** — não escrever mais aqui. Aprendizado novo: `python3 .agents/model-selector-ink-coala-memory-agent-skill/scripts/coala.py add --type episodic --content "…"`.

# LEARNINGS — task-build-and-validate

> Episodic memory. Append `- [YYYY-MM-DD] (source: user|inference) <learning>`.
> Distilled into SKILL.md by the consolidation step once a pattern is stable.

- [2026-06-25] (source: inference) Seed entry — no task runs yet. eslint `max-lines`,
  `complexity`, `max-depth`, `max-lines-per-function` are `warn` not `error`; they do
  not fail validation but signal a refactor is due.
