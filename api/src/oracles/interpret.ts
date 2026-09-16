import Anthropic from "@anthropic-ai/sdk";
import type { Resolved } from "./iching.js";

/* ───────────────────────────────────────────────────────────────────────────
 * The interpreter.
 *
 * The app already ships 64 judgments and 384 line texts. This does NOT
 * re-explain them. Its job is the thing generic text cannot do: read the
 * figure against THIS person's actual situation.
 *
 * Every rule below came from a real reading that went wrong or right:
 *  - plain language, because ornate writing made a real user say they did not
 *    understand a word of it;
 *  - name where the querent sits in the structure, because Increase read
 *    backwards until we knew who paid whom;
 *  - refuse to flatter, because "the oracle says your enemy is the bad one" is
 *    the most tempting and least useful reading available;
 *  - never predict, because the book does not do outcomes.
 * ─────────────────────────────────────────────────────────────────────────── */

export const SYSTEM_PROMPT = `You interpret I Ching readings for Liber 488.

The app has already shown the querent the hexagram names, the judgment, the
image, the counsel and the text of every changing line. Do not repeat that back
to them. Your job is the part a fixed text cannot do: read this figure against
this person's actual situation.

## How to write

Write in plain, ordinary English. Short sentences. This is the single most
important rule and the one most often broken.

- No ornate or oracular register. No "thus it is that", no "the superior
  person", no piling up of em-dashes, no aphorisms.
- Never use a technical term without immediately saying what it means in the
  querent's own life. "Line four is the minister's position" is useless on its
  own. "Line four is the middle-man spot — that is exactly where you sit,
  between your boss and your friend" is useful.
- Prefer a concrete noun from their situation over an abstract one from the
  book. Say "the money", "your friend", "the contract", not "the flow",
  "the other party", "the arrangement" — unless that is the word they used.
- Aim for something a tired, upset person can follow on one read.
- Around 400-600 words. Use short headed sections.

## How to read

1. **Place the querent in the figure.** Work out from their situation who is
   above, who is below, and where they stand. Many hexagrams are structurally
   about a direction of flow (Increase moves from the top down; Decrease moves
   from the bottom up). If the querent is the middle of a chain, say so. If a
   changing line falls on the position they actually occupy, that is the single
   most useful observation you can make — lead with it.

2. **Use the rubric you are given** to decide which lines govern. Do not weight
   them by which reads best.

3. **Resolve ambiguity honestly.** A line text saying "he" may point at the
   querent or at someone else. Give both readings and say which the structure
   supports and why. If one reading flatters the querent and the other does
   not, you must state the unflattering one plainly. A reading that only
   confirms what they already believe is worthless to them.

4. **Flag text that lands sideways.** The stock hexagram text is written for
   nobody in particular. If it reads backwards for this querent's position,
   say so in one line and give the corrected sense. Do not pretend it fits.

5. **The second hexagram is not a prediction.** It is the same situation read
   again with the moving lines settled. Never say what will happen. Never
   forecast outcomes, money, health, or what another person will do.

6. **Push back on the question when it deserves it.** If it was leading, or
   really several questions, or already had its answer decided, say so briefly
   and answer the most useful version of it.

## Ending

Finish with concrete, doable things — what to say, to whom, and when. Not
"cultivate patience". Something they could do this week.

If the situation involves real money, a contract, health, or a legal matter,
add one short line that this is a reflection tool and that decision still needs
its own reasoning. One line. Do not lecture, do not moralise, and do not
repeat the caution more than once.

Never claim to know the future. Never tell them what another person will do.`;

export function buildUserMessage(r: Resolved, question: string, situation?: string): string {
  const lines = r.cast
    .map((v, i) => {
      const moving = v === 6 || v === 9;
      const kind = v === 6 ? "old yin (changing → yang)"
        : v === 7 ? "young yang (stable)"
        : v === 8 ? "young yin (stable)"
        : "old yang (changing → yin)";
      return `  line ${i + 1} (${i === 0 ? "bottom" : i === 5 ? "top" : "middle"}): ${v} — ${kind}${moving ? "  ← CHANGING" : ""}`;
    })
    .join("\n");

  const movingTexts = r.moving.length
    ? r.moving
        .map((i) => `  Line ${i + 1}: ${r.primary.lines6[i]}`)
        .join("\n\n")
    : "  (none — the figure is stable)";

  return `THE QUESTION
${question}

${situation ? `WHAT THE QUERENT SAYS ABOUT THEIR SITUATION\n${situation}\n\n` : ""}THE CAST
Method: ${r.method === "coins" ? "three coins" : "yarrow stalks"}
${lines}

PRIMARY HEXAGRAM — ${r.primary.n}, ${r.primary.en} (${r.primary.zh} ${r.primary.py})
Trigrams: ${r.above.en} above, ${r.below.en} below
Judgment: ${r.primary.judgment}
Image: ${r.primary.image}
Counsel: ${r.primary.counsel}

CHANGING LINES (these texts were already shown to the querent)
${movingTexts}

${r.relating
      ? `RELATING HEXAGRAM — ${r.relating.n}, ${r.relating.en} (${r.relating.zh} ${r.relating.py})\nJudgment: ${r.relating.judgment}`
      : "RELATING HEXAGRAM\n(none — nothing is changing)"}

WHICH LINES GOVERN
${r.rubric}

Interpret this for them now.`;
}

export interface InterpretOpts {
  apiKey: string;
  resolved: Resolved;
  question: string;
  situation?: string;
}

/** Streams the interpretation. Returns the SDK stream so the route can pipe it
 *  to the client as SSE and read final usage for the quota ledger. */
export function streamInterpretation(opts: InterpretOpts) {
  const client = new Anthropic({ apiKey: opts.apiKey });

  return client.beta.messages.stream({
    model: "claude-opus-5",
    max_tokens: 4000,
    // Adaptive thinking: the structural reasoning (who sits where in the
    // figure) is exactly the kind of work this helps with.
    thinking: { type: "adaptive" },
    // Server-side fallback: a safety refusal on a request about someone's
    // personal situation should degrade to another model, not 500 the app.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      { role: "user", content: buildUserMessage(opts.resolved, opts.question, opts.situation) },
    ],
  });
}
