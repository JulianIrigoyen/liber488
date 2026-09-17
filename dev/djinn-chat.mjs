#!/usr/bin/env node
/**
 * djinn-chat — hold an actual conversation with DJINN, brain and tools intact.
 *
 * I had been firing one-shot questions and getting one-shot answers. That is
 * not DJINN's limit, it was mine: djinn-ask supports --thread (reply inside an
 * existing thread) and --carry (inline the prior exchange as operator-supplied
 * context). Used together they give real multi-turn.
 *
 * Why --carry is needed at all, from djinn-ask.mjs:117 — slack-history-import
 * hydrates prior context ONLY from a genuine Slack message authored by the
 * asking user. An injected input has no such message, so DJINN gets
 * `slack_history_unavailable` and correctly reports it has no history. --carry
 * pastes the prior turns back in, explicitly labelled as operator-supplied
 * rather than verified history, so DJINN can weigh it accordingly. That
 * labelling is integrity, not a workaround, and it stays.
 *
 *   node dev/djinn-chat.mjs "first question"        # starts a conversation
 *   node dev/djinn-chat.mjs "follow up"             # continues it, with context
 *   node dev/djinn-chat.mjs --new "fresh topic"     # starts over
 *   node dev/djinn-chat.mjs --show                  # where the conversation is
 *
 * Env: DJINN_ASK_CHANNEL to move off the private DM.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const STATE = path.resolve(here, ".djinn-chat");
const CHANNEL = process.env.DJINN_ASK_CHANNEL || "";
const TIMEOUT_S = Number(process.env.DJINN_TIMEOUT || 280);

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const question = argv.filter((a) => !a.startsWith("--")).join(" ").trim();

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return { thread: null, turns: 0 }; }
}
function writeState(s) {
  try { fs.writeFileSync(STATE, JSON.stringify(s, null, 2)); } catch {}
}

if (has("--show")) {
  const s = readState();
  console.log(s.thread ? `thread ${CHANNEL || "(default DM)"}/${s.thread}, ${s.turns} turn(s)` : "no conversation yet");
  process.exit(0);
}
if (has("--new")) writeState({ thread: null, turns: 0 });
if (!question) {
  console.error('usage: djinn-chat.mjs [--new|--show] "your message"');
  process.exit(1);
}

const state = readState();

/* First turn opens the thread. Every turn after reuses it AND carries the
   prior exchange, which is what makes it a conversation rather than a series
   of unrelated questions. */
const flags = [
  CHANNEL ? `--channel ${CHANNEL}` : "",
  state.thread ? `--thread ${state.thread}` : "",
  state.thread ? "--carry" : "",
  `--timeout ${TIMEOUT_S}`,
].filter(Boolean).join(" ");

const child = spawn("ssh", ["djinn", "bash -s"], { stdio: ["pipe", "pipe", "pipe"] });
let out = "", err = "";
child.stdout.on("data", (c) => (out += c));
child.stderr.on("data", (c) => {
  err += c;
  const s = String(c).trim();
  if (s) process.stderr.write(`  ${s}\n`);          // live progress
});
child.on("close", (code) => {
  if (!state.thread) {
    const m = err.match(/thread\s+([CDG][A-Z0-9]+)\/(\d+\.\d+)/);
    if (m) state.thread = m[2];
  }
  state.turns += 1;
  writeState(state);
  if (code !== 0) {
    console.error(`\nssh exited ${code}`);
    process.exit(code);
  }
  console.log("\n" + out.trim());
});
child.stdin.write(
  `node --no-warnings /root/bin/djinn-ask.mjs ${flags} "$(cat <<'DJINN_CHAT_EOF'\n${question}\nDJINN_CHAT_EOF\n)"\n`,
);
child.stdin.end();
