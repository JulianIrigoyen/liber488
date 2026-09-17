# dev/ — local-only tools that talk to DJINN

Nothing here ships. Both tools shell out over the multiplexed `ssh djinn` alias to
`/root/bin/djinn-ask.mjs`, which injects a message into DJINN's durable store as Julian
and reads the reply back out of the Slack thread.

## djinn-bridge.mjs — the stopgap behind "Interpret with AI"

`node dev/djinn-bridge.mjs` → `http://127.0.0.1:8788`. `POST /interpret` with
`{question, cast, situation?}` resolves the hexagrams locally from the site's own
`hexagrams.js`, builds a self-contained interpretation prompt (the same rules as the API's:
plain English, place the querent in the figure, refuse to flatter, never predict, skip
DJINN's company-agent framing) and returns `{text, seconds}`.

Why it exists: this machine has no Anthropic key, DJINN does. Costs, all real:
- **30–120 s per call**; no streaming.
- **Every call is a Slack message.** The first creates one thread and caches its ts in
  `dev/.djinn-thread`; every later reading is a reply inside it, so it is one thread you
  can mute rather than a new top-level post each time. `DJINN_ASK_CHANNEL=<id>` moves it
  off the private DM entirely. No `--carry`: readings are self-contained by design.
- DJINN's own system prompt is in the loop; it complied, but it is a variable the API
  path does not have.

**Anything you send DJINN as Julian becomes a Julian-owned fact in its memory the next
day** — test prompts included. Keep test questions obviously synthetic, or retire the
facts afterwards (`retire-facts.mjs` in the DJINN release).

## djinn-chat.mjs — a real conversation with DJINN

```bash
node dev/djinn-chat.mjs --new "first question"      # opens a thread
node dev/djinn-chat.mjs "follow-up"                  # continues it with context
node dev/djinn-chat.mjs --show
```

Combines `--thread` (reply inside the same thread) with `--carry` (paste the prior
exchange back in as clearly-labelled operator context). DJINN has no free multi-turn for
injected inputs by design — the labelling is integrity, not a workaround. Verified: it
recalled a number it had picked two turns earlier and cited `djinn-slack.mjs:506` from the
real source. State in `dev/.djinn-chat`.

DJINN cannot initiate to this session; there is no inbound path.
