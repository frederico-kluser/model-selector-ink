---
name: task-release-package
description: The guarded npm release flow for model-selector-ink via scripts/release.sh. Use when asked to release, publish, or bump the version. Do not run npm publish by hand — the script enforces the required gates.
metadata:
  version: 0.1.0
  type: task
---

# Release the Package

Use the script; it encodes the required preconditions. Never `npm publish` manually.

## Commands

```bash
npm run release          # patch (default)
npm run release:patch    # 0.1.1 -> 0.1.2
npm run release:minor    # 0.1.1 -> 0.2.0
npm run release:major    # 0.1.1 -> 1.0.0
```

## What `scripts/release.sh` does (and requires)

1. **Refuses if the working tree is dirty** — commit or stash first.
2. **Refuses if not logged in to npm** (`npm whoami`) — run `npm login`.
3. Runs `npm run typecheck` then `npm run lint` (must pass).
4. Runs `npm run build`.
5. `npm version <bump> --no-git-tag-version` (bumps `package.json` only).
6. `npm pack --dry-run` to show package contents.
7. `npm publish --access public`.
8. Commits `package.json` as `chore: release <version>` and creates a git tag.

After it finishes it does **not** push. To publish the commit + tag:

```bash
git push && git push --tags
```

## Gotchas

- Published `files` are `dist` + `src/data/bundled-benchmarks.json` only (see package.json).
- The tag is created locally; remember the manual `git push --tags`.
- Don't bump the version by editing `package.json` directly — let the script do it so
  the commit/tag/publish stay in sync.

## <evolution>

On completion:
1. Persist learnings only if the release actually published.
2. Capture release surprises (auth, 2FA, pack contents, a missing file in `files`).
3. Append to `LEARNINGS.md` with date + source (user > inference).
4. Distill stable patterns into this skill and bump `version`.
5. Leave skill edits as a git diff for human review.
