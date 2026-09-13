#!/usr/bin/env node
'use strict';

// Package-level regression for #43. Native client discovery is checked separately
// using the procedure in skills/README.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const skills = ['check-resolvable', 'pressure-test', 'sidenote', 'skillify', 'verify-responsive', 'visualize', 'wrap'];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'greybeard-package-'));

try {
  const [pkg] = JSON.parse(execFileSync('npm', [
    'pack', '--dry-run', '--json', '--ignore-scripts', '--cache', temp,
  ], { cwd: root, encoding: 'utf8' }));
  const files = new Set(pkg.files.map(file => file.path));
  const entries = skills.map(name => `skills/${name}/SKILL.md`);
  assert.deepEqual([...files].filter(file => /^skills\/[^/]+\/SKILL\.md$/.test(file)).sort(), entries);
  assert.equal([...files].some(file => file.startsWith('commands/')), false, 'Duplicate command entrypoints in package');
  const commands = path.join(root, 'commands');
  assert.ok(!fs.existsSync(commands) || fs.readdirSync(commands).length === 0, 'Plugin would still discover command entrypoints');

  for (const [index, entry] of entries.entries()) {
    const text = fs.readFileSync(path.join(root, entry), 'utf8');
    assert.equal(text.match(/^name: (.+)$/m)?.[1], skills[index], `${entry}: discovery name`);
    assert.match(text, /^description: .+/m, `${entry}: discovery description`);
    // Ignore code examples and external/anchor links. Sibling skill references
    // must survive distribution, without depending on the source checkout.
    const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
    for (const [, target] of prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^(?:[a-z]+:|#)/i.test(target)) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(entry), target.split('#')[0]));
      assert.ok(files.has(resolved), `${entry}: unpackaged reference ${target}`);
    }
  }
  console.log('Seven portable skill entrypoints; no duplicate commands; all skill references packaged.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
