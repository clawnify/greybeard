#!/usr/bin/env node
'use strict';

// andrej-karpathy-skills — cross-platform installer.
//
// Detects the AI coding agents on your machine / in this project and installs
// the Karpathy-inspired guidelines (+ Claude Code skills and the /scalable
// command) into each one's rule location. Pure Node stdlib, zero runtime deps.
//
//   npx andrej-karpathy-skills            # install for every detected agent
//   npx andrej-karpathy-skills --all      # install for all agents, detected or not
//   npx andrej-karpathy-skills --only claude --only cursor
//   npx andrej-karpathy-skills --dry-run  # show what would change
//   npx andrej-karpathy-skills --uninstall

const fs = require('fs');
const os = require('os');
const path = require('path');

const PKG = path.resolve(__dirname, '..');
const HOME = os.homedir();
const CWD = process.cwd();

const MARK_START = '<!-- karpathy-skills:start -->';
const MARK_END = '<!-- karpathy-skills:end -->';
const BLOCK_RE = new RegExp(`\\n*${MARK_START}[\\s\\S]*?${MARK_END}\\n?`);

// ── Provider matrix ─────────────────────────────────────────────────────────
// detect: paths that, if present, mean the agent is in use (~ = home, ./ = cwd).
// kind:   how to install —
//   claude   global ~/.claude: principles block + skills/ + commands/
//   openclaw global ~/.openclaw/workspace/skills: skills only
//   file     project: write the dedicated rule file verbatim (overwrite)
//   append   project: fence the principles into a shared file (idempotent)
const PROVIDERS = [
  { id: 'claude',   name: 'Claude Code',    detect: ['~/.claude'],            kind: 'claude' },
  { id: 'cursor',   name: 'Cursor',         detect: ['./.cursor'],            kind: 'file',   src: '.cursor/rules/karpathy-skills.mdc' },
  { id: 'windsurf', name: 'Windsurf',       detect: ['./.windsurf'],          kind: 'file',   src: '.windsurf/rules/karpathy-skills.md' },
  { id: 'cline',    name: 'Cline',          detect: ['./.clinerules'],        kind: 'file',   src: '.clinerules/karpathy-skills.md' },
  { id: 'copilot',  name: 'GitHub Copilot', detect: ['./.github'],            kind: 'append', dest: '.github/copilot-instructions.md' },
  { id: 'codex',    name: 'Codex',          detect: ['~/.codex', './AGENTS.md'], kind: 'append', dest: 'AGENTS.md' },
  { id: 'gemini',   name: 'Gemini CLI',     detect: ['~/.gemini'],            kind: 'append', dest: 'GEMINI.md' },
  { id: 'openclaw', name: 'OpenClaw',       detect: ['~/.openclaw'],          kind: 'openclaw' },
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

// ── FS helpers (dry-run aware) ──────────────────────────────────────────────
let DRY = false;
const actions = [];
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

// ── Per-provider install / uninstall ────────────────────────────────────────
function installClaude(dir, un) {
  if (un) {
    removeFenceFrom(path.join(dir, 'CLAUDE.md'));
    removePath(path.join(dir, 'skills', 'skillify'));
    removePath(path.join(dir, 'skills', 'check-resolvable'));
    removePath(path.join(dir, 'commands', 'scalable.md'));
    return;
  }
  fenceInto(path.join(dir, 'CLAUDE.md'), PRINCIPLES);
  copyDir(path.join(PKG, 'skills', 'skillify'), path.join(dir, 'skills', 'skillify'));
  copyDir(path.join(PKG, 'skills', 'check-resolvable'), path.join(dir, 'skills', 'check-resolvable'));
  writeFile(path.join(dir, 'commands', 'scalable.md'), fs.readFileSync(path.join(PKG, 'commands', 'scalable.md'), 'utf8'));
}

function applyProvider(p, un) {
  if (p.kind === 'claude') return installClaude(expand('~/.claude'), un);
  if (p.kind === 'openclaw') {
    const base = expand('~/.openclaw/workspace/skills');
    if (un) { removePath(path.join(base, 'skillify')); removePath(path.join(base, 'check-resolvable')); return; }
    copyDir(path.join(PKG, 'skills', 'skillify'), path.join(base, 'skillify'));
    copyDir(path.join(PKG, 'skills', 'check-resolvable'), path.join(base, 'check-resolvable'));
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

  if (o.list) {
    console.log(bold('Supported agents:'));
    for (const p of PROVIDERS) console.log(`  ${p.id.padEnd(10)} ${p.name}  ${detected(p) ? green('detected') : dim('not detected')}`);
    return;
  }

  let chosen = PROVIDERS;
  if (o.only.length) chosen = PROVIDERS.filter((p) => o.only.includes(p.id));
  else if (!o.all) chosen = PROVIDERS.filter(detected);

  if (!chosen.length) {
    console.log('No supported agents detected. Use --all to install for every agent, or --only <id>.');
    console.log(dim('Run --list to see supported agents.'));
    return;
  }

  console.log(bold(`${o.uninstall ? 'Uninstalling' : 'Installing'} for: ${chosen.map((p) => p.name).join(', ')}`));
  for (const p of chosen) applyProvider(p, o.uninstall);

  if (!actions.length) { console.log(green('Already up to date — nothing to change.')); return; }
  for (const a of actions) console.log('  ' + a);
  console.log(o.dryRun ? dim('\nDry run — no files written.') : green(`\nDone (${actions.length} change${actions.length > 1 ? 's' : ''}).`));
}

function printHelp() {
  console.log(`andrej-karpathy-skills installer

Usage:
  npx andrej-karpathy-skills [flags]

Flags:
  --all          install for every supported agent, detected or not
  --only <id>    install only for the given agent (repeatable)
  --uninstall    remove what this installer added
  --dry-run      show what would change without writing
  --list         list supported agents and detection status
  --help         this message

With no flags, installs for every agent detected on your machine / in this project.
Shared files (CLAUDE.md, AGENTS.md, GEMINI.md, copilot-instructions.md) are edited
in place between markers, so re-running is safe and your other content is preserved.`);
}

main();
