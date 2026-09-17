# Liber 488 — roadmap

Refreshed 2026-09-17 after the session in `docs/SESSION-2026-09-16.md`. Ordered by what
unblocks what.

## Done on 2026-09-16

- [x] **Oracle integrated into the real site**, in its own idiom (supersedes the earlier
      "re-skin" item: there is nothing to re-skin, `web/` *is* the site).
- [x] 384 original changing-line texts merged into the site's `hexagrams.js`; corpora
      cross-validated (64/64, zero King Wen disagreements).
- [x] Gesture-entropy casting, six throws, question lock, rubric — verified headless end to end.
- [x] "Interpret with AI" wired (dev-only) through the DJINN bridge; thread reuse so it
      does not spam the DM; quality checked on a real reading.
- [x] Monorepo; git identities split by directory; API typechecks (SDK pinned to a real version).

## Blocking

- [ ] **An Anthropic key for the API.** `api/.dev.vars` holds a placeholder. Until a real
      key exists, `/v1/oracles/iching/interpret` has never run and the DJINN bridge is the
      only AI path. Then: first real interpretation, measure the true cost (`ai_usage`
      records tokens; the $0.04–0.08 figure is an estimate), and flip `AI_ENDPOINT`.
- [ ] **One interpreter prompt, not two.** The rules live in both
      `api/src/oracles/interpret.ts` and `dev/djinn-bridge.mjs` and have already drifted
      slightly. Lift the shared rules into one module before the second oracle exists.
- [ ] **Deploy `web/` to replace the live static build.** The live site is unchanged; the
      integrated oracle exists only in this repo. Decide where it is served from.
- [ ] **Production "Interpret with AI".** The button is localhost-only. Production needs
      the sign-in flow (magic link) and the quota readout in the page.

## Platform decisions still open

- [ ] **Native app stack** — Expo/React Native (engine and corpus port directly; real
      shake via `expo-sensors`) vs SwiftUI (best feel, iOS-only, rewrite). Unanswered.
- [ ] **API deploy target** (configured for Cloudflare Workers; not decided; not the droplet).
- [ ] **Domain** — `liber488.com` is assumed only in the magic-link sender address.
- [ ] **Mail provider** for magic links (Resend stubbed; dev mode returns the link inline).
- [ ] **Payments** for adept/magus (tiers exist in schema and limiter; nothing charges).

## Oracles

- [ ] **Tarot** — the querent's gesture drives the shuffle and the cut; 78 original card
      texts are the bulk of the work, as the 384 were here.
- [ ] **Carta astral** — needs date, exact time, place, and an ephemeris decision
      (Swiss Ephemeris via WASM vs an API) before any design.
- [ ] **News, AI-boosted** — least defined; decide what it *is* first.
- [ ] **Generalise the interpreter** — see "one prompt, not two" above.

## Quality

- [ ] **Tune the shake threshold** (`REQUIRED = 90`, ~1 s) against real hands and phones.
- [ ] **Accessibility pass** on the shake control (screen reader; a non-gesture fallback).
- [ ] **Tests** — none in `web/`; in `api/`, priority: `resolve()` over all 64 patterns,
      the relating-hexagram transform, quota enforcement, `parseCast` rejection.
- [ ] **IP limiting on `/v1/auth/request`** — magic-link mail can be looped.
- [ ] **Retrieval quality of readings journal** once accounts exist (server-side journal
      is stored; nothing reads it back into the page yet).

## Not this repo

- DJINN's facts memory (fixed and deployed 2026-09-16) and its remaining retrieval-ranking
  gap: see `packages/djinn/FACTS-MEMORY-FIX.md` in the DJINN release, and
  `docs/SESSION-2026-09-16.md` here for the pointer.
