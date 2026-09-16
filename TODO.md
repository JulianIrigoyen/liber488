# Liber 488 — roadmap

Derived from the session of 16 Sep 2026. Ordered by what unblocks what.

## Blocking — do these first

- [ ] **Re-skin the oracle in Liber 488's palette.** `web/` is currently
      paper-and-cinnabar (`--paper #e9e7de` / `--cinnabar #b0331f`); the site is
      gold-on-black (`--ink #07060a` / `--gold #c9a44c` / `--vellum #e9e1cf`).
      Keep one rule from the current design: a single saturated colour marks
      changing lines and nothing else. Map cinnabar → `--blood #8d2233`.
- [ ] **Bring the API up locally.** Create the D1 database, paste the id into
      `wrangler.toml`, run `npm run db:init`, set `ANTHROPIC_API_KEY` and
      `JWT_SECRET`. Nothing else can be tested until this is done.
- [ ] **First real interpretation end to end.** The interpreter prompt has never
      run against the live model. Check specifically that the output is plain
      English — that is the rule most likely to be ignored in practice.
- [ ] **Measure the true cost per interpretation.** Estimated $0.04–0.08, never
      measured. Query `ai_usage` after a handful of readings. The free tier's
      3/day depends on this number being right.
- [ ] **Wire `web/` to the API.** Sign-in, then an "Interpret with AI" button
      under the reading that streams the SSE response. Keep the oracle fully
      usable while signed out.

## Platform decisions still open

- [ ] **Native app stack.** Expo/React Native (one codebase, the casting engine
      and corpus port directly since they are already JS, `expo-sensors` gives
      real shake) vs SwiftUI (better feel and haptics, iOS only, everything
      rewritten). Unanswered from this session.
- [ ] **Where the API is deployed.** Configured for Cloudflare Workers; not
      decided. Explicitly *not* the droplet.
- [ ] **Domain.** `liber488.com` is assumed in the magic-link sender address and
      nowhere else.
- [ ] **Mail provider for magic links.** Resend is stubbed in `sendMagicLink()`;
      swap if you prefer another. Dev mode returns the link in the response, so
      this is not blocking local work.
- [ ] **Payments** for the adept/magus tiers. Tiers exist in the schema and the
      rate limiter; nothing charges for them.
- [ ] **Migration plan for the current site.** The live static site needs to
      become a client of this API, or be replaced by the new web app.

## Oracles

- [ ] **Tarot.** Needs the same treatment as the I Ching: the querent's own
      gesture decides the shuffle and the cut, not a PRNG. Deck data, spread
      definitions (three-card, Celtic cross), reversals, and 78 original card
      texts — the corpus is the bulk of the work, as it was here.
- [ ] **Carta astral reader.** Different shape: needs birth date, exact time and
      place, plus an ephemeris. Decide between a library (Swiss Ephemeris via
      WASM) and an external API before designing anything.
- [ ] **News, AI-boosted.** Least defined. Decide what it actually is before
      building — a feed with commentary, or something the other oracles read
      from.
- [ ] **Generalise the interpreter.** `api/src/oracles/interpret.ts` is I Ching
      specific. The writing rules (plain language, place the querent, refuse to
      flatter, never predict) are shared across every oracle — lift those into a
      common base prompt before writing the second one, not after.

## Quality and polish

- [ ] **Tune the shake threshold.** `REQUIRED = 90` samples, about one second of
      movement. Never tested for feel by a real hand on a real device.
- [ ] **Accessibility pass on the shake control.** Keyboard hold works
      (Space/Enter, timing supplies entropy) but has not been tested with a
      screen reader, and there is no non-gesture fallback for someone who cannot
      perform a sustained hold.
- [ ] **Tests.** There are none. Priority order: `resolve()` against all 64
      patterns, the relating-hexagram transform, quota enforcement, and that
      `parseCast` rejects malformed input.
- [ ] **Abuse and rate limiting beyond quota.** No IP limiting on
      `/v1/auth/request`, so magic-link mail can be triggered in a loop.
- [x] ~~**Consolidate into a monorepo.**~~ Done 16 Sep — `api/`, `web/` and
      `experiments/` are one repo at `code/personal/liber488`, and
      `api/scripts/build-corpus.mjs` regenerates the typed corpus from the web
      data files, so it is no longer generated across a repo boundary.
- [ ] **Fix the typo in the live site's own I Ching page** if it is still there,
      and check the existing `iching.html` for what is worth keeping before the
      new module replaces it.

## Notes worth not losing

- The corpus (64 hexagrams, 384 line texts) is original interpretive writing,
  not a translation. Keep it that way; do not paste in a translator's wording.
- Casting must never move server-side. It is the whole argument of the product.
- Two bugs in this session were invisible until a real `npm install` +
  `tsc --noEmit`: a stale SDK pin (`^0.68.0` vs the actual `0.126.0`, which
  silently loses adaptive thinking) and Hono's `verify()` needing a third
  argument. Run the typecheck before believing anything compiles.
