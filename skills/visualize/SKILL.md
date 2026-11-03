---
name: visualize
description: "Draw the thing under discussion — the real shape, from the real code, anchored to file:line. Use when the user asks to visualize code, architecture, or a flow; use verify-responsive to check a running UI at a viewport width."
argument-hint: [what to visualize — optional]
---

The optional input is the text supplied with this skill invocation, through a slash command or a plain-language request. If none was supplied, follow the no-input behavior below.

Show me **the supplied input** visually — or, if that's empty, whatever is currently on the table in this conversation. Skip the preamble, keep the prose short, and pick the *smallest* view that makes the point.

**Draw what's there, not what you'd expect to be there.** A diagram launders a guess better than prose ever could: boxes and arrows read as *verified* even when nobody opened the file. Prose hedges out loud ("it probably calls…"); a flowchart just asserts. That makes an ungrounded visual the most expensive thing you can hand someone — they'll build on it for weeks.

So, before drawing:

- **Read the code you're about to draw.** The actual files, in this repo, this session — not the neighbors, not the pattern this framework "usually" follows, not a version of it you remember. If the diagram has five nodes, you opened five things.
- **Anchor every node.** Participants, boxes, tree entries, and call-stack frames name a real `path/to/file.ts:42`. A node you can't anchor is a node you didn't verify.
- **Tag what you didn't open — `ASSUMED`.** Sometimes a branch matters to the shape but you haven't read it (an upstream SDK, a path that's out of scope). Draw it, mark it `ASSUMED`, and say what would confirm it. Never quietly complete the picture; a diagram that's 90% verified and 10% invented, unmarked, is 100% untrustworthy.
- **Draw the current shape before the proposed one — and trace it with the real input.** If the point is a change, the "before" side comes from the code as it is today, not as you'd have written it. An anchor proves the node exists; it does not prove the arrow fires. Before drawing a current shape for input X, carry X itself through every lookup, guard, and branch on the path — the registry has that key, the config applies to it, the early return isn't taken. If the trace dead-ends, the dead end *is* the current shape: draw the failure, not the flow you expected. And a node whose annotation contradicts the diagram's own conclusion is a node you haven't reconciled — resolve it or prune it before shipping the picture.

### Forms

Use one, sometimes a few, rarely all. Match the form to the question being asked — **and to the surface it lands on.**

**Check the surface before you pick.** A terminal has no diagram renderer: a `mermaid` fence there prints its own source code, which is strictly worse than the plain-text form it replaced. So in a terminal (Claude Code, a shell, a plain log) every form below must be *text that is already the picture* — trees, indentation, box-drawing characters. Reach for Mermaid only when the output lands somewhere that actually renders it: a published artifact, a `.md` file read on GitHub, the desktop or web app. When in doubt, assume it won't render and draw it as text.

**Then check what this session can render with.** The forms below are the floor, not the ceiling. The harness you're running in may already have a better way to show a picture than anything this skill can hand-roll. Look at the tools and skills it actually gave you this session, including tools listed only by name until you load them, not the ones harnesses usually ship. You're looking for two things. First, anything that renders: a page or artifact publisher (an `Artifact` tool, a board's `show_page`), a document tool with diagram blocks, or a whiteboard or design connector. Second, any guidance on drawing well there: a diagramming or charting skill (`artifact-diagramming`, `dataviz`), or the rendering notes in a tool's own description. What you find feeds the pick below; it doesn't make it. When the question needs more than text can carry (a dense flow, a state comparison, a chart, a UI), a renderer the harness provides beats a hand-rolled file, because it shows the picture where this harness shows things to the user.

- **The question picks the form; the renderer only draws it.** A call tree that answers the question is still a call tree, even when an artifact tool is one call away. Use a renderer only when the form you chose needs one.
- **If several renderers qualify, use the one that reaches the user where they're looking**, and prefer one the harness's own instructions name for showing things.
- **Load the drawing guidance for that renderer, if there is any, and follow its mechanics**: format, theming, size limits. Guidance written for one page tool may still cover another HTML page, so check what it says it applies to. This skill decides *what* goes in the picture; that guidance decides *how* it renders there.
- **The grounding rules travel with the picture.** The `file:line` anchors and `ASSUMED` tags go on the rendered nodes, not only in the chat reply. A polished render looks even more verified than a text tree, so it needs the tags more.
- **Uploading is publishing.** A renderer that hosts the page or sends it to a service takes the code you drew off the machine. Follow that tool's own rules on when it may be used and when it may publish. If they say nothing and the repo is private, ask first.
- **Running as a subagent, hand the picture back.** Your reply goes to the agent that spawned you, and a user-facing renderer may replace what that agent is showing. Return the text form or a file path, unless that agent asked you to render it.

If nothing in the session renders, or you can't tell, the forms below are complete on their own.

- **Logic or an algorithm** — pseudocode:

  ```text
  on(save)
    if content is unchanged
      return cached result
    write new content
    return fresh result
  ```

- **Runtime control flow** — a call tree:

  ```text
  submitForm            app/form.tsx:88
    createSession       lib/session.ts:12
      persistPrompt     lib/session.ts:31
      launchAgent       lib/agent.ts:104
    navigateToSession   app/form.tsx:96
  ```

- **UI structure** — a component tree, with the state and module boundaries that matter:

  ```tsx
  <SessionPage>                    apps/example/src/routes/session.tsx
    useSessionEvents()             hooks/use-session-events.ts:9
    <SessionToolbar>
      <RunSkillButton>             packages/ui/src/run-skill-button.tsx
  ```

- **File responsibility, or a broad refactor** — a shallow file tree:

  ```text
  src/
  ├── commands/       # parses user actions
  ├── sessions/       # owns session state
  └── transport/      # sends API requests
  ```

- **Component interaction, or data flow between processes** — a text sequence, drawn with box-drawing characters. This is the terminal-safe form:

  ```text
  form.tsx:88              daemon.ts:210
       │                         │
       │── send expanded prompt ▶│
       │                         │── spawn agent   agent.ts:41
       │◀──── stream result ─────│
  ```

  Same shape as Mermaid, no renderer required. **Only** if the output lands on a surface that renders diagrams (a published artifact, a `.md` on GitHub) is the `mermaid` fence the better call:

  ```mermaid
  sequenceDiagram
      participant UI as form.tsx:88
      participant D as daemon.ts:210
      UI->>D: send expanded prompt
      D-->>UI: stream result
  ```

- **What changes**, when the surrounding shape already exists — a `diff`, shaped like whatever the topic is (component tree, file layout, call stack, control flow):

  ```diff
   src/
   ├── commands/
  +│   └── visualize.ts     # expands the slash command
   ├── sessions/
  -└── transport.ts
  +└── transport/
  +    ├── client.ts
  +    └── stream.ts
  ```

- **The whole block**, when most of it is new, when omitted context would hide ownership or order, or when I need a copyable target shape:

  ```ts
  function expandCommand(command: string): string {
    return `use the ${command.slice(1)} skill`;
  }
  ```

- **One focused HTML file** — for a visual UI, a layout, a state comparison, or a concept too dense for Mermaid: a diagram, an infographic, or a short slide deck, whichever fits. Match the product's real colors, type, spacing, and components; use real labels and real data. Show it through the renderer picked above, if there is one. Otherwise, write the file and open it locally:

  ```
  Bash(open path/to/visualize-{description}.html)
  ```

### Guidance

Place each visual next to the short text it supports. Keep only the calls, files, props, states, and boundaries needed to answer the question actually being asked — an exhaustive diagram is a refusal to decide what matters. Prune every node that doesn't earn its place, then say what you left out.

Close with the anchors: the `file:line` list behind the drawing, and any `ASSUMED` node with the one check that would settle it. If the picture went to a renderer, the reply still says where it landed (a link, a path, or the panel it's on), along with the short text and the anchors, so a reader who never opens it still gets the answer.
