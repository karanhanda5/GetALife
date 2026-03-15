import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rows: userRows } = await sql`
    SELECT name, email, image, current_streak, longest_streak, total_points, created_at
    FROM users WHERE id = ${userId}`;

  if (userRows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { rows: history } = await sql`
    SELECT c.title, c.difficulty, c.points, dc.completed_at, dc.assigned_date
    FROM daily_challenges dc JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.user_id = ${userId} AND dc.completed = true
    ORDER BY dc.completed_at DESC LIMIT 30`;

  return NextResponse.json({ user: userRows[0], history });
}
