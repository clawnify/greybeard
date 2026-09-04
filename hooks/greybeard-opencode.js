// greybeard — OpenCode plugin (works with both `opencode` V1 and `opencode2` V2).
//
// Injects the three-pillars decision test (scalable / long term / efficient —
// the core of the /pressure-test command) into every session's system prompt
// via the `experimental.chat.system.transform` hook (same hook in the V1 and
// V2 plugin APIs), so installing the plugin is enough — no per-project
// `npx @clawnify/greybeard` needed. Skips injection when the full guidelines
// are already loaded another way:
//
//   - `npx @clawnify/greybeard` merged them into an AGENTS.md
//     (fenced with <!-- karpathy-skills:start -->), or
//   - a project hand-merged them (detected by the verbatim
//     "## 1. Think Before Coding" heading).
//
// OpenCode discovers ambient AGENTS.md files from the current directory up to
// home (project root for projects outside home) plus the global
// ~/.config/opencode/AGENTS.md — that is the surface this check mirrors.
//
// Off switch: GREYBEARD=off (or remove the plugin file).
// Zero runtime deps — plain ESM JavaScript, runs under OpenCode's Bun runtime.
// Keep the PILLARS wording in sync with hooks/greybeard-activate.js (the last
// line differs: OpenCode has no /pressure-test command installed by default).

// Either string marks a file as already carrying the guidelines.
const MARKERS = ['<!-- karpathy-skills:start -->', '## 1. Think Before Coding'];

// The condensed behavioral core: the three pillars (from commands/
// pressure-test.md) plus the highest-frequency stances from CLAUDE.md
// (opinionated tradeoffs, symptom-vs-diagnosis, stale time budgets). Keep
// wording in sync with hooks/greybeard-activate.js — and keep this block
// small: it is paid as context in every session, so a rule earns a paragraph
// here only if it fires in most sessions, not most debugging sessions.
const PILLARS = `GREYBEARD ACTIVE — judge every decision against the three pillars: whatever is **scalable**, **long term**, and **cannot be done in a more efficient way**.

- **Scalable** — does it hold at 100× the load / data / users / surface area? Name the first thing that breaks.
- **Long term** — six months from now, is this a foundation or a wound? What does it cost to live with, or to undo?
- **Efficient** — is this the leanest *correct* way? The leanest option is often reusing a primitive that already exists (host platform, upstream dependency, or elsewhere in this repo) — confirm none exists before designing one. But measure efficiency over the feature's whole life, not the size of today's diff: don't optimize away the domain object the feature is about, and never trade away correctness, security, or data-safety.

If the pillars aren't concrete for the decision at hand, define them first: name what actually grows, the horizon that matters, and what efficiency is measured in. A project may add its own pillars (its CLAUDE.md / vision docs) — they extend the three, never replace them.

**Have an opinion.** Surface the tradeoffs, then say which one you'd pick and why — a neutral menu with no recommendation is abdication. Disagree out loud when the plan looks wrong: say it once, with the reason *and* an alternative, then respect the user's call on judgment matters (product, taste, priorities) — but never drop a correctness, security, or data-safety objection on request; escalate until it's understood. Challenge, don't obstruct.

**Reports are symptoms, not diagnoses.** Humans describe what they saw on the screen, not what happened — "an error in the chat" can be a rate limit on the route, an upstream outage, or a context gap in another agent. Follow the evidence to the failing layer before fixing where it was reported.

"No time to do it properly" is usually a stale pre-AI estimate; the proper version often fits this session. If it genuinely doesn't, say so and let the user decide — don't silently downgrade to the shortcut. When a shortcut is right, mark it inline with its ceiling and upgrade trigger.

For contested decisions, re-run the test against the pillars explicitly before ruling.`;

function hasGuidelines(file, fs, os, path) {
  try {
    const s = fs.readFileSync(file, 'utf8');
    return MARKERS.some((m) => s.includes(m));
  } catch (e) {
    return false;
  }
}

// Mirror where OpenCode loads ambient instructions from: the global
// ~/.config/opencode/AGENTS.md plus AGENTS.md from the working directory up
// to the worktree root. (OpenCode does not read CLAUDE.md.)
function alreadyLoaded(fs, os, path, directory, worktree) {
  const home = os.homedir();
  if (hasGuidelines(path.join(home, '.config', 'opencode', 'AGENTS.md'), fs, os, path)) return true;

  // Walk directory -> root, stopping at the worktree boundary (the project
  // root), matching OpenCode's ambient discovery.
  let dir = path.resolve(directory || worktree || process.cwd());
  const stop = path.resolve(worktree || dir);
  for (let i = 0; i < 30; i++) {
    if (hasGuidelines(path.join(dir, 'AGENTS.md'), fs, os, path)) return true;
    if (dir === stop) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

export const Greybeard = async ({ directory, worktree }) => {
  if ((process.env.GREYBEARD || '').trim().toLowerCase() === 'off') return {};

  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');

  if (alreadyLoaded(fs, os, path, directory, worktree)) return {};

  return {
    // Fires once per LLM call with the resolved system prompt; push our block
    // unless the guidelines are already in it (another source merged them).
    'experimental.chat.system.transform': async (input, output) => {
      if (!output.system.some((s) => s.includes('GREYBEARD ACTIVE'))) {
        output.system.push(PILLARS);
      }
    },
  };
};
