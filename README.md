# andrej-karpathy-skills

Behavioral guidelines for AI coding agents — drop the contents of [`CLAUDE.md`](./CLAUDE.md) into your project's `CLAUDE.md`, `AGENTS.md`, or equivalent system prompt to reduce common LLM coding mistakes (over-engineering, scope creep, silent assumptions, "we'll fix it later" shortcuts).

## What's in it

Five short sections:

1. **Think Before Coding** — surface assumptions and tradeoffs, don't pick silently
2. **Simplicity First** — minimum code, no speculative abstractions
3. **Surgical Changes** — touch only what the request requires
4. **Goal-Driven Execution** — define verifiable success criteria, loop until met
5. **Recalibrate Time Estimates** — "weeks of work" in pre-AI terms is often 1–2 hours now; don't downgrade quality to save time you don't actually need

The bias is toward caution over speed. For trivial tasks, use judgment.

## Usage

Append to your project's instructions file:

```bash
curl https://raw.githubusercontent.com/clawnify/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

Or copy the sections you want.

## Credits

Sections 1–4 adapted from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), inspired by Andrej Karpathy's writing on working with LLMs. Section 5 added.

## License

MIT — see [LICENSE](./LICENSE).
