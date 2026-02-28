# Contributing Guide

## Branch structure

| Branch | Purpose |
|---|---|
| `main` | Production — deployed to spilno.us. Never commit directly. |
| `development` | Default working branch. All feature PRs merge here. |
| `feature/*` | Your day-to-day work branches. |

---

## Day-to-day workflow

### 1. Start from a fresh development

Always base your work on the latest `development`:

```bash
git checkout development
git pull origin development
```

### 2. Create a feature branch

Name it after what you're building:

```bash
git checkout -b feature/add-search-filters
```

Good branch names: `feature/user-auth`, `fix/footer-layout`, `chore/update-deps`

### 3. Make your changes

Work in small, focused commits. Each commit should do one thing:

```bash
git add src/components/Footer/Footer.jsx src/i18n/en.json
git commit -m "feat: add privacy policy link to footer"
```

**Avoid `git add .`** — it's easy to accidentally commit `.env`, build artifacts, or unrelated files. Add files explicitly or by folder.

**Before staging, review what you're about to commit:**

```bash
git status
```

Watch out for files that should never be committed:

| File / pattern | Why |
| --- | --- |
| `.env` | Contains secrets — API keys, tokens |
| `dist/` | Build output — generated, not source |
| `node_modules/` | Dependencies — installed from package.json |
| `.DS_Store` | macOS metadata — irrelevant to the project |
| `*.log` | Log files — local noise |
| `github-ruleset-*.json` | One-time setup files — not part of the codebase |

All of the above are already covered by `.gitignore`, but `git status` will catch anything that slips through.

Commit message prefixes:
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance (deps, config)
- `refactor:` — code change without behavior change
- `docs:` — documentation only

### 4. Keep your branch up to date

If `development` got new commits while you were working, rebase to stay current:

```bash
git fetch origin
git rebase origin/development
```

Resolve any conflicts, then continue:

```bash
git rebase --continue
```

### 5. Push your branch

```bash
git push origin feature/add-search-filters
```

If you rebased after already pushing, you'll need to force push (safe on your own feature branch):

```bash
git push origin feature/add-search-filters --force-with-lease
```

### 6. Open a Pull Request

- **Base branch:** `development` (not `main`)
- **Title:** short and descriptive — same style as commit messages
- **Description:** what changed and why, plus any testing notes
- Request a review from a teammate

### 7. Get approval and merge

- Address all review comments
- Once approved, **squash and merge** to keep `development` history clean
- Delete the feature branch after merging

---

## Releasing to production

When `development` is stable and ready to ship:

1. Open a PR from `development` → `main`
2. Title it: `release: YYYY-MM-DD` or describe what's going out
3. Get approval, then merge
4. Vercel will auto-deploy `main` to production

---

## Rules

- Never commit directly to `development` or `main`
- Never commit `.env` files
- Don't merge your own PR without a review (unless explicitly agreed)
- Keep PRs small — easier to review, less risk
