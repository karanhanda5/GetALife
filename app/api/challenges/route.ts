import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rows: existing } = await sql`
    SELECT dc.id, dc.completed, dc.completed_at,
           c.id as challenge_id, c.title, c.description,
           c.difficulty, c.category, c.points
    FROM daily_challenges dc
    JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.user_id = ${userId} AND dc.assigned_date = CURRENT_DATE
    ORDER BY c.difficulty ASC`;

  if (existing.length > 0) {
    return NextResponse.json({ challenges: existing, date: new Date().toISOString().split("T")[0] });
  }

  const { rows: easy } = await sql`SELECT id FROM challenges WHERE difficulty = 'easy' ORDER BY random() LIMIT 1`;
  const { rows: medium } = await sql`SELECT id FROM challenges WHERE difficulty = 'medium' ORDER BY random() LIMIT 1`;
  const { rows: hard } = await sql`SELECT id FROM challenges WHERE difficulty = 'hard' ORDER BY random() LIMIT 1`;

  const picks = [easy[0], medium[0], hard[0]].filter(Boolean);
  for (const pick of picks) {
    await sql`INSERT INTO daily_challenges (user_id, challenge_id, assigned_date) VALUES (${userId}, ${pick.id}, CURRENT_DATE) ON CONFLICT DO NOTHING`;
  }

  const { rows: fresh } = await sql`
    SELECT dc.id, dc.completed, dc.completed_at,
           c.id as challenge_id, c.title, c.description,
           c.difficulty, c.category, c.points
    FROM daily_challenges dc
    JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.user_id = ${userId} AND dc.assigned_date = CURRENT_DATE
    ORDER BY c.difficulty ASC`;

  return NextResponse.json({ challenges: fresh, date: new Date().toISOString().split("T")[0] });
}
