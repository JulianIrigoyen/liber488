export interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  APP_ORIGIN: string;
  ENVIRONMENT: string;
  RESEND_API_KEY?: string;
}

export type Tier = "free" | "adept" | "magus";

export interface User { id: string; email: string; tier: Tier; created_at: number; }

export const uid = () => crypto.randomUUID();
export const now = () => Date.now();
export const today = () => new Date().toISOString().slice(0, 10);

export async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function findOrCreateUser(db: D1Database, email: string): Promise<User> {
  const norm = email.trim().toLowerCase();
  const existing = await db.prepare("SELECT * FROM users WHERE email = ?").bind(norm).first<User>();
  if (existing) return existing;
  const user: User = { id: uid(), email: norm, tier: "free", created_at: now() };
  await db.prepare("INSERT INTO users (id, email, tier, created_at) VALUES (?, ?, ?, ?)")
    .bind(user.id, user.email, user.tier, user.created_at).run();
  return user;
}

export async function getUser(db: D1Database, id: string): Promise<User | null> {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
}
