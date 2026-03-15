import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // Lazily create the user in our DB on first request
  const { rows } = await sql`SELECT id FROM users WHERE id = ${userId}`;
  if (rows.length === 0) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;
    const email =
      clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.local`;
    const name = clerkUser.fullName || clerkUser.username || "Challenger";
    const image = clerkUser.imageUrl || null;
    await sql`
      INSERT INTO users (id, name, email, image)
      VALUES (${userId}, ${name}, ${email}, ${image})
      ON CONFLICT (id) DO NOTHING`;
  }

  return userId;
}
