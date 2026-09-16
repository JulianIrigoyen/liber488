# Liber 488 — API

The spine of Liber 488. API-first on purpose: the web app today and a native
app later are both clients of this, so no product logic lives in a front end.

TypeScript + [Hono](https://hono.dev). Configured for Cloudflare Workers + D1,
but Hono is runtime-agnostic — the only Cloudflare-specific code is the D1
calls in `src/lib/db.ts`. Moving to Node, Bun or Fly means swapping
`wrangler.toml` and that one file.

## Why it is shaped this way

**The oracles are free and need no account. Only AI interpretation needs a
login.** Casting happens on the device and stays there: the querent's own
physical gesture supplies the entropy, and the moment that moves to a server it
becomes an ordinary random number generator. There is deliberately no "cast"
endpoint. The device casts; the server interprets.

That also puts the paywall exactly on the thing that costs money.

**The server decides what a cast means.** `POST /v1/oracles/iching/resolve`
takes the six raw line values and derives both hexagrams itself. The client
never tells the server which hexagram it got, so nobody can hand-pick a
flattering figure from the browser console. This matters once readings are
attached to an account.

**Quota is charged before the model call, not after.** A row goes into
`ai_usage` first and token counts are filled in when the stream finishes.
Otherwise a crash mid-stream is a free retry, which is the first thing anyone
finds.

## Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET`  | `/health` | — | liveness |
| `POST` | `/v1/auth/request` | — | emails a magic link; in dev returns it in the body |
| `POST` | `/v1/auth/verify` | — | one-time token → 30-day JWT |
| `GET`  | `/v1/me` | JWT | user + remaining quota |
| `POST` | `/v1/oracles/iching/resolve` | — | six line values → both hexagrams |
| `POST` | `/v1/oracles/iching/interpret` | JWT | streams the AI reading as SSE |
| `POST` | `/v1/readings` | JWT | save a reading |
| `GET`  | `/v1/readings` | JWT | last 50 |

## The interpreter

`src/oracles/interpret.ts` holds the system prompt, and it is the most
load-bearing file in the repo. It does **not** re-explain the hexagram — the
app already ships 64 judgments and 384 line texts. Its job is what fixed text
cannot do: read the figure against this person's actual situation.

Every rule in it came from a reading that went wrong or right in testing:

- **Plain language, short sentences.** First and longest section, because a
  real user read an ornate interpretation and said they did not understand a
  word of it. It bans oracular register outright and requires any technical
  term to be cashed out in the querent's own life immediately.
- **Place the querent in the figure.** Hexagram 42 (Increase) reads backwards
  until you know who pays whom. If a changing line lands on the position the
  querent actually occupies, that is the most useful thing that can be said.
- **Refuse to flatter.** Where an ambiguous line has a reading that favours the
  querent and one that does not, it must state the unflattering one.
- **Never predict.** No outcomes, no forecasts, no claims about what another
  person will do. The book does not do outcomes.

Model: `claude-opus-5`, adaptive thinking, streaming, with server-side fallback
so a safety refusal on someone's personal situation degrades instead of 500ing.

## Running it

```bash
npm install
npx wrangler d1 create liber488     # paste the id into wrangler.toml
npm run db:init                     # applies schema.sql locally
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put JWT_SECRET
npm run dev
```

In development `POST /v1/auth/request` returns the magic link in the response
body instead of mailing it, so you can sign in before wiring mail.

```bash
npm run typecheck    # tsc --noEmit — currently clean
```

## Cost

Opus 5 is $5/$25 per MTok and adaptive thinking bills as output. A reading is
roughly 2.5k in / 800+ out, so an estimated **$0.04–0.08 each**. At the free
tier's 3/day that is up to ~$0.20 per active user per day.

**This is an estimate and has not been measured.** `ai_usage` records input and
output tokens per call — after a few real readings, query that table for the
true figure. If it is too rich, the first lever is
`output_config: { effort: "medium" }` on the free tier rather than a smaller
model, because the structural reasoning is the whole value.

## Rate limits

`src/lib/ratelimit.ts`, one table: free 3/day, adept 30, magus 200. Per UTC day.

## Roadmap

See [TODO.md](../TODO.md).
