import { BY_PATTERN, TRIGRAMS, type Hexagram, type Trigram } from "./iching-data.js";

/** A cast is six line values, bottom line first.
 *  6 = old yin (changing) · 7 = young yang · 8 = young yin · 9 = old yang (changing) */
export type LineValue = 6 | 7 | 8 | 9;
export type Cast = [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue];
export type Method = "coins" | "yarrow";

export interface Resolved {
  cast: Cast;
  method: Method;
  primary: Hexagram;
  relating: Hexagram | null;     // null when nothing is changing
  moving: number[];              // 0-based line indexes, bottom first
  primaryPattern: string;
  relatingPattern: string;
  above: Trigram;
  below: Trigram;
  rubric: string;
}

export function isLineValue(v: unknown): v is LineValue {
  return v === 6 || v === 7 || v === 8 || v === 9;
}

export function parseCast(input: unknown): Cast {
  if (!Array.isArray(input) || input.length !== 6 || !input.every(isLineValue)) {
    throw new Error("cast must be six values, each 6, 7, 8 or 9, bottom line first");
  }
  return input as Cast;
}

/** The client casts — the querent's gesture is the entropy and that must stay
 *  on the device. But the server never trusts the client's idea of WHICH
 *  hexagram that is; it derives both figures from the raw six values. */
export function resolve(cast: Cast, method: Method): Resolved {
  const primaryPattern = cast.map((v) => (v === 7 || v === 9 ? "1" : "0")).join("");
  const relatingPattern = cast
    .map((v) => (v === 6 ? "1" : v === 9 ? "0" : v === 7 ? "1" : "0"))
    .join("");

  const primary = BY_PATTERN[primaryPattern];
  const relating = BY_PATTERN[relatingPattern];
  if (!primary || !relating) throw new Error("no hexagram for pattern — corpus is incomplete");

  const moving: number[] = [];
  cast.forEach((v, i) => { if (v === 6 || v === 9) moving.push(i); });

  const below = TRIGRAMS[primaryPattern.slice(0, 3)]!;
  const above = TRIGRAMS[primaryPattern.slice(3, 6)]!;

  return {
    cast, method, primary,
    relating: primaryPattern === relatingPattern ? null : relating,
    moving, primaryPattern, relatingPattern, above, below,
    rubric: rubricFor(moving.length),
  };
}

/** Which lines actually govern the reading. One common (Song-commentary style)
 *  convention; schools differ, and the copy says so rather than pretending
 *  there is a settled answer. */
export function rubricFor(n: number): string {
  switch (n) {
    case 0: return "Nothing is changing. Read the judgment of the primary hexagram alone. There is no second hexagram.";
    case 1: return "One line changes and it governs the reading. Its text is the specific answer; the hexagram is the setting.";
    case 2: return "Two lines change. Read both; by most accounts the upper of the two carries more weight.";
    case 3: return "Three lines change. Read all three; the middle one is usually treated as central.";
    case 4: return "Four lines change. Read the two lines that are NOT changing — the lower of them governs.";
    case 5: return "Five lines change. Read the single line that is not changing.";
    default: return "All six lines change. Read the judgment of the second hexagram as the answer.";
  }
}
