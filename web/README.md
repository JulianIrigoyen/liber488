# The Oracle of Changes

The I Ching module for Liber 488. Currently a standalone static web app; it
becomes the first oracle in the product.

## The idea

A `Cast` button wired to a random number generator is a vending machine with a
book attached. In the physical rite the deciding act runs through the querent's
own body — their hand, their question, that moment. Remove that and you have
not digitised the oracle, you have replaced it with a shuffle.

So this tool does not call a random number generator.

**Every line is decided by the querent's own gesture.** You press and hold, move
your hand, and release to throw. The sub-millisecond timings and the path of
that motion are the entropy — plus accelerometer samples if you grant motion
access and physically shake the phone. You shake once per line, six times, as
you would throw coins six times.

The raw motion is not used directly: human movement is biased and would skew the
line probabilities. It goes through SHA-256, which acts as a randomness
extractor — preserving the entropy you supplied while producing uniform bits, so
the traditional distributions come out exactly right.

What that claims: the deciding act is yours, it runs through your body, it is not
repeatable. What it does not claim: that this makes the oracle work. That is not
a question a web page settles.

## What is implemented

- **Both methods, with their real probabilities.** Coins (6·1/8, 7·3/8, 8·3/8,
  9·1/8) and yarrow (6·1/16, 7·5/16, 8·7/16, 9·3/16). These are not the same
  oracle — yarrow makes moving yang three times likelier than moving yin — and
  neither is presented as the real one.
- **All 64 hexagrams and all 384 changing-line texts.**
- **Changing lines and the relating hexagram**, framed as the same situation
  read again with the moving lines settled, never as a prediction.
- **A "how to read this cast" rubric** that changes with how many lines moved,
  labelled as one school's convention rather than settled law.
- **Commitment before the throw** — the question is required and locks once the
  first line falls, as does the method.
- **Repeat-question detection** — ask the same thing within a day and it shows
  what you drew last time and quotes the tradition's warning back at you.
- **Journal** in localStorage. Nothing is transmitted.

## Provenance of the text

All 64 hexagram texts and all 384 line texts here were written for this project.
They are interpretations, not translations, and do not reproduce any
translator's wording. The framework they fill — King Wen numbering, trigram
composition, the six line positions — is the classical structure, roughly three
thousand years old.

For the source, read a real translation. Wilhelm/Baynes shaped the Western
reception; Legge is older and public domain; Rutt and Shaughnessy are the ones
for the Bronze Age text rather than its Confucian commentary.

## Files

```
index.html
assets/css/oracle.css
assets/js/oracle.js          casting, entropy extraction, rendering
assets/data/trigrams.js
assets/data/hex-*.js         the corpus, 16 hexagrams per file
```

The corpus is also the source for `api/src/oracles/iching-data.ts`,
generated from these files by `api/scripts/build-corpus.mjs`, so web, API and
native share one set of texts. Run `npm run build:corpus` in `api/` after
editing any hexagram text.

## Known gaps

- The design is paper-and-cinnabar and does **not** match Liber 488's
  gold-on-black. Re-skin pending.
- Not yet wired to the API — no accounts, no AI interpretation.
- The shake threshold (`REQUIRED = 90` samples, ~1s of movement) has not been
  tuned against real use.
