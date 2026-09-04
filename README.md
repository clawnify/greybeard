<p align="center">
  <img src="assets/greybeard.png" width="320" alt="The Greybeard — Principal Engineer">
</p>

<h1 align="center">Greybeard</h1>

<p align="center">
  <sub>Karpathy-inspired guardrails that make your AI coding agent behave like a principled senior engineer.</sub>
</p>

<p align="center">
  <em>Make your agent code like the senior who's been paged at 3am for every shortcut you're about to take.</em><br>
  <strong>"Did you check, or did you guess?"</strong><br>
  <sub>The reviewer who'd rather tell you the unwelcome thing than nod along to a plan that pages you at 3am.</sub>
</p>

<p align="center">
  <code>npx @clawnify/greybeard</code>
</p>

> Built and maintained by [Clawnify](https://clawnify.com) — a managed platform that provisions AI agents with WhatsApp / Telegram / Email and browser capabilities for non-technical users.

A single `CLAUDE.md` file to improve AI coding-agent behavior, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls, plus three sections we added for the AI-assisted-coding era. Ships with three runnable [skills](#skills-skillify-dry--mece-resolvers), its three commands — [`/pressure-test`](#the-pressure-test-command), the decision test, [`/sidenote`](#the-sidenote-command), park-a-thought, and [`/visualize`](#the-visualize-command), draw-the-real-shape — and a [one-command installer](#install) that fans it all out to every AI coding agent you use.

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
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs, fence-sitting instead of a recommendation, features welded to the one flow in the prompt |
| **Simplicity First** | Overcomplication, bloated abstractions |
| **Surgical Changes** | Orthogonal edits, touching code you shouldn't |
| **Goal-Driven Execution** | Leverage through verifiable success criteria |
| **Recalibrate Time Estimates** | Quality downgrades justified by stale time budgets |
| **Skillify & Resolve** | Repeated work lost as one-offs; cluttered, duplicated skill libraries |
| **Ground in Reality** | Stale recalled APIs, assumed schemas, guessing how the code works, fixing the reported symptom instead of the actual cause |

## The Seven Principles in Detail

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs — then say what you'd do.**

LLMs often pick an interpretation silently and run with it — or, just as often, dodge the risk by laying out a neutral menu and taking no position. This principle forces explicit reasoning *and* a stance:

- **State assumptions explicitly** — If uncertain, ask rather than guess
- **Present multiple interpretations** — Don't pick silently when ambiguity exists
- **Have a recommendation** — Once the options are on the table, say which one you'd pick and why; a menu with no opinion is abdication dressed up as balance
- **Disagree out loud** — Say the unwelcome thing once, with the reason *and* the alternative, then respect the user's call on judgment matters — but never drop a correctness, security, or data-safety objection to seem agreeable. Challenge, don't obstruct
- **Meet challenges with evidence, not concession** — Pushback is a claim to test, not a correction to accept: run the check the challenge implies, *then* rule — "you're right" before the check is a verdict without evidence. Concede what the evidence concedes, hold what it holds; instant agreement is fence-sitting's twin
- **But first, check it's a challenge at all** — Humans skim: a follow-up is often a question your last message already answered. Restate the relevant piece briefly and confirm it answers them — don't re-derive the ruling or spend new checks on ground already grounded; escalate only when the message carries something new
- **Map the usage surface** — A feature is more than the flow in the prompt: the same capability is set up inline mid-flow *and* opened on its own later to change or disable it. Enumerate the distinct usages and give each a place in the design, build only what was asked, and name the usages you're leaving out
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

- **The report is a symptom, not a diagnosis.** Humans describe what they saw on the screen, not what happened — "an error in the chat" can be a rate limit on the route, an upstream outage, or a context gap in another agent. Follow the evidence to the failing layer before fixing where it was reported.
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

And the **practice skills** those two produce — procedures captured with `skillify`, kept in the same index:

| Skill | What it does |
|-------|--------------|
| [`verify-responsive`](./skills/verify-responsive/SKILL.md) | Render the real page at real viewport widths in fixed-width iframes, then drive and assert it from the parent. |

They're standard [Claude Code Agent Skills](https://code.claude.com/docs/en/skills) (portable to Cursor, Codex, OpenClaw). Install and usage: [`skills/README.md`](./skills/README.md).

## The three commands

Greybeard's slash commands are **`/pressure-test`**, **`/sidenote`** and **`/visualize`** — one guards the *quality* of a decision, one guards your *focus* while you make it, and one makes sure what you're shown is the code that's actually there. The skills and always-on guidelines back them up, but these are the three you'll reach for by hand.

## The `/pressure-test` command

[`commands/pressure-test.md`](./commands/pressure-test.md) is a Claude Code slash command that runs the §5 decision test on demand: pressure-test the approach on the table against **scalable / long-term / efficient** — *whatever is scalable, long term, and cannot be done in a more efficient way* — and get one decisive recommendation, with stale-time-budget shortcuts called out. The main context runs the test and owns the ruling; subagents are scoped instruments, spawned only where a check benefits from being outside the session — challenging a belief the conversation already holds (a fresh context can't inherit its anchoring), or online research and docs verification that parallelize while the main agent keeps reasoning. Never the test wholesale: a main agent that only orchestrates stops being the main brain. Every ruling ships with a claims ledger: each load-bearing claim — one per plan item at minimum, every size-word counts — cited to the `file:line` actually opened, or tagged **ASSUMED**; no estimate may attach to an assumed claim.

```bash
mkdir -p ~/.claude/commands
cp commands/pressure-test.md ~/.claude/commands/      # personal, all projects
# or: .claude/commands/  for one project
```

Then `/pressure-test` (tests the current direction) or `/pressure-test <a specific decision>`.

## The `/sidenote` command

You're mid-way through a big task and a passing thought hits — *"the retry logic probably has the same bug", "remind me to check the pricing later"* — something you don't want to forget. Drop it in the chat as-is and the agent reads it as a new request: it rushes the current task to "get to" your note, and the big task pays for it.

[`commands/sidenote.md`](./commands/sidenote.md) reframes that thought as a **parked later-task, not a now-task**. The agent logs it verbatim to a parking file (durable across compaction, session end, and worktree removal) — with a one-line anchor (task in progress, the file it points at, branch) so it still makes sense when another session or agent reads it cold — gives a one-line ack, and resumes *exactly* where it was — same scope, same pace, no cutting corners to reach the note. A bare `/sidenote` flushes the open list back to you.

```bash
mkdir -p ~/.claude/commands
cp commands/sidenote.md ~/.claude/commands/      # personal, all projects
# or: .claude/commands/  for one project
```

Then `/sidenote <the thought>` to park one, or `/sidenote` to see what's parked. The notes land in `$(git rev-parse --path-format=absolute --git-common-dir)/info/sidenotes.md` — inside `.git/`, so they are personal per-repo scratch that no ignore rule has to protect and no `git add -A` can sweep into a PR, shared across all worktrees of the repo. Outside a git repo the fallback is `.claude/sidenotes.md` at the project root.

> **No slash commands?** For agents that read a rule file but have no `/` commands (Cursor, Codex, Copilot…), the same contract works as a plain-text convention: prefix the message with `SIDENOTE:` and the agent parks it instead of acting. Add one line to your rule file so it's honored reliably — see [`commands/sidenote.md`](./commands/sidenote.md) for the exact contract.

## The `/visualize` command

Ask an agent to explain how something works and you get paragraphs. Ask it to *draw* the thing and you get comprehension — a call tree, a component tree, a sequence diagram. But a diagram is also the easiest place in the world to launder a guess: prose hedges out loud (*"it probably calls…"*), while boxes and arrows just assert. An architecture diagram drawn from priors reads as **verified**, and people build on it for weeks.

[`commands/visualize.md`](./commands/visualize.md) is the §7 rule applied to pictures. It gives the agent a menu of visual forms — pseudocode, call tree, component tree, file tree, text sequence diagrams, shaped `diff`s, or one focused HTML file — and tells it to pick the *smallest* one that makes the point, **matched to the surface it lands on**: a terminal has no diagram renderer, so a `mermaid` fence there just prints its own source; the text forms are the picture already. Mermaid is reserved for surfaces that actually render it. Then the Greybeard part: **read the code before drawing it** (the actual files, this session — if the diagram has five nodes, you opened five things), **anchor every node** to a real `file:line`, **trace the current shape with the real input** (an anchor proves the node exists, not that the arrow fires — if the concrete key dead-ends in the registry, the dead end is the picture), and **tag anything unread as ASSUMED** with the check that would settle it. A diagram that's 90% verified and 10% quietly invented is 100% untrustworthy.

```bash
mkdir -p ~/.claude/commands
cp commands/visualize.md ~/.claude/commands/      # personal, all projects
# or: .claude/commands/  for one project
```

Then `/visualize <what to draw>`, or a bare `/visualize` to draw whatever's currently on the table.

## Install

**One command — every agent on your machine:**

```bash
npx @clawnify/greybeard
```

It detects the AI coding agents you actually use and installs the right files for each: the seven guidelines into the rule file each one reads (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/`, `.windsurf/rules/`, `.clinerules/`, `.github/copilot-instructions.md`), plus the `skillify` / `check-resolvable` / `verify-responsive` skills for Claude Code and OpenClaw, the `/pressure-test`, `/sidenote` and `/visualize` commands for Claude Code, and the always-on guidelines plugin for OpenCode. Shared files are edited between markers, so re-running is a safe no-op and your own content is preserved.

```bash
npx @clawnify/greybeard --list        # show detected agents
npx @clawnify/greybeard --all         # install for all agents, detected or not
npx @clawnify/greybeard --only cursor # just one (repeatable)
npx @clawnify/greybeard --dry-run     # preview without writing
npx @clawnify/greybeard --uninstall   # remove what it added
```

Supported: **Claude Code, OpenCode, Cursor, Windsurf, Cline, GitHub Copilot, Codex, Gemini CLI, OpenClaw** — and any agent that reads `CLAUDE.md` / `AGENTS.md`.

**Claude Code plugin marketplace** (the skills + the three commands + always-on guidelines):

```
/plugin marketplace add clawnify/greybeard
/plugin install greybeard
```

The plugin ships a `SessionStart` / `SubagentStart` hook that injects the three-pillars decision test (scalable / long term / efficient — the core of `/pressure-test`) into every session automatically — installing the plugin is enough, no per-project `npx` run needed. It's careful not to double up: if the full guidelines are already in your `~/.claude/CLAUDE.md` or a project's `CLAUDE.md` / `AGENTS.md` (via the npx installer or a hand-merge), the hook detects them and stays silent. To turn injection off without uninstalling, set `GREYBEARD=off` in your environment.

**OpenCode plugin** (always-on guidelines, same as the Claude Code plugin): the npx installer copies `hooks/greybeard-opencode.js` to `~/.config/opencode/plugins/greybeard.js`, where OpenCode loads it globally — every session gets the three-pillars decision test injected via the `experimental.chat.system.transform` hook. Works with both OpenCode V1 (`opencode`) and the V2 beta (`opencode2`), which share the plugin hook and the `~/.config/opencode/` location. Same guardrails as the Claude hook: if the guidelines are already in an ambient `AGENTS.md` (global or project), the plugin stays silent, and `GREYBEARD=off` turns injection off.

**Manual** (just the guidelines, one file — no Node):
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/clawnify/greybeard/main/CLAUDE.md
# …or append to an existing CLAUDE.md / AGENTS.md:
curl https://raw.githubusercontent.com/clawnify/greybeard/main/CLAUDE.md >> CLAUDE.md
```

**Updating** to the latest release:

- **npx installer** — re-run it. `@latest` beats npx's own cache so you actually get the newest version, and the marker-based edits make it a safe no-op if nothing changed:

  ```bash
  npx @clawnify/greybeard@latest
  ```

- **Claude Code plugin** — there's no `/plugin update`; refresh the marketplace, then reinstall (third-party marketplaces don't auto-update by default). You can flip on auto-update in `/plugin` → **Marketplaces**:

  ```
  /plugin marketplace update greybeard
  /plugin uninstall greybeard@greybeard
  /plugin install greybeard@greybeard
  /reload-plugins
  ```

- **Manual (curl)** — re-run the `-o` form; it overwrites `CLAUDE.md` with the latest (the `>>` append form would duplicate).

> The per-agent rule files are generated from `CLAUDE.md` (the single source) by `scripts/build-rules.js`. Contributors: edit `CLAUDE.md`, run `npm run build`, commit. CI (`npm run check-sync`) fails if a copy drifts.

> **Releasing** (maintainers): bump `version` in `package.json`, then cut a GitHub Release tagged `v<version>` (`gh release create v0.2.0 --generate-notes`). The [`Publish to npm`](.github/workflows/publish.yml) workflow publishes `@clawnify/greybeard` on release (with npm provenance), using the `NPM_TOKEN` repo secret.

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

Sections 1–4 adapted from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), inspired by [Andrej Karpathy's writing on LLM coding pitfalls](https://x.com/karpathy/status/2015883857489522876). Section 5 added by Clawnify. Section 6 and the `skillify` / `check-resolvable` skills added by Clawnify, derived from the YC conversation with Pete Koomen & Andrej Karpathy on building a "shared organizational brain." The §2 safety-guardrail and §5 shortcut-marker refinements were sharpened by studying [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), a benchmarked minimalism skill in the same spirit. The `/visualize` command's form menu is adapted from [dmmulroy's `show-me` skill](https://github.com/dmmulroy/.dotfiles/blob/main/home/.agents/skills/show-me/SKILL.md); the grounding rules on top of it are ours.

## License

MIT — see [LICENSE](./LICENSE).
