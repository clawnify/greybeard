#!/usr/bin/env node
'use strict';

// greybeard — cross-platform installer.
//
// Detects the AI coding agents on your machine / in this project and installs
// the Karpathy-inspired guidelines into each one's rule location. Claude Code's
// skills and commands come from the greybeard plugin, installed and kept current
// through Claude Code's own `claude plugin` CLI. Pure Node stdlib, zero runtime
// deps.
//
//   npx @clawnify/greybeard            # install for every detected agent
//   npx @clawnify/greybeard --all      # install for all agents, detected or not
//   npx @clawnify/greybeard --only claude --only cursor
//   npx @clawnify/greybeard --dry-run  # show what would change
//   npx @clawnify/greybeard --uninstall

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const PKG = path.resolve(__dirname, '..');
const HOME = os.homedir();
const CWD = process.cwd();

const MARK_START = '<!-- karpathy-skills:start -->';
const MARK_END = '<!-- karpathy-skills:end -->';
const BLOCK_RE = new RegExp(`\\n*${MARK_START}[\\s\\S]*?${MARK_END}\\n?`);
// Verbatim heading that marks a file as already carrying the guidelines even
// without our fence markers — i.e. someone hand-merged them. Same string the
// activate hook keys on; keep in sync with hooks/greybeard-activate.js.
const HANDMERGE_MARK = '## 1. Think Before Coding';

// ── Provider matrix ─────────────────────────────────────────────────────────
// Detection is two-tier, matching where each install lands:
//   machine-level agents (claude, opencode, openclaw) are detected by their
//   home dir and install global files — once per machine, agent-scoped;
//   project-level agents are detected ONLY by repo signals (the agent's
//   dedicated directory or its rule file already present) — having the agent
//   installed on the machine must not sprinkle rule files into every repo.
//   Use --all or --only <id> to adopt an agent in a repo it doesn't use yet.
// kind:   how to install —
//   claude   global ~/.claude: principles block + the greybeard plugin
//   openclaw global ~/.openclaw/workspace/skills: skills only
//   opencode global ~/.config/opencode/plugins: guidelines plugin
//   file     project: write the dedicated rule file verbatim (overwrite)
//   append   project: fence the principles into a shared file (idempotent)
const PROVIDERS = [
  { id: 'claude',   name: 'Claude Code',    detect: ['~/.claude'],            kind: 'claude' },
  { id: 'opencode', name: 'OpenCode',       detect: ['~/.config/opencode'],   kind: 'opencode' },
  { id: 'openclaw', name: 'OpenClaw',       detect: ['~/.openclaw'],          kind: 'openclaw' },
  { id: 'cursor',   name: 'Cursor',         detect: ['./.cursor'],            kind: 'file',   src: '.cursor/rules/karpathy-skills.mdc' },
  { id: 'windsurf', name: 'Windsurf',       detect: ['./.windsurf'],          kind: 'file',   src: '.windsurf/rules/karpathy-skills.md' },
  { id: 'cline',    name: 'Cline',          detect: ['./.clinerules'],        kind: 'file',   src: '.clinerules/karpathy-skills.md' },
  { id: 'copilot',  name: 'GitHub Copilot', detect: ['./.github/copilot-instructions.md'], kind: 'append', dest: '.github/copilot-instructions.md' },
  { id: 'codex',    name: 'Codex',          detect: ['./AGENTS.md'],          kind: 'append', dest: 'AGENTS.md' },
  { id: 'gemini',   name: 'Gemini CLI',     detect: ['./GEMINI.md'],          kind: 'append', dest: 'GEMINI.md' },
];

// ── Args ────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const o = { dryRun: false, force: false, all: false, list: false, uninstall: false, only: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--dry-run': o.dryRun = true; break;
      case '--force': o.force = true; break;
      case '--all': o.all = true; break;
      case '--list': o.list = true; break;
      case '--uninstall': case '-u': o.uninstall = true; break;
      case '-h': case '--help': o.help = true; break;
      case '--': break;
      case '--only': {
        const v = argv[++i];
        if (!v) die('--only requires an agent id (see --list)');
        o.only.push(v);
        break;
      }
      default: die(`unknown flag: ${a} (run with --help)`);
    }
  }
  const ids = new Set(PROVIDERS.map((p) => p.id));
  for (const id of o.only) if (!ids.has(id)) die(`unknown agent: ${id} (see --list)`);
  return o;
}

function die(msg) { process.stderr.write(`error: ${msg}\n`); process.exit(2); }
const expand = (p) => (p.startsWith('~') ? path.join(HOME, p.slice(1)) : path.resolve(CWD, p));
const C = process.stdout.isTTY && !process.env.NO_COLOR;
const dim = (s) => (C ? `\x1b[2m${s}\x1b[0m` : s);
const green = (s) => (C ? `\x1b[32m${s}\x1b[0m` : s);
const bold = (s) => (C ? `\x1b[1m${s}\x1b[0m` : s);
const yellow = (s) => (C ? `\x1b[33m${s}\x1b[0m` : s);

// ── FS helpers (dry-run aware) ──────────────────────────────────────────────
let DRY = false;
let FORCE = false;
const actions = [];
const warnings = [];
function writeFile(dest, content) {
  if (fs.existsSync(dest) && fs.readFileSync(dest, 'utf8') === content) return false;
  if (!DRY) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, content); }
  actions.push(`${DRY ? 'would write' : 'wrote'} ${rel(dest)}`);
  return true;
}
function fenceInto(dest, payload) {
  const block = `${MARK_START}\n${payload.trim()}\n${MARK_END}\n`;
  const cur = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
  // Strip any existing block, then re-append. Deterministic regardless of prior
  // state, so re-running is a true no-op and other content is preserved.
  const without = cur.replace(BLOCK_RE, '').trimEnd();
  // Duplication guard: if the guidelines are hand-merged into this file (verbatim
  // heading, no fence markers), appending our block would create a second copy.
  // Skip and warn unless --force. The heading only lives inside our own block in
  // a managed file, so stripping it above keeps normal re-runs from tripping this.
  if (!FORCE && without.includes(HANDMERGE_MARK)) {
    warnings.push(`${rel(dest)} already has the guidelines hand-merged (no ${MARK_START} markers) — skipped to avoid a duplicate. Remove the hand-merged copy so the installer can manage it, or re-run with --force to append anyway.`);
    return false;
  }
  const next = without ? `${without}\n\n${block}` : block;
  return writeFile(dest, next);
}
function removeFenceFrom(dest) {
  if (!fs.existsSync(dest)) return false;
  const cur = fs.readFileSync(dest, 'utf8');
  if (!BLOCK_RE.test(cur)) return false;
  const next = cur.replace(BLOCK_RE, '\n').trimStart();
  if (!DRY) { next.trim() ? fs.writeFileSync(dest, next) : fs.unlinkSync(dest); }
  actions.push(`${DRY ? 'would update' : 'updated'} ${rel(dest)}`);
  return true;
}
function copyDir(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else writeFile(d, fs.readFileSync(s, 'utf8'));
  }
}
function removePath(p) {
  if (!fs.existsSync(p)) return false;
  if (!DRY) fs.rmSync(p, { recursive: true, force: true });
  actions.push(`${DRY ? 'would remove' : 'removed'} ${rel(p)}`);
  return true;
}
function rel(p) { return p.startsWith(HOME) ? '~' + p.slice(HOME.length) : path.relative(CWD, p) || p; }

// The canonical principles payload for fenced installs = the generated AGENTS.md.
const PRINCIPLES = fs.readFileSync(path.join(PKG, 'AGENTS.md'), 'utf8');
// Skill directories shipped to every provider that reads skills. Add a new one here only.
const SKILLS = ['skillify', 'check-resolvable', 'verify-responsive', 'pressure-test', 'sidenote', 'visualize', 'wrap'];
// Command files earlier versions copied into ~/.claude/commands (plus 'scalable',
// the pre-rename name of pressure-test). The plugin ships these now; this list
// exists only to clear the copies off machines that still carry them. Nothing to
// add here for a new command — the plugin picks it up from skills/.
const LEGACY_COMMAND_COPIES = ['pressure-test', 'sidenote', 'visualize', 'wrap', 'scalable'];

// ── Per-provider install / uninstall ────────────────────────────────────────
// The OpenCode plugin serves both `opencode` (V1) and `opencode2` (V2 beta):
// both read global plugins from ~/.config/opencode/plugins/ and both expose
// the experimental.chat.system.transform hook the plugin uses.
function installOpencode(un) {
  const dest = path.join(HOME, '.config', 'opencode', 'plugins', 'greybeard.js');
  if (un) return removePath(dest);
  return writeFile(dest, fs.readFileSync(path.join(PKG, 'hooks', 'greybeard-opencode.js'), 'utf8'));
}

// Claude Code gets the guidelines as a fenced block in ~/.claude/CLAUDE.md, and
// everything else — skills and commands — from the greybeard plugin, through
// Claude Code's own plugin manager. Earlier versions copied those files into
// ~/.claude/skills and ~/.claude/commands as well; anyone who also had the
// plugin ended up with two copies of every command in the resolver, which drift
// the moment one channel updates. The copies are removed on every run, install
// or uninstall, so an existing machine de-duplicates itself.
function installClaude(dir, un) {
  for (const s of SKILLS) removePath(path.join(dir, 'skills', s));
  for (const c of LEGACY_COMMAND_COPIES) removePath(path.join(dir, 'commands', `${c}.md`));
  if (un) {
    removeFenceFrom(path.join(dir, 'CLAUDE.md'));
    return ensurePlugin(true);
  }
  fenceInto(path.join(dir, 'CLAUDE.md'), PRINCIPLES);
  return ensurePlugin(false);
}

// ── The Claude Code plugin channel ──────────────────────────────────────────
const PLUGIN_ID = 'greybeard@greybeard';
const MARKETPLACE_SRC = 'clawnify/greybeard'; // what `marketplace add` takes
const MARKETPLACE_NAME = 'greybeard';         // what it's called once added

const lastLine = (s) => (s || '').split('\n').filter(Boolean).pop() || 'no output';

function claudeCli(args) {
  const r = spawnSync('claude', args, { encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.error) return { missing: r.error.code === 'ENOENT' };
  return { ok: r.status === 0, out: `${r.stdout || ''}${r.stderr || ''}`.trim() };
}

// Installed version at user scope, or null. Read from --json rather than matched
// out of human output, so a wording change upstream can't silently break this.
function installedVersion(probe) {
  if (!probe.ok) return null;
  try {
    const hit = JSON.parse(probe.out).find((p) => p.id === PLUGIN_ID && p.scope === 'user');
    return hit ? hit.version : null;
  } catch (e) {
    return null;
  }
}

function ensurePlugin(un) {
  const probe = claudeCli(['plugin', 'list', '--json']);
  if (probe.missing) {
    warnings.push(un
      ? `claude CLI not on PATH — run \`claude plugin uninstall ${PLUGIN_ID}\` to remove the skills and commands.`
      : `claude CLI not on PATH — run \`claude plugin marketplace add ${MARKETPLACE_SRC}\` then \`claude plugin install ${PLUGIN_ID}\` to get the skills and commands.`);
    return;
  }
  const before = installedVersion(probe);
  if (un) {
    if (!before) return;
    if (DRY) { actions.push('would uninstall the greybeard plugin'); return; }
    const r = claudeCli(['plugin', 'uninstall', PLUGIN_ID, '-y', '--scope', 'user']);
    if (!r.ok) return warnings.push(`claude plugin uninstall ${PLUGIN_ID} failed: ${lastLine(r.out)}`);
    actions.push('uninstalled the greybeard plugin');
    return;
  }
  if (DRY) { actions.push(`would ${before ? 'update' : 'install'} the greybeard plugin`); return; }
  const steps = before
    ? [['plugin', 'marketplace', 'update', MARKETPLACE_NAME], ['plugin', 'update', PLUGIN_ID, '-y', '--scope', 'user']]
    : [['plugin', 'marketplace', 'add', MARKETPLACE_SRC], ['plugin', 'install', PLUGIN_ID, '-y', '--scope', 'user']];
  for (const args of steps) {
    const r = claudeCli(args);
    if (!r.ok) return warnings.push(`claude ${args.join(' ')} failed: ${lastLine(r.out)}`);
  }
  // Report only a real change, so a re-run stays a true no-op in the summary.
  const after = installedVersion(claudeCli(['plugin', 'list', '--json']));
  if (after && after !== before) {
    actions.push(`${before ? 'updated' : 'installed'} the greybeard plugin \u2192 ${after} (restart Claude Code to apply)`);
  }
}


function applyProvider(p, un) {
  if (p.kind === 'claude') return installClaude(expand('~/.claude'), un);
  if (p.kind === 'opencode') return installOpencode(un);
  if (p.kind === 'openclaw') {
    const base = expand('~/.openclaw/workspace/skills');
    if (un) { for (const s of SKILLS) removePath(path.join(base, s)); return; }
    for (const s of SKILLS) copyDir(path.join(PKG, 'skills', s), path.join(base, s));
    return;
  }
  if (p.kind === 'file') {
    const dest = expand('./' + p.src);
    return un ? removePath(dest) : writeFile(dest, fs.readFileSync(path.join(PKG, p.src), 'utf8'));
  }
  if (p.kind === 'append') {
    const dest = expand('./' + p.dest);
    return un ? removeFenceFrom(dest) : fenceInto(dest, PRINCIPLES);
  }
}

const detected = (p) => p.detect.some((d) => fs.existsSync(expand(d)));

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help) return printHelp();
  DRY = o.dryRun;
  FORCE = o.force;

  if (o.list) {
    console.log(bold('Supported agents:'));
    for (const p of PROVIDERS) console.log(`  ${p.id.padEnd(10)} ${p.name}  ${detected(p) ? green('detected') : dim('not detected')}`);
    return;
  }

  let chosen = PROVIDERS;
  if (o.only.length) chosen = PROVIDERS.filter((p) => o.only.includes(p.id));
  // Bare --uninstall sweeps every provider: detection is repo-scoped for
  // project agents, so it can no longer see files a previous (home-detected)
  // install may have left in this repo.
  else if (o.uninstall) chosen = PROVIDERS;
  else if (!o.all) chosen = PROVIDERS.filter(detected);

  if (!chosen.length) {
    console.log('No supported agents detected. Use --all to install for every agent, or --only <id>.');
    console.log(dim('Run --list to see supported agents.'));
    return;
  }

  console.log(bold(`${o.uninstall ? 'Uninstalling' : 'Installing'} for: ${chosen.map((p) => p.name).join(', ')}`));
  for (const p of chosen) applyProvider(p, o.uninstall);

  for (const w of warnings) console.log(yellow('  ! ') + w);

  if (!actions.length) {
    if (!warnings.length) console.log(green('Already up to date — nothing to change.'));
    return;
  }
  for (const a of actions) console.log('  ' + a);
  console.log(o.dryRun ? dim('\nDry run — no files written.') : green(`\nDone (${actions.length} change${actions.length > 1 ? 's' : ''}).`));
}

function printHelp() {
  console.log(`greybeard installer

Usage:
  npx @clawnify/greybeard [flags]

Flags:
  --all          install for every supported agent, detected or not
  --only <id>    install only for the given agent (repeatable)
  --uninstall    remove what this installer added (all agents unless --only)
  --force        append the guidelines even if a hand-merged copy is detected
  --dry-run      show what would change without writing
  --list         list supported agents and detection status
  --help         this message

With no flags, installs per what it finds at two tiers: agents installed on the
system (Claude Code, OpenCode, OpenClaw) get their global files once; agents
actually used in this repo (their rule file or directory exists here) get the
per-repo files. Use --all / --only to adopt an agent in a repo it doesn't use
yet. Shared files (CLAUDE.md, AGENTS.md, GEMINI.md, copilot-instructions.md)
are edited in place between markers, so re-running is safe and your other
content is preserved.`);
}

main();
