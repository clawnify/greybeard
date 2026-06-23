# Skills: Skillify, DRY & MECE Resolvers

Two meta-skills that make a coding agent *compound* — turning repeated work into reusable skills, and keeping the skill library clean as it grows. Derived from the YC conversation with Pete Koomen & Andrej Karpathy on how AI-native organizations build a "shared organizational brain."

| Skill | What it does |
|-------|--------------|
| [`skillify`](./skillify/SKILL.md) | Capture what you just did as a reusable, parameterized skill, then register it in the resolver. |
| [`check-resolvable`](./check-resolvable/SKILL.md) | Audit the whole library so it stays **DRY** (no duplicates) and **MECE** (no overlaps, no gaps). |

## The decision test

Behind every choice these skills make — *should I skillify this? generalize how far? merge or keep separate?* — is one question:

> **"Whatever is scalable, long term, and cannot be done in a more efficient way."**

That's the lens for every decision, not just skill-authoring. Don't ask "what's fastest right now?" Ask whether the choice holds at 100× the skills, is a foundation six months from now, and isn't a near-duplicate of something that already exists. A skill saved badly (hardcoded, unfindable, redundant) is a future wound; a skill saved well compounds.

## The resolver

A **resolver** is the flat index your agent reads to discover what it can do — `AGENTS.md` / `CLAUDE.md` skills list, a tool registry, or the `skills/` directory itself. Claude Code's skill registry is a resolver; a tool registry is a resolver. The pattern is always the same: a list of capabilities, each with a one-line *"use when"* and a link to its entry point.

The library is only as valuable as the resolver is clean:

- **DRY** — one job, one skill. Ten skills that do the same thing is worse than one skill with a parameter.
- **MECE** — *mutually exclusive* (given a task, exactly one skill is the obvious choice) and *collectively exhaustive* (every skill is reachable from the index; no orphans, no gaps).

`skillify` keeps the resolver growing; `check-resolvable` keeps it clean. Run them as a loop: skillify on create → check-resolvable to dedupe.

## Install

These are standard [Claude Code Agent Skills](https://code.claude.com/docs/en/skills) — a directory with a `SKILL.md`. The `name` + `description` frontmatter is portable to any harness that reads skills (Cursor, Codex, OpenClaw).

**Personal (all your projects):**

```bash
mkdir -p ~/.claude/skills
cp -R skillify check-resolvable ~/.claude/skills/
```

**One project only:**

```bash
mkdir -p .claude/skills
cp -R skillify check-resolvable .claude/skills/
```

Then add a one-line entry for each to your project's resolver (`AGENTS.md` / `CLAUDE.md`) so the agent — and your teammates — can find them. After that, just say *"skillify this"* when you finish something worth keeping.
