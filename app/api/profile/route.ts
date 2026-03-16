import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rows: userRows } = await sql`
    SELECT name, email, image, current_streak, longest_streak, total_points,
           COALESCE(full_streak, 0)         AS full_streak,
           COALESCE(longest_full_streak, 0) AS longest_full_streak,
           bio, avatar_url, created_at
    FROM users WHERE id = ${userId}`;

  if (userRows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { rows: history } = await sql`
    SELECT c.title, c.difficulty, c.points, dc.completed_at, dc.assigned_date
    FROM daily_challenges dc JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.user_id = ${userId} AND dc.completed = true
    ORDER BY dc.completed_at DESC LIMIT 30`;

  return NextResponse.json({ user: userRows[0], history });
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // name: only update if non-empty (NULLIF prevents blanking it out)
  const name = body.name?.trim() ?? null;
  // bio: always update — null/empty clears it, string sets it
  const bio: string | null = body.bio?.trim() || null;

  await sql`
    UPDATE users
    SET
      name = COALESCE(NULLIF(${name ?? ""}, ''), name),
      bio  = ${bio}
    WHERE id = ${userId}`;

  // avatar_url: only update when the client explicitly sends the field
  // (so not sending it at all keeps the existing value)
  if ("avatar_url" in body) {
    const avatar: string | null = body.avatar_url ?? null;
    await sql`UPDATE users SET avatar_url = ${avatar} WHERE id = ${userId}`;
  }

  return NextResponse.json({ success: true });
}
