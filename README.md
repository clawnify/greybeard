# Karpathy-Inspired Coding-Agent Guidelines

> Built and maintained by [Clawnify](https://clawnify.com) — a managed platform that provisions AI agents with WhatsApp / Telegram / Email and browser capabilities for non-technical users.

A single `CLAUDE.md` file to improve AI coding-agent behavior, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls, plus two sections we added for the AI-assisted-coding era. Ships alongside two runnable [meta-skills](#skills-skillify-dry--mece-resolvers) for the compounding loop Karpathy describes.

## The Problems

From Andrej's post:

> "The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."

> "They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."

> "They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."

Plus one of our own: agents reach for shortcuts ("we don't have time", "we'll fix it later") on time budgets that were sized for unassisted humans, not for an AI session.

## The Solution

Six principles in one file that directly address these issues:

| Principle | Addresses |
|-----------|-----------|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Simplicity First** | Overcomplication, bloated abstractions |
| **Surgical Changes** | Orthogonal edits, touching code you shouldn't |
| **Goal-Driven Execution** | Leverage through verifiable success criteria |
| **Recalibrate Time Estimates** | Quality downgrades justified by stale time budgets |
| **Skillify & Resolve** | Repeated work lost as one-offs; cluttered, duplicated skill libraries |

## The Six Principles in Detail

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

## Skills: Skillify, DRY & MECE Resolvers

The principle above ships as two runnable meta-skills in [`skills/`](./skills) — the actual artifacts, not just prose:

| Skill | What it does |
|-------|--------------|
| [`skillify`](./skills/skillify/SKILL.md) | Capture what you just did as a reusable, parameterized skill, then register it in the resolver. |
| [`check-resolvable`](./skills/check-resolvable/SKILL.md) | Audit the whole library so it stays DRY and MECE — no duplicates, no overlaps, no gaps. |

They're standard [Claude Code Agent Skills](https://code.claude.com/docs/en/skills) (portable to Cursor, Codex, OpenClaw). Install and usage: [`skills/README.md`](./skills/README.md).

## Install

**Option A: New project**

```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/clawnify/andrej-karpathy-skills/main/CLAUDE.md
```

**Option B: Append to an existing `CLAUDE.md` / `AGENTS.md`**

```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/clawnify/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

Works as-is with Claude Code, Cursor, Codex, and any other agent that reads `CLAUDE.md` / `AGENTS.md` / equivalent.

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
