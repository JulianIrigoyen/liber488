# web/ — the Liber 488 site, with the new oracle

This is the live Liber 488 build (11 pages, `assets/css/grimoire.css`, the plates and
icons) mirrored on 2026-09-16, plus the new I Ching consultation integrated into
`iching.html` in the site's own idiom. Everything outside the oracle is untouched.

## What changed, and only that

| file | change |
|---|---|
| `assets/data/hexagrams.js` | each of the 64 entries gained `lines6` — six original changing-line texts. Names, `cn`, `above`/`below`, judgment, image, counsel: unchanged. |
| `assets/js/oracle.js` | the cast was rewritten: gesture entropy (SHA-256 extraction) instead of `Math.random()`; a question that is required and locks on the first throw; six separate throws, bottom upward; moving-line texts shown in the card; a "which lines govern" rubric. `card()`, the table of sixty-four and the search are the site's own code, extended not replaced. |
| `iching.html` | the `#oracle` section: question field, the hold-and-shake control, per-line log. The paragraph claiming the method "uses your browser's random source" was removed because it is no longer true. |
| `assets/css/grimoire.css` | one appended block for the question field, shake control, question recall and moving-line rows, using the site's own tokens. The changing-line red is `#d2564f`, the value the site's code already used. |

Nothing else in the site was modified.

## How casting works

Press and hold the bar, move your hand while holding, release to throw. Each line needs
its own shake. ~90 motion samples (about a second) are required before a release counts;
releasing early is refused with "Not shaken enough". Keyboard: focus the bar, hold Space or
Enter — the hold's timing is the entropy. Phone: "Use device motion too" adds accelerometer
samples. The pool is hashed with SHA-256 and three bits give three coins (yang 3 / yin 2),
so the traditional line probabilities hold exactly.

## "Interpret with AI"

Appears under a completed reading, on localhost only. It posts the question and the six
raw values to `http://127.0.0.1:8788/interpret` — the DJINN bridge in `../dev/`. Expect a
minute or two; each call is a real Slack round trip. The production path is the API's
`/v1/oracles/iching/interpret` (login + quota); switch `AI_ENDPOINT` in `oracle.js` when
an Anthropic key is available.

## Serve

```bash
python3 -m http.server 5173 --bind 127.0.0.1      # from this directory
```
