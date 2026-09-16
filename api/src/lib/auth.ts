import { sign, verify } from "hono/jwt";
import { sha256, now, type Env } from "./db.js";

const TOKEN_TTL_MS = 15 * 60 * 1000;      // magic link: 15 minutes
const SESSION_TTL_S = 60 * 60 * 24 * 30;  // session: 30 days

export async function issueLoginToken(env: Env, email: string): Promise<string> {
  const raw = crypto.randomUUID() + crypto.randomUUID();
  const hash = await sha256(raw);
  await env.DB
    .prepare("INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)")
    .bind(hash, email.trim().toLowerCase(), now() + TOKEN_TTL_MS)
    .run();
  return raw;
}

export async function consumeLoginToken(env: Env, raw: string): Promise<string | null> {
  const hash = await sha256(raw);
  const row = await env.DB
    .prepare("SELECT email, expires_at, used_at FROM login_tokens WHERE token_hash = ?")
    .bind(hash)
    .first<{ email: string; expires_at: number; used_at: number | null }>();
  if (!row || row.used_at || row.expires_at < now()) return null;
  await env.DB.prepare("UPDATE login_tokens SET used_at = ? WHERE token_hash = ?")
    .bind(now(), hash).run();
  return row.email;
}

export async function issueSession(env: Env, userId: string): Promise<string> {
  return sign(
    { sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S },
    env.JWT_SECRET,
  );
}

export async function readSession(env: Env, token: string): Promise<string | null> {
  try {
    const payload = await verify(token, env.JWT_SECRET, "HS256");
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
