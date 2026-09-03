---
name: verify-responsive
description: Verify a responsive UI by rendering the real page at real viewport widths in fixed-width iframes, then driving and asserting it from the parent. Use when checking a mobile or tablet layout, a breakpoint, or small-screen-only behavior — especially when a window-resize tool won't give you a mobile viewport.
---

# Verify Responsive

"The CSS looks right" is not "it renders right at 390px." A media query only proves itself when something evaluates it at that width. This is §4 applied to UI — *define success criteria, loop until verified* — where the criterion is a rendered page at a real width, not a stylesheet that reads correctly.

The tool is one throwaway HTML file: fixed-width `<iframe>`s pointed at your running app. An iframe is a nested browsing context, so **its viewport is the iframe box** — width and height media queries, container queries, and `vw`/`vh` all resolve to the size you set. Two frames side by side puts both breakpoints in a single screenshot.

Reach for this when a browser-automation "resize window" call doesn't actually change the viewport the page sees. That failure is quiet and expensive: the screenshot comes back at the old width, the desktop branch renders, and you conclude the mobile layout is fine without ever having rendered it.

## Inputs

- `url` — the running page to check (e.g. `http://localhost:3000/pricing`)
- `widths` — viewports to render; default `390×844` (phone) and `1280×800` (desktop)
- `static-dir` — the directory the dev server serves **at the same origin** (`public/`, `static/`, `www/`)

## Procedure

1. **Start the app** and note its origin.

2. **Put the harness in the app's own `static-dir`** — not on a second server. Same-origin is the entire point: it is what makes step 4 possible. A harness on another port is cross-origin, `iframe.contentDocument` comes back `null`, and you are reduced to screenshots.

3. **Write `_viewports.html`** into that directory:

   ```html
   <!doctype html><meta charset="utf-8"><title>viewports</title>
   <style>
     body { margin:0; display:flex; gap:16px; background:#111; font:12px system-ui }
     figure { margin:0 } figcaption { color:#888; padding:4px }
     iframe { border:0; background:#fff }
   </style>
   <figure><figcaption>390 × 844</figcaption>
     <iframe id="m" src="/YOUR/PATH" width="390" height="844"></iframe></figure>
   <figure><figcaption>1280 × 800</figcaption>
     <iframe id="d" src="/YOUR/PATH" width="1280" height="800"></iframe></figure>
   ```

   Open `/_viewports.html` and screenshot it.

4. **Drive it and assert from the parent.** Same-origin, so the frame is fully scriptable — you can reach past what a screenshot shows:

   ```js
   const w = m.contentWindow, doc = m.contentDocument;
   w.innerWidth;                                 // 390
   w.matchMedia('(max-width: 640px)').matches;   // true → the mobile arm really is live
   doc.querySelector('[data-testid="menu"]').click();
   doc.querySelector('.drawer').className;       // read the result back
   w.localStorage.getItem('seen');               // and any state it wrote
   ```

   Assert the width from *inside* the frame before trusting a screenshot. "Looks narrow to me" is how you verify nothing.

5. **Delete the harness before committing.** Anything in the static dir ships. `rm _viewports.html`, then confirm with `git status` — don't leave it for review to catch.

## What this does not give you

The iframe narrows the **viewport**. It does not emulate a device. Measured inside a 390px frame on a laptop: `pointer: fine` and `hover: hover` are both still true, `navigator.maxTouchPoints` is `0`, and `devicePixelRatio` is the host's.

So a layout that branches on width is covered honestly. One that branches on `@media (hover: hover)`, sniffs the user agent, or swaps assets on DPR will render its **desktop** arm at 390px and mislead you with a screenshot that looks right. There is also no browser chrome, so `100dvh`-vs-`100vh` differences never show up. When the behavior under test depends on any of those, use real device emulation or a real device — this harness will lie to you.

## Related

- [`/visualize`](../../commands/visualize.md) draws the *structure* of the code. This renders the *running UI*. Use this one when the question is "what does it actually look like at this width."
