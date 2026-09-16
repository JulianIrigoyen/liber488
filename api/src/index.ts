/**
 * Liber 488 — API.
 *
 * API-first on purpose: the web app and (later) the native app are both clients
 * of this. Nothing here is Cloudflare-specific except the D1 calls, so it moves
 * to Node or Bun by swapping the adapter.
 *
 * The oracles themselves are FREE and need no account — casting happens on the
 * device, because the querent's own gesture is the entropy and that must not
 * move to a server. Only AI interpretation needs a login and a quota, because
 * only that costs money.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { parseCast, resolve, type Method } from "./oracles/iching.js";
import { streamInterpretation } from "./oracles/interpret.js";
import { findOrCreateUser, getUser, uid, now, type Env } from "./lib/db.js";
import { issueLoginToken, consumeLoginToken, issueSession, readSession } from "./lib/auth.js";
import { checkQuota, openUsage, closeUsage } from "./lib/ratelimit.js";

type Vars = { userId: string };
const app = new Hono<{ Bindings: Env; Variables: Vars }>();

app.use("*", async (c, next) =>
  cors({ origin: c.env.APP_ORIGIN, credentials: true, allowHeaders: ["Content-Type", "Authorization"] })(c, next),
);

app.get("/health", (c) => c.json({ ok: true, service: "liber488-api" }));

/* ── auth ───────────────────────────────────────────────────────────────── */

app.post("/v1/auth/request", async (c) => {
  const { email } = await c.req.json<{ email?: string }>();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return c.json({ error: "a valid email is required" }, 400);
  }
  const token = await issueLoginToken(c.env, email);
  const link = `${c.env.APP_ORIGIN}/auth/verify?token=${token}`;

  if (c.env.ENVIRONMENT === "development") {
    // No mail in dev — the link comes back in the response so you can click it.
    return c.json({ ok: true, dev_link: link });
  }
  await sendMagicLink(c.env, email, link);
  return c.json({ ok: true });
});

app.post("/v1/auth/verify", async (c) => {
  const { token } = await c.req.json<{ token?: string }>();
  if (!token) return c.json({ error: "token is required" }, 400);
  const email = await consumeLoginToken(c.env, token);
  if (!email) return c.json({ error: "that link is expired or already used" }, 401);
  const user = await findOrCreateUser(c.env.DB, email);
  return c.json({ token: await issueSession(c.env, user.id), user: { id: user.id, email: user.email, tier: user.tier } });
});

/* ── session guard ──────────────────────────────────────────────────────── */

async function requireUser(c: any, next: any) {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const userId = token ? await readSession(c.env, token) : null;
  if (!userId) return c.json({ error: "sign in to use AI interpretation" }, 401);
  c.set("userId", userId);
  await next();
}

app.get("/v1/me", requireUser, async (c) => {
  const user = await getUser(c.env.DB, c.get("userId"));
  if (!user) return c.json({ error: "no such user" }, 404);
  return c.json({ user: { id: user.id, email: user.email, tier: user.tier }, quota: await checkQuota(c.env.DB, user.id, user.tier) });
});

/* ── oracles: free, no account ──────────────────────────────────────────── */

/** Resolve a cast into its hexagrams. The client casts; the server decides what
 *  the cast MEANS, so the figure can never be spoofed from the browser. */
app.post("/v1/oracles/iching/resolve", async (c) => {
  try {
    const body = await c.req.json<{ cast?: unknown; method?: Method }>();
    const r = resolve(parseCast(body.cast), body.method === "yarrow" ? "yarrow" : "coins");
    return c.json({
      cast: r.cast, method: r.method, moving: r.moving, rubric: r.rubric,
      primary: r.primary, relating: r.relating,
      trigrams: { above: r.above, below: r.below },
    });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

/* ── AI interpretation: login + quota ───────────────────────────────────── */

app.post("/v1/oracles/iching/interpret", requireUser, async (c) => {
  const userId = c.get("userId");
  const user = await getUser(c.env.DB, userId);
  if (!user) return c.json({ error: "no such user" }, 404);

  const quota = await checkQuota(c.env.DB, userId, user.tier);
  if (quota.remaining <= 0) {
    return c.json(
      { error: "daily limit reached", quota, message: `You have used all ${quota.limit} interpretations for today. The oracle itself stays free — only the AI reading is limited.` },
      429,
    );
  }

  let body: { cast?: unknown; method?: Method; question?: string; situation?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "invalid JSON" }, 400); }

  const question = (body.question ?? "").trim();
  if (question.length < 3) return c.json({ error: "a question is required" }, 400);
  if (question.length > 2000) return c.json({ error: "question is too long" }, 400);

  let resolved;
  try {
    resolved = resolve(parseCast(body.cast), body.method === "yarrow" ? "yarrow" : "coins");
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }

  // Charge the quota BEFORE the call, so a mid-stream failure is not a free retry.
  const usageId = await openUsage(c.env.DB, userId, "iching");

  return streamSSE(c, async (sse) => {
    try {
      const stream = streamInterpretation({
        apiKey: c.env.ANTHROPIC_API_KEY,
        resolved,
        question,
        situation: body.situation?.slice(0, 4000),
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          await sse.writeSSE({ event: "delta", data: JSON.stringify({ text: event.delta.text }) });
        }
      }

      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") {
        await sse.writeSSE({ event: "error", data: JSON.stringify({ error: "This reading could not be interpreted automatically." }) });
      }
      await closeUsage(c.env.DB, usageId, final.usage.input_tokens ?? 0, final.usage.output_tokens ?? 0);
      await sse.writeSSE({ event: "done", data: JSON.stringify({ quota: await checkQuota(c.env.DB, userId, user.tier) }) });
    } catch (err) {
      await sse.writeSSE({ event: "error", data: JSON.stringify({ error: (err as Error).message }) });
    }
  });
});

/* ── saved readings ─────────────────────────────────────────────────────── */

app.post("/v1/readings", requireUser, async (c) => {
  const body = await c.req.json<{ oracle?: string; question?: string; payload?: unknown }>();
  if (!body.question) return c.json({ error: "question is required" }, 400);
  const id = uid();
  await c.env.DB
    .prepare("INSERT INTO readings (id, user_id, oracle, question, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, c.get("userId"), body.oracle ?? "iching", body.question, JSON.stringify(body.payload ?? {}), now())
    .run();
  return c.json({ id });
});

app.get("/v1/readings", requireUser, async (c) => {
  const { results } = await c.env.DB
    .prepare("SELECT id, oracle, question, payload, created_at FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .bind(c.get("userId"))
    .all();
  return c.json({ readings: results });
});

/* ── mail ───────────────────────────────────────────────────────────────── */

async function sendMagicLink(env: Env, email: string, link: string) {
  if (!env.RESEND_API_KEY) throw new Error("no mail provider configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Liber 488 <no-reply@liber488.com>",
      to: email,
      subject: "Your sign-in link",
      text: `Sign in to Liber 488:\n\n${link}\n\nThis link works once and expires in 15 minutes.`,
    }),
  });
  if (!res.ok) throw new Error(`mail send failed: ${res.status}`);
}

export default app;
