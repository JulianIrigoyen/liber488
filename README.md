# Liber 488

A cabinet of oracles, AI-boosted. The I Ching is the first; tarot, a natal
chart reader and news follow.

```
api/                          TypeScript + Hono. Auth, quota, AI interpretation.
web/                          The Oracle of Changes — the I Ching module.
experiments/liber-daemonicum/ Superseded. Kept for one idea that survived.
TODO.md                       Roadmap.
```

## The argument

Two commitments shape everything here.

**The querent casts, not the computer.** A button wired to a random number
generator is a vending machine with a book attached. In the physical rite the
deciding act runs through the querent's own body — their hand, their question,
that moment. So casting happens on the device and stays there: the entropy comes
from the sub-millisecond timing and path of a real hand movement, extracted
through SHA-256 so the traditional line probabilities still come out exactly
right. There is deliberately no cast endpoint on the server. This is not
negotiable; it is the product.

**The AI interprets, it does not fortune-tell.** The app already ships 64
hexagram judgments and 384 changing-line texts. The model's job is the thing
fixed text cannot do — read the figure against *this* person's actual
situation: where they sit in it, which line falls on their own position, and
which reading of an ambiguous line is the one that does not flatter them. It
never predicts outcomes.

Writing rules are enforced in the prompt, and the first of them is plain
English. Ornate, oracular interpretation is worse than useless to someone who is
upset and needs to understand something.

## Shape

API-first. The web app today and a native app later are both clients of the same
API, so no product logic lives in a front end.

The oracles are free and need no account. Only AI interpretation requires a
login and a quota, because only that costs money.

## Getting started

```bash
cd api && npm install
npx wrangler d1 create liber488     # paste the id into wrangler.toml
npm run db:init
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put JWT_SECRET
npm run dev
```

The web app is static — open `web/index.html`, no build step.

`api/README.md` covers the endpoints and the interpreter.
`web/README.md` covers the casting mechanics and the corpus.

## Provenance

All 64 hexagram texts and all 384 line texts were written for this project. They
are interpretations, not translations, and do not reproduce any translator's
wording. The framework they fill — King Wen numbering, trigram composition, the
six line positions — is the classical structure, roughly three thousand years
old and common property.
