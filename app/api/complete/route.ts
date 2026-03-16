import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const dcId = body.dailyChallengeId;
  const proofUrl: string | undefined = body.proofUrl;

  if (!dcId) return NextResponse.json({ error: "Missing dailyChallengeId" }, { status: 400 });
  if (!proofUrl) return NextResponse.json({ error: "A proof photo is required to complete a challenge" }, { status: 400 });

  const { rows: updated } = await sql`
    UPDATE daily_challenges
    SET completed = true, completed_at = now(), proof_url = ${proofUrl}
    WHERE id = ${dcId} AND user_id = ${userId} AND completed = false
    RETURNING *`;

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found or already completed" }, { status: 404 });
  }

  // Points for this challenge
  const { rows: chalRows } = await sql`SELECT points FROM challenges WHERE id = ${updated[0].challenge_id}`;
  let pointsEarned = chalRows[0]?.points ?? 10;

  // Check if all today's challenges are now done
  const { rows: todayAll } = await sql`
    SELECT completed FROM daily_challenges WHERE user_id = ${userId} AND assigned_date = CURRENT_DATE`;
  const allDone = todayAll.length > 0 && todayAll.every((r) => Boolean(r["completed"]));
  if (allDone) pointsEarned += 30; // bonus for completing all 3

  // ── Full-completion streak (days where ALL 3 challenges were completed) ────
  const { rows: fullDays } = await sql`
    SELECT assigned_date
    FROM daily_challenges
    WHERE user_id = ${userId}
    GROUP BY assigned_date
    HAVING COUNT(*) >= 3 AND COUNT(*) FILTER (WHERE completed = true) = COUNT(*)
    ORDER BY assigned_date DESC`;

  let fullStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < fullDays.length; i++) {
    const d = new Date(fullDays[i].assigned_date);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (d.getTime() === expected.getTime()) fullStreak++;
    else break;
  }

  // ── Any-completion streak (at least 1 challenge done per day) ────────────
  const { rows: streakDays } = await sql`
    SELECT DISTINCT assigned_date FROM daily_challenges
    WHERE user_id = ${userId} AND completed = true
    ORDER BY assigned_date DESC`;

  let currentStreak = 0;
  for (let i = 0; i < streakDays.length; i++) {
    const d = new Date(streakDays[i].assigned_date);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (d.getTime() === expected.getTime()) currentStreak++;
    else break;
  }

  await sql`
    UPDATE users SET
      total_points = total_points + ${pointsEarned},
      current_streak = ${currentStreak},
      longest_streak = GREATEST(longest_streak, ${currentStreak}),
      full_streak = ${fullStreak},
      longest_full_streak = GREATEST(COALESCE(longest_full_streak, 0), ${fullStreak})
    WHERE id = ${userId}`;

  return NextResponse.json({ success: true, pointsEarned, bonusAwarded: allDone, currentStreak, fullStreak });
}
