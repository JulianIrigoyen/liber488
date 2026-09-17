# Liber 488 — Cabinet of the Hidden Sciences

Our site (live today as a static build), now with a real I Ching consultation in it, an
API for the parts that need a login, and a roadmap toward tarot, a natal-chart reader and
news — each AI-boosted, with the AI gated behind login and a quota.

```
web/            The Liber 488 site, mirrored from the live build, with the new oracle
                integrated into iching.html. Static, no build step.
api/            TypeScript + Hono. Magic-link auth, per-day AI quota, server-side
                hexagram resolution, streaming AI interpretation, saved readings.
dev/            Local-only tools: the DJINN bridge behind "Interpret with AI", and a
                multi-turn chat with DJINN. Must never ship.
experiments/    Superseded prototypes kept for what survived from them.
docs/           SESSION-2026-09-16.md — how all of this came to be, in one place.
TODO.md         Roadmap and open decisions.
```

## Two commitments

**The querent casts, not the computer.** A button wired to a random number generator is a
vending machine with a book attached. In the rite, the deciding act runs through the
querent's own body. So every line is decided by the querent's gesture — press, hold, move,
release — sampled at sub-millisecond resolution, with the accelerometer if the device has
one. The raw motion is biased, so it passes through SHA-256 as a randomness extractor:
the entropy is the querent's, the distribution is the traditional 1/8, 3/8, 3/8, 1/8.
There is deliberately no cast endpoint on the server, and there never will be.

**The AI interprets; it does not fortune-tell.** The site already carries 64 judgments,
images and counsels, and now 384 changing-line texts. The model's job is what fixed text
cannot do: read the figure against *this* person's situation — where they sit in it,
which moving line falls on their own position, which reading of an ambiguous line is the
one that does not flatter them. In plain English. It never predicts outcomes.

## Run it

```bash
# the site
cd web && python3 -m http.server 5173 --bind 127.0.0.1     # http://127.0.0.1:5173/iching.html

# the API (needs a D1 id in wrangler.toml and secrets in .dev.vars — see api/README.md)
cd api && npm install && npm run db:init && npm run dev     # http://127.0.0.1:8787

# "Interpret with AI" in local dev, routed through DJINN (see dev/README.md)
node dev/djinn-bridge.mjs                                   # http://127.0.0.1:8788
```

The oracle works fully with nothing but the site. Casting needs no server. The AI button
appears only on localhost and, for now, talks to the DJINN bridge; the API's own
interpretation path is built and typechecked but has not run against the live model
because this machine has no Anthropic key. Swapping is one line (`AI_ENDPOINT` in
`web/assets/js/oracle.js`).

## Provenance of the text

The site's own hexagram names, judgments, images and counsels are unchanged. The 384
changing-line texts were written for this project on 2026-09-16 — interpretations, not
translations, reproducing no translator's wording — and merged into `hexagrams.js` by line
pattern, which cross-validated both corpora: 64/64 patterns matched with zero King Wen
disagreements. The classical framework they fill is ~3000 years old and common property.

## Where things came from

Two Claude artifacts were the prototypes. Both are superseded by `web/` and kept only
for reference: *Liber Daemonicum* (a grimoire-of-the-agent-stack twist; rejected on
design) and *The Oracle of Changes* (standalone, paper-and-cinnabar; its engine, corpus
and reading rubric are what moved into the site). The story is in
`docs/SESSION-2026-09-16.md`.
