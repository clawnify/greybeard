---
name: wrap
description: "Rule on whether this session can end here — finish the loop now, or make the work durable enough that another agent can pick it up. Use when the user asks to wrap up, hand off, or decide whether this session or worktree can be closed."
argument-hint: [what to wrap — optional]
---

The optional input is the text supplied with this skill invocation, through a slash command or a plain-language request. If none was supplied, follow the no-input behavior below.

Answer one question about **the supplied input** — or, if that's empty, about this whole session: **can I close this and delete the worktree?**

There are two rulings, and you owe me exactly one of them: **finish it now**, or **wrap it** — turn what's here into something durable and tell me it's safe to delete. "Mostly done, maybe keep it around" is not a ruling — it is the third outcome, the one you get by declining to choose, and it is the most expensive of the three: a worktree nobody will reopen and nobody dares delete.

**The test is not "is this important" — it's "what dies when the worktree dies, and can I afford to lose it?"** A worktree is a checkout. It is cheap to recreate and carries nothing by itself. Everything load-bearing either lives somewhere outside it or is about to be deleted.

## First: is there a hard stop?

Four things override every other consideration. If any holds, the ruling is **finish now** — no artifact substitutes, and "I'll open an issue for it" is how it ships broken.

- **The world outside the repo is mid-change.** A migration ran against a shared database, a flag got flipped, a deploy started, a resource or credential was created or rotated, a backfill is half-applied. A ticket in a backlog does not un-break a shared system. Finish it *or revert it* — both close the loop; walking away closes neither.
- **You left the trunk worse than you found it.** Pushed something broken, merged half a revert, left CI red on `main`. That cost lands on whoever starts next, who has none of your context.
- **What's left is minutes of work.** A handoff has a fixed re-entry cost — rebuilding the context, re-reading the files, re-deriving the options you already rejected — and it is rarely under half an hour. If that exceeds the work remaining, wrapping is the *more* expensive choice. "It needs another session" is usually a pre-AI estimate (§5): price the real thing before you park it.
- **You can't write the brief.** If you can't say in a paragraph what's left and how the next agent would know it's done, you don't understand the state well enough to hand it off — and they will understand it less. Work until it's describable, then wrap.

## Then: inventory what's actually here

Look, don't recall. Run the checks and report what they said:

- `git status --porcelain` — uncommitted edits *and* untracked files. Untracked is where the new file you never `git add`ed is hiding.
- `git log --oneline @{upstream}..HEAD` — commits that exist only on this machine. `fatal: no upstream configured for branch` is not a failure, it's the answer: the branch has never been pushed, so **all** of it is local — `git log --oneline --not --remotes` lists it.
- `git stash list` — the stack is shared across worktrees; an entry pushed from here outlives the worktree but loses the only person who knew what it was.
- Scratch files, notes, or outputs you wrote outside the repo.
- Anything still running that this session started.

Then the item that never shows up in any of those, and is the reason most handoffs are useless: **the context.** What you tried that didn't work, why the obvious approach is wrong, the reproduction that took twenty minutes to find, the file you ruled out. The diff survives; that dies with the session. It is the most expensive thing in the worktree and the only one with no automatic record.

## The ladder — pick the cheapest form that actually carries it

One artifact, not three. Match the form to what has to survive:

| What's here | Where it goes |
|---|---|
| Nothing — merged, clean, no unpushed commits | Nowhere. Say so and close. |
| A lead or a hunch. No code, no decision | A `/sidenote` entry — it already lives in git's common dir, outside every worktree. |
| A decision, a design, knowledge the next change needs | A doc in the repo, committed **and pushed**. Memory is an index, not an archive (§7). |
| A defined next task, nothing written yet | A **GitHub issue**: title + the brief below. |
| Code exists and is incomplete | Commit it on the branch, **push it**, open a **draft PR** whose body is the brief. |

Two notes on that last pair. A pull request needs at least one commit — there is no PR with an empty diff, so "a PR with just a description" is either an *issue*, or a PR whose diff **is** the brief committed as a doc. And once the branch is pushed, the branch is the artifact: deleting the worktree costs you nothing. Never delete a worktree whose branch is unpushed and unmerged — that is the one deletion that actually loses work.

## The brief — the part the diff can't carry

Whichever form you picked, the body is the same five lines, written for someone who was not here:

```
Goal      — what this is for, in one line.
Done      — what works now, and the check you actually ran to know it.
Left      — the exact next step. Not "continue the refactor".
Rejected  — approaches that don't work, and why. This is the part that dies with the context.
Verify    — the command or check that says it's finished.
```

Anchor it: the `file:line` where the next agent starts reading. And keep it honest — if you never ran the test, "tests not run" goes in the brief. A caveat about your own work is an unmet success criterion (§4), not a footnote to bury; the next agent will trust this document instead of checking, exactly as you would.

## Execute, verify, then answer the question

1. **Show me the ruling and the artifact before you create it** — the form, the title, the body. Issues, PRs and pushes are outward-facing and awkward to take back; one confirmation, then go.
2. **Confirm it landed outside the worktree.** The push shows the branch on the remote; `gh issue create --title "…" --body-file …` and `gh pr create --draft --title "…" --body-file …` each print a URL — quote it. A commit that was never pushed is not a handoff, it is the same work in a smaller box (§4: it compiles is not it works).
3. **Don't run the deletion.** You are standing in the worktree; removing it from inside is how a session ends mid-sentence. Hand me the command — `git worktree remove <path>`, run from another checkout — and say plainly if it needs `-f`, because a dirty tree means step 2 didn't finish.
4. **Close with the verdict on its own line**, because it's the question I asked:
   - `Safe to close — <URL> carries it.`
   - `Not yet — <the one thing> has to close here first.`

**Where this sits next to `/sidenote`:** a sidenote parks a *thought* so the current task keeps its pace; `/wrap` rules on the *session*. An open sidenote never blocks a wrap — but if this branch was the only context that made one legible, fold it into the brief before the worktree goes.
