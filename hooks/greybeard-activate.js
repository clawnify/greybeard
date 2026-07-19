#!/usr/bin/env node
'use strict';

// greybeard — SessionStart / SubagentStart hook.
//
// Injects the three-pillars decision test (scalable / long term / efficient —
// the core of the /pressure-test command) as hidden context so installing the
// plugin is enough — no per-project `npx @clawnify/greybeard` needed.
// Skips injection when the full guidelines are already loaded another way:
//
//   - `npx @clawnify/greybeard` merged them into a CLAUDE.md / AGENTS.md
//     (fenced with <!-- karpathy-skills:start -->), or
//   - a project hand-merged them (detected by the verbatim
//     "## 1. Think Before Coding" heading).
//
// Off switch: GREYBEARD=off (or disable the plugin: `claude plugin disable`).
// Pure Node stdlib, zero runtime deps.

const fs = require('fs');
const os = require('os');
const path = require('path');

// Either string marks a file as already carrying the guidelines.
const MARKERS = ['<!-- karpathy-skills:start -->', '## 1. Think Before Coding'];

function hasGuidelines(file) {
  try {
    const s = fs.readFileSync(file, 'utf8');
    return MARKERS.some((m) => s.includes(m));
  } catch (e) {
    return false;
  }
}

// Mirror where Claude Code loads memory from: ~/.claude/CLAUDE.md plus
// CLAUDE.md / AGENTS.md in the cwd and its ancestors.
function alreadyLoaded(cwd) {
  if (hasGuidelines(path.join(os.homedir(), '.claude', 'CLAUDE.md'))) return true;
  let dir = path.resolve(cwd || process.cwd());
  for (let i = 0; i < 30; i++) {
    if (hasGuidelines(path.join(dir, 'CLAUDE.md')) || hasGuidelines(path.join(dir, 'AGENTS.md'))) {
      return true;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

// The three pillars, condensed from commands/pressure-test.md — the single
// question that governs every decision. Keep wording in sync with that file.
const PILLARS = `GREYBEARD ACTIVE — judge every decision against the three pillars: whatever is **scalable**, **long term**, and **cannot be done in a more efficient way**.

- **Scalable** — does it hold at 100× the load / data / users / surface area? Name the first thing that breaks.
- **Long term** — six months from now, is this a foundation or a wound? What does it cost to live with, or to undo?
- **Efficient** — is this the leanest *correct* way? The leanest option is often reusing a primitive that already exists (host platform, upstream dependency, or elsewhere in this repo) — confirm none exists before designing one. But measure efficiency over the feature's whole life, not the size of today's diff: don't optimize away the domain object the feature is about, and never trade away correctness, security, or data-safety.

If the pillars aren't concrete for the decision at hand, define them first: name what actually grows, the horizon that matters, and what efficiency is measured in. A project may add its own pillars (its CLAUDE.md / vision docs) — they extend the three, never replace them.

**Have an opinion.** Surface the tradeoffs, then say which one you'd pick and why — a neutral menu with no recommendation is abdication. Disagree out loud when the plan looks wrong: say it once, with the reason *and* an alternative, then respect the user's call on judgment matters (product, taste, priorities) — but never drop a correctness, security, or data-safety objection on request; escalate until it's understood. Challenge, don't obstruct.

"No time to do it properly" is usually a stale pre-AI estimate; the proper version often fits this session. If it genuinely doesn't, say so and let the user decide — don't silently downgrade to the shortcut. When a shortcut is right, mark it inline with its ceiling and upgrade trigger.

For contested decisions, run the /pressure-test command (greybeard:pressure-test) to pressure-test the approach.`;

function main() {
  if ((process.env.GREYBEARD || '').trim().toLowerCase() === 'off') return;

  // Hook payload arrives on stdin: { hook_event_name, cwd, ... }
  let payload = {};
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch (e) {
    // No/invalid stdin — fall back to process.cwd() below.
  }

  if (alreadyLoaded(payload.cwd)) return;

  const context = PILLARS;

  // Native Claude Code: SessionStart accepts raw stdout, but SubagentStart
  // needs the hookSpecificOutput JSON form or the context is dropped.
  if (payload.hook_event_name === 'SubagentStart') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SubagentStart',
        additionalContext: context,
      },
    }));
    return;
  }
  process.stdout.write(context);
}

main();
