import type { Tier } from "./db.js";
import { today, uid, now } from "./db.js";

/** AI interpretations per user per UTC day. The oracle is free and unlimited;
 *  only the model calls are metered, because only they cost anything. */
export const DAILY_LIMIT: Record<Tier, number> = {
  free: 3,
  adept: 30,
  magus: 200,
};

export interface Quota { used: number; limit: number; remaining: number; resets: string; }

export async function checkQuota(db: D1Database, userId: string, tier: Tier): Promise<Quota> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = ? AND day = ?")
    .bind(userId, today())
    .first<{ n: number }>();
  const used = row?.n ?? 0;
  const limit = DAILY_LIMIT[tier];
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resets: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  };
}

/** Recorded before the model call so a crash mid-stream cannot give free
 *  retries; token counts are filled in afterwards from final usage. */
export async function openUsage(db: D1Database, userId: string, oracle: string): Promise<string> {
  const id = uid();
  await db
    .prepare("INSERT INTO ai_usage (id, user_id, oracle, day, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, userId, oracle, today(), now())
    .run();
  return id;
}

export async function closeUsage(db: D1Database, id: string, input: number, output: number) {
  await db.prepare("UPDATE ai_usage SET input_tokens = ?, output_tokens = ? WHERE id = ?")
    .bind(input, output, id).run();
}
