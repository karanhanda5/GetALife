import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const dcId = body.dailyChallengeId;
  if (!dcId) return NextResponse.json({ error: "Missing dailyChallengeId" }, { status: 400 });

  const { rows: updated } = await sql`
    UPDATE daily_challenges SET completed = true, completed_at = now()
    WHERE id = ${dcId} AND user_id = ${userId} AND completed = false
    RETURNING *`;

  if (updated.length === 0) return NextResponse.json({ error: "Not found or already completed" }, { status: 404 });

  const { rows: chalRows } = await sql`SELECT points FROM challenges WHERE id = ${updated[0].challenge_id}`;
  let pointsEarned = chalRows[0]?.points ?? 10;

  const { rows: todayAll } = await sql`
    SELECT completed FROM daily_challenges WHERE user_id = ${userId} AND assigned_date = CURRENT_DATE`;
  const allDone = todayAll.length > 0 && todayAll.every((r: any) => r.completed);
  if (allDone) pointsEarned += 30;

  const { rows: streakDays } = await sql`
    SELECT DISTINCT assigned_date FROM daily_challenges
    WHERE user_id = ${userId} AND completed = true
    ORDER BY assigned_date DESC`;

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < streakDays.length; i++) {
    const d = new Date(streakDays[i].assigned_date);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (d.getTime() === expected.getTime()) currentStreak++;
    else break;
  }

  await sql`
    UPDATE users SET total_points = total_points + ${pointsEarned},
    current_streak = ${currentStreak},
    longest_streak = GREATEST(longest_streak, ${currentStreak})
    WHERE id = ${userId}`;

  return NextResponse.json({ success: true, pointsEarned, bonusAwarded: allDone, currentStreak });
}
