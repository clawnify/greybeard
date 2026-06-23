---
description: Pressure-test the current approach against scalability, long-term, and efficiency, then recommend the best option.
argument-hint: [decision or approach to test — optional]
---

Run the decision test on **$ARGUMENTS** — or, if that's empty, on the approach currently on the table in this conversation.

The governing question for the choice: **whatever is scalable, long term, and cannot be done in a more efficient way.**

Judge it concretely — name specifics, not abstractions — on three axes:

- **Scalable** — does it hold at 100× the load / data / users / surface area? Name the first thing that breaks.
- **Long term** — six months from now, is this a foundation or a wound? What does it cost to live with, or to undo?
- **Efficient** — is this already the leanest *correct* way, or is there a genuinely more efficient one (fewer moving parts, less code, less to maintain)? "More efficient" never means removing a safety guard.

Then:

- **Be decisive.** Recommend ONE option. Don't survey alternatives you won't take.
- **Catch stale time-budget shortcuts.** "No time", "do it later", "quick hack for now" — in an AI session the proper version usually fits *this* session. If you catch yourself reaching for a shortcut, flag it and price the real version.
- **Never trade away** correctness, security, or data-safety for speed.
- If the approach passes all three, say so plainly and proceed — don't manufacture objections.
- If it fails, state the better approach concretely and exactly what changes to get there.
- If the proper version genuinely would take days, say so explicitly and let me decide — don't silently downgrade to the shortcut.
