import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// Pick one challenge of a given difficulty, avoiding repeats from the last 7 days
async function pickChallenge(userId: string, difficulty: string) {
  const { rows } = await sql`
    SELECT id FROM challenges
    WHERE difficulty = ${difficulty}
      AND id NOT IN (
        SELECT challenge_id FROM daily_challenges
        WHERE user_id = ${userId}
          AND assigned_date >= CURRENT_DATE - INTERVAL '7 days'
          AND assigned_date < CURRENT_DATE
      )
    ORDER BY random() LIMIT 1`;

  if (rows.length > 0) return rows[0];

  // Fallback: any challenge of this difficulty
  const { rows: fallback } = await sql`
    SELECT id FROM challenges WHERE difficulty = ${difficulty} ORDER BY random() LIMIT 1`;
  return fallback[0] ?? null;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rows: existing } = await sql`
    SELECT dc.id, dc.completed, dc.completed_at, dc.proof_url,
           c.id as challenge_id, c.title, c.description,
           c.difficulty, c.category, c.points
    FROM daily_challenges dc
    JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.user_id = ${userId} AND dc.assigned_date = CURRENT_DATE
    ORDER BY CASE c.difficulty WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`;

  if (existing.length > 0) {
    return NextResponse.json({ challenges: existing, date: new Date().toISOString().split("T")[0] });
  }

  const [easy, medium, hard] = await Promise.all([
    pickChallenge(userId, "easy"),
    pickChallenge(userId, "medium"),
    pickChallenge(userId, "hard"),
  ]);

  for (const pick of [easy, medium, hard].filter(Boolean)) {
    await sql`
      INSERT INTO daily_challenges (user_id, challenge_id, assigned_date)
      VALUES (${userId}, ${pick.id}, CURRENT_DATE) ON CONFLICT DO NOTHING`;
  }

  const { rows: fresh } = await sql`
    SELECT dc.id, dc.completed, dc.completed_at, dc.proof_url,
           c.id as challenge_id, c.title, c.description,
           c.difficulty, c.category, c.points
    FROM daily_challenges dc
    JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.user_id = ${userId} AND dc.assigned_date = CURRENT_DATE
    ORDER BY CASE c.difficulty WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`;

  return NextResponse.json({ challenges: fresh, date: new Date().toISOString().split("T")[0] });
}
