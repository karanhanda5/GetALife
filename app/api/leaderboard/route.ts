import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { rows } = await sql`
    SELECT
      name,
      image,
      current_streak,
      COALESCE(full_streak, 0)         AS full_streak,
      COALESCE(longest_full_streak, 0) AS longest_full_streak,
      total_points
    FROM users
    WHERE total_points > 0 OR COALESCE(full_streak, 0) > 0
    ORDER BY
      COALESCE(full_streak, 0) DESC,
      total_points DESC
    LIMIT 50`;

  return NextResponse.json({ leaderboard: rows });
}
