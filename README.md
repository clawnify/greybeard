# Karpathy-Inspired Coding-Agent Guidelines

> Built and maintained by [Clawnify](https://clawnify.com) — a managed platform that provisions AI agents with WhatsApp / Telegram / Email and browser capabilities for non-technical users.

A single `CLAUDE.md` file to improve AI coding-agent behavior, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls, plus three sections we added for the AI-assisted-coding era. Ships with two runnable [meta-skills](#skills-skillify-dry--mece-resolvers), the [`/scalable`](#the-scalable-command) decision command, and a [one-command installer](#install) that fans it all out to every AI coding agent you use.

## The Problems

From Andrej's post:

> "The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."

> "They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."

> "They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."

Plus one of our own: agents reach for shortcuts ("we don't have time", "we'll fix it later") on time budgets that were sized for unassisted humans, not for an AI session.

## The Solution

Seven principles in one file that directly address these issues:

| Principle | Addresses |
|-----------|-----------|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Simplicity First** | Overcomplication, bloated abstractions |
| **Surgical Changes** | Orthogonal edits, touching code you shouldn't |
| **Goal-Driven Execution** | Leverage through verifiable success criteria |
| **Recalibrate Time Estimates** | Quality downgrades justified by stale time budgets |
| **Skillify & Resolve** | Repeated work lost as one-offs; cluttered, duplicated skill libraries |
| **Ground in Reality** | Stale recalled APIs, assumed schemas, guessing how the code works |

## The Seven Principles in Detail

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

LLMs often pick an interpretation silently and run with it. This principle forces explicit reasoning:

- **State assumptions explicitly** — If uncertain, ask rather than guess
- **Present multiple interpretations** — Don't pick silently when ambiguity exists
- **Push back when warranted** — If a simpler approach exists, say so
- **Stop when confused** — Name what's unclear and ask for clarification

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

Combat the tendency toward overengineering:

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't requested
- No error handling for impossible scenarios
- If 200 lines could be 50, rewrite it

**Never simplify away:** validation at trust boundaries, error handling that prevents data loss, security, accessibility, a runnable check for non-trivial logic, or anything explicitly requested. "Minimum code" means fewer lines, not fewer safety guards.

**The test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting
- Don't refactor things that aren't broken
- Match existing style, even if you'd do it differently
- If you notice unrelated dead code, mention it — don't delete it

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused
- Don't remove pre-existing dead code unless asked

**The test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform imperative tasks into verifiable goals:

| Instead of... | Transform to... |
|--------------|-----------------|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let the LLM loop independently. Weak criteria ("make it work") require constant clarification.

### 5. Recalibrate Time Estimates

**"Weeks of work" in pre-AI terms is often 1–2 hours now. Don't cut corners on something you can actually finish this session.**

Watch for these self-justifications:

- "A proper version would take too long, so I'll [hack / stub / defer]"
- "We don't have time to [validate / secure / migrate], so [skip]"
- "For now let's just [shortcut]; we can do it right later"

Those estimates are anchored to an unassisted-human baseline. What used to be a two-week project for a senior engineer frequently fits in a single session with an AI agent. The "no time" argument is usually wrong, and "later" rarely arrives.

Within the scope the user actually asked for (see Simplicity First), pick the option that's best on:

- **Scalability** — does this hold at 100× the load / data / users?
- **Long term** — six months from now, is this a foundation or a wound?
- **Security** — would you ship this if your name were on the incident report?

Speed is rarely the right axis to optimize on. If the proper version genuinely would take days, say so explicitly and let the user decide — don't silently downgrade to the shortcut.

When a shortcut genuinely is the right call, don't leave it silent: mark it inline with its ceiling and upgrade trigger — `// shortcut: global lock; per-account locks if throughput matters`. A named ceiling can be found and revisited; an unmarked one silently rots into permanent debt.

The governing question behind this principle — and behind every decision an agent makes — is: **whatever is scalable, long term, and cannot be done in a more efficient way.**

### 6. Skillify & Resolve

**Turn repeated work into skills. Keep one DRY, MECE resolver.**

The compounding move from the YC conversation with Pete Koomen & Andrej Karpathy: a one-off you did well is wasted unless you capture it. When you finish something non-trivial worth repeating:

- **Skillify it** — write the procedure as a named, parameterized skill (inputs as parameters, not hardcoded values), not a transcript.
- **Register it in the resolver** — the index your agent reads (`AGENTS.md`, a skills list, a tool registry): `name` + one-line "use when" + a link to the entry point. A skill no one can find doesn't exist.

Then keep the library clean against two tests:

- **DRY** — one job, one skill. Ten skills that do the same thing is worse than one skill with a parameter.
- **MECE** — *mutually exclusive* (given a task, exactly one skill is the obvious choice) and *collectively exhaustive* (every skill is reachable from the index; no orphans, no gaps).

This is how a "shared organizational brain" forms: the resolver is only as valuable as it is clean, so prune and merge as it grows.

### 7. Ground in Reality, Don't Recall

**Training data is stale and lossy. Verify against the real source before you act.**

Your priors are a starting hypothesis, not the answer. The most expensive mistakes come from confidently building on a remembered API, an assumed schema, or how a system "usually" works.

- **Research outside your training data — and match the source to the question.** Look it up rather than recall it (read the docs, fetch the page, run `--help`); your cutoff has passed, assume details have moved.
  - For **facts** (an API, a version, a schema, current behavior): prefer primary sources — official docs, the actual source code, specs, release notes, vendor pages — over random blogs, forum answers, and SEO content. When sources conflict, trust the primary one.
  - For **design and infra decisions** (an architecture, a tradeoff): study prior art — how established services and competitors solved the same problem is real signal, and here engineering blogs, postmortems, talks, and case studies are legitimate and valuable. Weigh how others did it, then decide for *this* system.
- **Read this codebase, don't infer it.** Before editing, read the actual code, types, and tests the change touches, and trace the real flow end to end. How it works *here* beats how it works *in general*.
- **Map before you move.** For non-trivial work, get the overview first: where this lives, what calls it and what it calls, the data and infrastructure boundaries it crosses. A change that's locally correct but wrong about the architecture is a new bug.
- **When you can't verify, say so** — flag it as an assumption and state how you'd confirm, never launder a guess into a claim.

## Skills: Skillify, DRY & MECE Resolvers

The principle above ships as two runnable meta-skills in [`skills/`](./skills) — the actual artifacts, not just prose:

| Skill | What it does |
|-------|--------------|
| [`skillify`](./skills/skillify/SKILL.md) | Capture what you just did as a reusable, parameterized skill, then register it in the resolver. |
| [`check-resolvable`](./skills/check-resolvable/SKILL.md) | Audit the whole library so it stays DRY and MECE — no duplicates, no overlaps, no gaps. |

They're standard [Claude Code Agent Skills](https://code.claude.com/docs/en/skills) (portable to Cursor, Codex, OpenClaw). Install and usage: [`skills/README.md`](./skills/README.md).

## The `/scalable` command

[`commands/scalable.md`](./commands/scalable.md) is a Claude Code slash command that runs the §5 decision test on demand: pressure-test the approach on the table against **scalable / long-term / efficient** — *whatever is scalable, long term, and cannot be done in a more efficient way* — and get one decisive recommendation, with stale-time-budget shortcuts called out.

```bash
mkdir -p ~/.claude/commands
cp commands/scalable.md ~/.claude/commands/      # personal, all projects
# or: .claude/commands/  for one project
```

Then `/scalable` (tests the current direction) or `/scalable <a specific decision>`.

## Install

**One command — every agent on your machine:**

```bash
npx andrej-karpathy-skills
```

It detects the AI coding agents you actually use and installs the right files for each: the seven guidelines into the rule file each one reads (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/`, `.windsurf/rules/`, `.clinerules/`, `.github/copilot-instructions.md`), plus the `skillify` / `check-resolvable` skills and the `/scalable` command for Claude Code and OpenClaw. Shared files are edited between markers, so re-running is a safe no-op and your own content is preserved.

```bash
npx andrej-karpathy-skills --list        # show detected agents
npx andrej-karpathy-skills --all         # install for all agents, detected or not
npx andrej-karpathy-skills --only cursor # just one (repeatable)
npx andrej-karpathy-skills --dry-run     # preview without writing
npx andrej-karpathy-skills --uninstall   # remove what it added
```

Supported: **Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Codex, Gemini CLI, OpenClaw** — and any agent that reads `CLAUDE.md` / `AGENTS.md`.

**Claude Code plugin marketplace** (the skills + `/scalable`):

```
/plugin marketplace add clawnify/andrej-karpathy-skills
/plugin install andrej-karpathy-skills
```

**Manual** (just the guidelines, one file — no Node):

```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/clawnify/andrej-karpathy-skills/main/CLAUDE.md
# …or append to an existing CLAUDE.md / AGENTS.md:
curl https://raw.githubusercontent.com/clawnify/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

> The per-agent rule files are generated from `CLAUDE.md` (the single source) by `scripts/build-rules.js`. Contributors: edit `CLAUDE.md`, run `npm run build`, commit. CI (`npm run check-sync`) fails if a copy drifts.

## Key Insight

From Andrej:

> "LLMs are exceptionally good at looping until they meet specific goals... Don't tell it what to do, give it success criteria and watch it go."

The "Goal-Driven Execution" principle captures this: transform imperative instructions into declarative goals with verification loops. The "Recalibrate Time Estimates" principle is its counterpart on the *what* — if you have to choose between a quick fix and the right design, the AI age usually means you can afford the right design within the same session.

## How to Know It's Working

These guidelines are working if you see:

- **Fewer unnecessary changes in diffs** — only requested changes appear
- **Fewer rewrites due to overcomplication** — code is simple the first time
- **Fewer "we'll fix it later" shortcuts** — the right design fits in the session
- **Clarifying questions come before implementation** — not after mistakes
- **Clean, minimal PRs** — no drive-by refactoring or "improvements"

## Customization

These guidelines are designed to be merged with project-specific instructions. Add them to your existing `CLAUDE.md` or create a new one.

For project-specific rules, add sections like:

```markdown
## Project-Specific Guidelines

- Use TypeScript strict mode
- All API endpoints must have tests
- Follow the existing error handling patterns in `src/utils/errors.ts`
```

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (simple typo fixes, obvious one-liners), use judgment — not every change needs the full rigor.

The goal is reducing costly mistakes on non-trivial work, not slowing down simple tasks.

## Credits

Sections 1–4 adapted from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), inspired by [Andrej Karpathy's writing on LLM coding pitfalls](https://x.com/karpathy/status/2015883857489522876). Section 5 added by Clawnify. Section 6 and the `skillify` / `check-resolvable` skills added by Clawnify, derived from the YC conversation with Pete Koomen & Andrej Karpathy on building a "shared organizational brain." The §2 safety-guardrail and §5 shortcut-marker refinements were sharpened by studying [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), a benchmarked minimalism skill in the same spirit.

## License

MIT — see [LICENSE](./LICENSE).
