#!/usr/bin/env node
/**
 * DEV ONLY — a stopgap "Interpret with AI" backend that routes through DJINN.
 *
 * This is NOT the real path and must never ship. The real path is
 * api/src/oracles/interpret.ts calling Anthropic directly, which needs an
 * ANTHROPIC_API_KEY this machine does not currently have.
 *
 * Why a separate process at all: the Hono API targets Cloudflare Workers,
 * which cannot open SSH connections. This bridge runs on the Mac, shells out
 * over the multiplexed `djinn` alias, and hands the answer back over HTTP.
 *
 * Three costs of doing it this way, all real:
 *   1. Every call posts a genuine message into the private DJINN<->Julian
 *      Slack DM. This is not a sandbox.
 *   2. Round trip is 30-120s, against ~5s streaming from the API.
 *   3. DJINN is a company-brain agent with its own system prompt and tools,
 *      not a bare model, so the prompt below has to explicitly tell it to drop
 *      that framing. Output quality will differ from the real path.
 *
 *   node dev/djinn-bridge.mjs
 */
import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8788;
const TIMEOUT_S = 240;

/* Slack noise control.
 *
 * djinn-ask only posts a NEW top-level message when it is not given a thread
 * (djinn-ask.mjs:99 — `if (!thread) { chat.postMessage(...) }`). Slack is
 * DJINN's only delivery surface, so the reply has to land somewhere and the
 * script has to have a thread to read it back from — but that thread can be
 * the SAME one every time.
 *
 * So: create one thread on first use, cache its ts, and pass --thread after
 * that. All oracle traffic collapses into a single mutable thread instead of
 * a new top-level post per reading.
 *
 * DJINN_ASK_CHANNEL moves it off the private DM entirely if you make a
 * dedicated channel for this. Set it before starting the bridge.
 *
 * Note: no --carry. Each reading is self-contained by design, and we do not
 * want prior readings hydrated into the next one. */
const CHANNEL = process.env.DJINN_ASK_CHANNEL || "";
const THREAD_CACHE = path.resolve(here, ".djinn-thread");
function cachedThread() {
  try { return fs.readFileSync(THREAD_CACHE, "utf8").trim() || null; } catch { return null; }
}
function cacheThread(ts) {
  try { fs.writeFileSync(THREAD_CACHE, ts); } catch {}
}

/* ── the corpus, straight from the site's own data file ─────────────────── */
globalThis.window = {};
(0, eval)(fs.readFileSync(path.resolve(here, "../web/assets/data/hexagrams.js"), "utf8"));
const HEX = globalThis.window.HEXAGRAMS;
const byLines = Object.fromEntries(HEX.map((h) => [h.lines, h]));
const ORD = ["first", "second", "third", "fourth", "fifth", "sixth"];

function resolve(cast) {
  const primaryPattern = cast.map((v) => (v === 7 || v === 9 ? "1" : "0")).join("");
  const moving = [];
  cast.forEach((v, i) => { if (v === 6 || v === 9) moving.push(i); });
  const rel = primaryPattern.split("");
  moving.forEach((i) => { rel[i] = rel[i] === "1" ? "0" : "1"; });
  const relatingPattern = rel.join("");
  return {
    primary: byLines[primaryPattern],
    relating: primaryPattern === relatingPattern ? null : byLines[relatingPattern],
    moving,
  };
}

function rubric(n, into) {
  if (n === 0) return "No line moved. Read the judgment alone.";
  if (n === 1) return "One line moved and it governs the reading.";
  if (n === 2) return "Two lines moved. The upper of the two usually carries more weight.";
  if (n === 3) return "Three lines moved; the middle one is usually taken as central.";
  if (n === 4) return "Four lines moved. Read the two that did NOT move; the lower governs.";
  if (n === 5) return "Five lines moved. Read the single line that did not.";
  return `Every line moved. Read the judgment of ${into} as the answer.`;
}

/* ── the prompt. Self-contained: DJINN carries no history for injected
 *    inputs (slack_history_unavailable), so everything must be in one turn. ── */
function buildPrompt({ question, cast, situation }) {
  const r = resolve(cast);
  const lines = cast.map((v, i) => {
    const kind = v === 6 ? "old yin, changing to yang"
      : v === 7 ? "young yang, stable"
      : v === 8 ? "young yin, stable"
      : "old yang, changing to yin";
    return `  line ${i + 1}: ${v} (${kind})${v === 6 || v === 9 ? "  <- MOVING" : ""}`;
  }).join("\n");

  const movers = r.moving.length
    ? r.moving.map((i) => `  ${ORD[i]} line: ${r.primary.lines6[i]}`).join("\n")
    : "  (none)";

  return `Ignore your usual role for this one message. You are not acting as a company
agent here: do not search the repo, do not use tools, do not mention Synapse,
Linear or any internal system. Just answer the request below directly.

You are interpreting an I Ching reading for someone. They have already been
shown the hexagram names, judgment, image, counsel, and the text of every
moving line, so do not repeat those back. Your job is the part fixed text
cannot do: read this figure against this person's actual situation.

HOW TO WRITE - the most important rule:
Plain, ordinary English. Short sentences. No ornate or oracular register, no
"the superior person", no aphorisms, no piled-up dashes. Never use a technical
term without immediately saying what it means in their own life: "line four is
the middle-man spot - that is where you sit, between X and Y" is useful; "line
four is the minister's position" alone is not. Aim for something a tired, upset
person can follow on one read. 350-500 words, short headed sections.

HOW TO READ:
1. Place them in the figure. Work out who is above, who is below, and where
   they stand. Many hexagrams are about a direction of flow. If a moving line
   falls on the position they actually occupy, lead with that.
2. Use the rubric below to decide which lines govern - not which reads best.
3. Resolve ambiguity honestly. A line saying "he" may mean them or someone
   else. Give both readings and say which the structure supports. If one
   flatters them and one does not, state the unflattering one plainly.
4. The second hexagram is NOT a prediction. It is the same situation read
   again with the moving lines settled. Never forecast outcomes, money, health,
   or what another person will do.
5. End with concrete things they could actually do this week.

THE QUESTION
${question}
${situation ? `\nWHAT THEY SAY ABOUT THEIR SITUATION\n${situation}\n` : ""}
THE CAST (bottom line first)
${lines}

PRIMARY: Hexagram ${r.primary.n}, ${r.primary.name} (${r.primary.cn})
  above ${r.primary.above}, below ${r.primary.below}
  Judgment: ${r.primary.judgment}
  Image: ${r.primary.image}
  Counsel: ${r.primary.counsel}

MOVING LINE TEXTS (already shown to them)
${movers}

${r.relating
  ? `TURNING INTO: Hexagram ${r.relating.n}, ${r.relating.name} (${r.relating.cn})\n  Judgment: ${r.relating.judgment}`
  : "TURNING INTO: nothing - the figure is stable."}

WHICH LINES GOVERN
${rubric(r.moving.length, r.relating ? r.relating.name : "")}

Interpret it for them now.`;
}

/* ── ssh out. Heredoc inside command substitution keeps quotes and newlines
 *    intact without any escaping of the prompt itself. ─────────────────── */
function askDjinn(prompt) {
  return new Promise((resolve, reject) => {
    const thread = cachedThread();
    const flags = [
      CHANNEL ? `--channel ${CHANNEL}` : "",
      thread ? `--thread ${thread}` : "",
      `--timeout ${TIMEOUT_S}`,
    ].filter(Boolean).join(" ");

    const child = spawn("ssh", ["djinn", "bash -s"], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", (c) => (out += c));
    child.stderr.on("data", (c) => (err += c));
    child.on("error", reject);
    child.on("close", (code) => {
      /* On the first run there is no --quiet, so the script prints
         "→ thread <CHANNEL>/<TS>" to stderr. Capture it once and reuse it. */
      if (!thread) {
        const m = err.match(/thread\s+([CDG][A-Z0-9]+)\/(\d+\.\d+)/);
        if (m) { cacheThread(m[2]); console.log(`  thread cached: ${m[1]}/${m[2]} — later readings reply inside it`); }
      }
      if (code !== 0) return reject(new Error(`ssh exited ${code}: ${err.slice(-500)}`));
      resolve(out.trim());
    });
    child.stdin.write(
      `node --no-warnings /root/bin/djinn-ask.mjs ${flags} "$(cat <<'LIBER488_PROMPT_EOF'\n${prompt}\nLIBER488_PROMPT_EOF\n)"\n`,
    );
    child.stdin.end();
  });
}

/* ── server ─────────────────────────────────────────────────────────────── */
http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  if (req.url === "/health") return res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true,"via":"djinn"}');
  if (req.method !== "POST" || req.url !== "/interpret") return res.writeHead(404).end("not found");

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const { question, cast, situation } = JSON.parse(body);
      if (!question || !Array.isArray(cast) || cast.length !== 6) throw new Error("need question and a six-value cast");
      if (!cast.every((v) => [6, 7, 8, 9].includes(v))) throw new Error("cast values must be 6, 7, 8 or 9");

      console.log(`[${new Date().toISOString()}] asking DJINN — "${question.slice(0, 60)}"`);
      const t0 = Date.now();
      const text = await askDjinn(buildPrompt({ question, cast, situation }));
      console.log(`  answered in ${((Date.now() - t0) / 1000).toFixed(0)}s, ${text.length} chars`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text, via: "djinn", seconds: Math.round((Date.now() - t0) / 1000) }));
    } catch (e) {
      console.error("  failed:", e.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`DJINN bridge on http://127.0.0.1:${PORT}`);
  console.log(CHANNEL ? `  channel: ${CHANNEL}` : "  channel: default (private DJINN DM) — set DJINN_ASK_CHANNEL to move it");
  const t = cachedThread();
  console.log(t ? `  thread:  ${t} (reusing — no new top-level posts)` : "  thread:  none yet; the first reading creates one, the rest reply inside it");
});
