import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { rows } = await sql`
    SELECT name, image, current_streak, longest_streak, total_points
    FROM users WHERE total_points > 0
    ORDER BY total_points DESC LIMIT 50`;
  return NextResponse.json({ leaderboard: rows });
}
