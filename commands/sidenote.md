---
description: Park a passing thought as a later-task without derailing the current one — logged, not acted on.
argument-hint: [thought to park — optional]
---

Park this thought — **$ARGUMENTS** — as a sidenote. A sidenote is a *later-task*, not a *now-task*. Your job is to record it and keep going, nothing more.

**The contract — hold it exactly:**

- **Do not act on it.** Don't investigate it, don't open the files it mentions, don't add it to your current plan, don't answer the question it poses. It is parked, not pending.
- **Do not let it touch the current task.** Its scope, plan, priorities, and *pace* stay exactly as they were. In particular: **do not speed up or cut corners to "get to" the note.** The whole point of parking it is that it costs the current work nothing.
- **Urgency doesn't override the contract.** If the note reads as urgent ("prod is down", "this is broken"), that's the wrong channel — a real emergency is a normal interruption, not a sidenote. Still just log it and resume; the human will escalate directly if they meant to.

**Persist it so it survives this session** (context gets compacted; memory doesn't count as "logged"):

1. Append one bullet to `.claude/sidenotes.md` at the project root — create the file (and `.claude/`) if missing.
2. Format: `- [<today's date, YYYY-MM-DD>] <the thought, captured verbatim>`. Don't paraphrase or "improve" it — capture what was said.

Then: **one-line acknowledgement** (e.g. `Parked in .claude/sidenotes.md — continuing.`) and **resume exactly where you left off**, as if the note had never arrived.

**If `$ARGUMENTS` is empty** (a bare `/sidenote`), there's nothing to park — treat it as a *flush*: read `.claude/sidenotes.md` and list the currently-open sidenotes back to me so I can decide what to pick up. Change nothing, act on nothing, then resume.
