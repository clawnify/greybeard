---
description: Pressure-test the current approach against scalability, long-term, and efficiency, then recommend the best option.
argument-hint: [decision or approach to test — optional]
---

Run the decision test on **$ARGUMENTS** — or, if that's empty, on the approach currently on the table in this conversation.

The governing question for the choice: **whatever is scalable, long term, and cannot be done in a more efficient way.**

**Ground it first — don't judge from priors.** Your training data is stale; verify before ruling.

- For this **infra/tech decision**, research how established services and competitors solved the same problem — engineering blogs, postmortems, talks, and case studies are fair game here. Prior art is signal.
- Verify any **fact** you lean on — an API, a limit, a price, current behavior — against a primary source (official docs, the actual source code), not a remembered version or a random blog.
- Read the actual code and architecture this touches before ruling — locally correct but architecturally wrong is still wrong.
- **Look down the stack, not just sideways.** Before designing any new state — config keys, DB columns, env vars, endpoints, files — search the framework / platform / library you build on (and the rest of this repo) for a native primitive that already models this concern. The leanest correct option is frequently one that already exists one layer down; reinventing what the host exposes is the most common efficiency miss. Verify it against the dependency's actual source, not its docs alone.

**Define the three pillars for *this* decision — if they're not already clear.** Before judging, make each concrete for the case at hand:

- what actually grows (what "scalable" means here — the load / data / users / surface that increases),
- the horizon that matters (a throwaway, or the load-bearing path you'll live with for months?),
- what efficiency is measured in (and what it would be traded against).

Pillars you can't name, you can't judge against — so name them first.

Then judge the approach against the **three pillars** — name specifics, not abstractions:

- **Scalable** — does it hold at 100× the load / data / users / surface area? Name the first thing that breaks.
- **Long term** — six months from now, is this a foundation or a wound? What does it cost to live with, or to undo?
- **Efficient** — is this the leanest *correct* way? The leanest option is often **reusing an existing primitive** (host platform, upstream dependency, or elsewhere in this repo) rather than any new construct you write — so confirm none exists before designing one. Then: fewer moving parts, less code, less to maintain. "More efficient" never means removing a safety guard.

**Plus any pillars this project adds.** The three above always stand; if the company/codebase has its own vision pillars (e.g. Portability, Privacy, Offline-first), find them in its `CLAUDE.md` / `AGENTS.md` / vision docs and judge against those too — they extend the three, never replace them.

Then:

- **Be decisive.** Recommend ONE option. Don't survey alternatives you won't take.
- **Catch stale time-budget shortcuts.** "No time", "do it later", "quick hack for now" — in an AI session the proper version usually fits *this* session. If you catch yourself reaching for a shortcut, flag it and price the real version.
- **Never trade away** correctness, security, or data-safety for speed.
- If the approach passes all three, say so plainly and proceed — don't manufacture objections.
- If it fails, state the better approach concretely and exactly what changes to get there.
- If the proper version genuinely would take days, say so explicitly and let me decide — don't silently downgrade to the shortcut.
