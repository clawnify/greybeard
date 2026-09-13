# Skills: Skillify, DRY & MECE Resolvers

Two **meta-skills** that make a coding agent *compound* — turning repeated work into reusable skills, and keeping the skill library clean as it grows — plus the **practice skills** they produce. The meta-skills are derived from the YC conversation with Pete Koomen & Andrej Karpathy on how AI-native organizations build a "shared organizational brain"; the practice skills are what came out of running `skillify` on our own work.

| Skill | What it does |
|-------|--------------|
| [`skillify`](./skillify/SKILL.md) | Capture what you just did as a reusable, parameterized skill, then register it in the resolver. |
| [`check-resolvable`](./check-resolvable/SKILL.md) | Audit the whole library so it stays **DRY** (no duplicates) and **MECE** (no overlaps, no gaps). |

## Practice skills

Procedures captured with `skillify`. Each one exists because reasoning about the answer kept being wrong and rendering it was cheap.

| Skill | What it does |
|-------|--------------|
| [`verify-responsive`](./verify-responsive/SKILL.md) | Render the real page at real viewport widths in fixed-width iframes, then drive and assert it from the parent. |

## On-demand workflows

| Skill | Use when |
|-------|----------|
| [`pressure-test`](./pressure-test/SKILL.md) | Pressure-test a decision, or audit every approach proposed in the session when no target is supplied. |
| [`sidenote`](./sidenote/SKILL.md) | Park a thought without acting on it, or list open notes when no thought is supplied. |
| [`visualize`](./visualize/SKILL.md) | Draw the verified structure of code or a flow; no input means the current topic. |
| [`wrap`](./wrap/SKILL.md) | Decide whether a session can end and prepare a durable handoff; no input means the whole session. |

These are the canonical instruction sources. Claude Code exposes them as slash commands directly, so there are no duplicate command wrappers. Inputs come from the invoking message in any client; the substantive procedures and authorization boundaries are the same.

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

Use the plugin manager for [Claude Code or Codex](../README.md#install). Both discover all seven skills from this directory. Claude Code also exposes `/greybeard:<name>`; Codex offers `$greybeard:<name>` through its skill selector and can match plain-language requests. Restart the client after a plugin update and verify each capability appears once in a fresh session.

The standalone installer writes guidelines for Codex, manages the Claude Code plugin, and copies all seven skills for OpenClaw. Writing `AGENTS.md` alone does not install skills. See the [installation and update instructions](../README.md#install) for the distinction.

For a **manual, project-local Codex installation**, run this from the Greybeard checkout, replacing the destination with your project path:

```bash
mkdir -p /path/to/project/.agents/skills
cp -R skills/skillify skills/check-resolvable skills/verify-responsive \
  skills/pressure-test skills/sidenote skills/visualize skills/wrap \
  /path/to/project/.agents/skills/
```

Copy all seven sibling folders together so relative skill links keep working after installation. Other clients need their own documented skill directory. Use either a manual copy or the plugin for a given client, not both. In clients without automatic skill indexing, add one entry per skill to the project's resolver, pointing to its installed `SKILL.md`.

## Verify discovery after changing the package

Check a fresh install and an update from the previous revision using each client's plugin manager. Repeating the install must not add another entry. In Codex, query the app server's `skills/list` for a clean project and verify the seven enabled `greybeard:*` entries point into the installed plugin cache. In Claude Code, `claude plugin details greybeard@greybeard` must list seven skills once each; also check slash invocation with and without input. Inspect installed relative links, then run `check-resolvable` across the seven descriptions and procedures. Source frontmatter validation alone does not prove discovery.
