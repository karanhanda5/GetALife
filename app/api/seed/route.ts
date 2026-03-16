import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const challenges = [
  // ─── EASY (10 pts) ─────────────────────────────────────────────────────────
  { title:"Read 10 pages of a book",desc:"Grab any book and read 10 pages. No screens.",d:"easy",cat:"mind",pts:10 },
  { title:"Drink a full glass of water",desc:"Hydrate. Right now. The whole glass.",d:"easy",cat:"health",pts:10 },
  { title:"Step outside for 5 minutes",desc:"Just stand outside. Breathe. That's it.",d:"easy",cat:"outdoors",pts:10 },
  { title:"Stretch for 5 minutes",desc:"Neck, shoulders, back — whatever feels tight.",d:"easy",cat:"health",pts:10 },
  { title:"Text a friend you haven't talked to",desc:"Not a meme. An actual message.",d:"easy",cat:"social",pts:10 },
  { title:"Write down 3 things you're grateful for",desc:"Pen and paper preferred.",d:"easy",cat:"mind",pts:10 },
  { title:"Make your bed",desc:"Start the day with one small win.",d:"easy",cat:"environment",pts:10 },
  { title:"Listen to a full song — eyes closed",desc:"No scrolling. Just listening.",d:"easy",cat:"mind",pts:10 },
  { title:"Tidy your desk for 5 minutes",desc:"Clear the clutter. Clear the mind.",d:"easy",cat:"environment",pts:10 },
  { title:"Eat a piece of fruit",desc:"An actual fruit. Not a gummy.",d:"easy",cat:"health",pts:10 },
  { title:"Look out the window for 2 minutes",desc:"No phone. Just observe the world.",d:"easy",cat:"mind",pts:10 },
  { title:"Take 10 deep breaths",desc:"Slow in, slow out. Reset your nervous system.",d:"easy",cat:"health",pts:10 },
  { title:"Compliment someone in person",desc:"Not online. Face to face or voice to voice.",d:"easy",cat:"social",pts:10 },
  { title:"Water a plant",desc:"If you don't have one, maybe get one today.",d:"easy",cat:"environment",pts:10 },
  { title:"Put your phone in another room for 30 min",desc:"You'll survive. Promise.",d:"easy",cat:"detox",pts:10 },
  { title:"Write a to-do list on paper",desc:"Brain dump everything. Then pick 3.",d:"easy",cat:"mind",pts:10 },
  { title:"Do 10 pushups",desc:"Modified is fine. Just move.",d:"easy",cat:"health",pts:10 },
  { title:"Sit in silence for 3 minutes",desc:"No music, no podcasts, no nothing.",d:"easy",cat:"mind",pts:10 },
  { title:"Doodle or sketch for 5 minutes",desc:"Stick figures count. Let your hand move.",d:"easy",cat:"mind",pts:10 },
  { title:"Go to bed 30 minutes earlier tonight",desc:"Sleep is the OG recovery tool.",d:"easy",cat:"health",pts:10 },
  { title:"Smile at a stranger today",desc:"Eye contact, genuine smile. That's it.",d:"easy",cat:"social",pts:10 },
  { title:"Eat one meal without any screen",desc:"Actually taste your food.",d:"easy",cat:"detox",pts:10 },
  { title:"Open a window and breathe fresh air",desc:"2 minutes. Let the outside in.",d:"easy",cat:"outdoors",pts:10 },
  { title:"Write one sentence about your day",desc:"Just one. Future you will appreciate it.",d:"easy",cat:"mind",pts:10 },
  // ─── MEDIUM (20 pts) ───────────────────────────────────────────────────────
  { title:"Walk outside for 15 minutes",desc:"No destination needed. Just walk.",d:"medium",cat:"outdoors",pts:20 },
  { title:"Call your parents or a family member",desc:"A real phone call. Not a text.",d:"medium",cat:"social",pts:20 },
  { title:"Cook a meal from scratch",desc:"Nothing microwaved. Chop something.",d:"medium",cat:"health",pts:20 },
  { title:"No Instagram today",desc:"Delete it from your home screen if you must.",d:"medium",cat:"detox",pts:20 },
  { title:"Journal for 10 minutes",desc:"Write about your day, your thoughts, anything.",d:"medium",cat:"mind",pts:20 },
  { title:"Leave a genuine compliment on someone's work",desc:"Find something real and say something real.",d:"medium",cat:"social",pts:20 },
  { title:"Do a 15-minute workout",desc:"Bodyweight is fine. YouTube has tons of options.",d:"medium",cat:"health",pts:20 },
  { title:"Read for 30 minutes",desc:"A real book. Or a long-form article. Not tweets.",d:"medium",cat:"mind",pts:20 },
  { title:"Take a different route today",desc:"Walk, drive, commute — change the path.",d:"medium",cat:"outdoors",pts:20 },
  { title:"Spend 20 min on a hobby (no screens)",desc:"Draw, play guitar, knit, build — anything.",d:"medium",cat:"mind",pts:20 },
  { title:"Have a meal with no phone at the table",desc:"Put it away. Taste your food.",d:"medium",cat:"detox",pts:20 },
  { title:"Write a handwritten note to someone",desc:"It doesn't have to be long. Just real.",d:"medium",cat:"social",pts:20 },
  { title:"Do 30 minutes of no social media",desc:"Set a timer. Do something else.",d:"medium",cat:"detox",pts:20 },
  { title:"Meditate for 10 minutes",desc:"Guided or unguided. Just sit with yourself.",d:"medium",cat:"mind",pts:20 },
  { title:"Organize one drawer or shelf",desc:"Just one. The messiest one.",d:"medium",cat:"environment",pts:20 },
  { title:"Try a new recipe",desc:"Something you've never made before.",d:"medium",cat:"health",pts:20 },
  { title:"Watch the sunset",desc:"Find a spot. No photos needed.",d:"medium",cat:"outdoors",pts:20 },
  { title:"Have a 15-min conversation — no phones",desc:"Real talk with a real person.",d:"medium",cat:"social",pts:20 },
  { title:"Clean your browser tabs & unsubscribe from 5 emails",desc:"Digital hygiene matters.",d:"medium",cat:"detox",pts:20 },
  { title:"Sit in a park or green space for 20 minutes",desc:"No agenda. Just be there.",d:"medium",cat:"outdoors",pts:20 },
  { title:"Do 20 minutes of yoga or stretching",desc:"Follow a video or just flow.",d:"medium",cat:"health",pts:20 },
  { title:"Reconnect with an old friend",desc:"Send a voice note or real message.",d:"medium",cat:"social",pts:20 },
  { title:"Spend 20 min tidying your living space",desc:"A cleaner space = a clearer head.",d:"medium",cat:"environment",pts:20 },
  { title:"Cook breakfast from scratch",desc:"Eggs, toast, fruit — no cereal from a bag.",d:"medium",cat:"health",pts:20 },
  { title:"Leave your phone at home for 1 errand",desc:"Go to the shop, the post, wherever — solo.",d:"medium",cat:"detox",pts:20 },
  // ─── HARD (50 pts) ─────────────────────────────────────────────────────────
  { title:"No social media for the entire day",desc:"All of them. The whole day. You can do this.",d:"hard",cat:"detox",pts:50 },
  { title:"Go for a 1-hour walk",desc:"Long walk. Let your mind wander.",d:"hard",cat:"outdoors",pts:50 },
  { title:"Write a 500-word journal entry",desc:"Go deep. Reflect on something real.",d:"hard",cat:"mind",pts:50 },
  { title:"Spend 2 hours doing something creative",desc:"No tutorials. Just make something.",d:"hard",cat:"mind",pts:50 },
  { title:"Have a phone-free evening (6pm onwards)",desc:"Lock it in a drawer if you have to.",d:"hard",cat:"detox",pts:50 },
  { title:"Exercise for 45 minutes",desc:"Run, gym, swim, dance — your choice.",d:"hard",cat:"health",pts:50 },
  { title:"Visit someone in person",desc:"Not FaceTime. Show up.",d:"hard",cat:"social",pts:50 },
  { title:"Volunteer or help a stranger",desc:"Give your time to someone who needs it.",d:"hard",cat:"social",pts:50 },
  { title:"Learn a new skill for 1 hour (offline)",desc:"Cooking, instrument, origami — anything.",d:"hard",cat:"mind",pts:50 },
  { title:"No screens after 8pm",desc:"Read, talk, think. Screens off.",d:"hard",cat:"detox",pts:50 },
  { title:"Plan and cook dinner for someone",desc:"The whole thing: plan, shop, cook, serve.",d:"hard",cat:"social",pts:50 },
  { title:"Spend a full hour in nature",desc:"Park, trail, beach, garden — just be there.",d:"hard",cat:"outdoors",pts:50 },
  { title:"Declutter 20 items from your space",desc:"If you haven't used it in 6 months, let go.",d:"hard",cat:"environment",pts:50 },
  { title:"Write and send a letter by hand",desc:"Find an envelope, find a stamp, mail it.",d:"hard",cat:"social",pts:50 },
  { title:"Do a 1-hour phone-free morning",desc:"No phone until 10am. See how it feels.",d:"hard",cat:"detox",pts:50 },
  { title:"Run or jog for 30 minutes",desc:"Outside. Not a treadmill.",d:"hard",cat:"outdoors",pts:50 },
];

export async function GET() {
  // ── Create tables ──────────────────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT, email TEXT UNIQUE NOT NULL, email_verified TIMESTAMPTZ,
    image TEXT, password_hash TEXT, current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0, total_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now())`;

  await sql`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, provider TEXT NOT NULL, provider_account_id TEXT NOT NULL,
    refresh_token TEXT, access_token TEXT, expires_at INT,
    token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT,
    UNIQUE(provider, provider_account_id))`;

  await sql`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL)`;

  await sql`CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL, token TEXT UNIQUE NOT NULL,
    expires TIMESTAMPTZ NOT NULL, PRIMARY KEY (identifier, token))`;

  await sql`CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'easy',
    category TEXT, points INT NOT NULL DEFAULT 10)`;

  await sql`CREATE TABLE IF NOT EXISTS daily_challenges (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INT NOT NULL REFERENCES challenges(id),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT false, completed_at TIMESTAMPTZ,
    proof_url TEXT,
    UNIQUE(user_id, challenge_id, assigned_date))`;

  // ── Migrations for existing tables ────────────────────────────────────────
  await sql`ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS proof_url TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_streak INT DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_full_streak INT DEFAULT 0`;

  await sql`CREATE INDEX IF NOT EXISTS idx_dc_user_date ON daily_challenges(user_id, assigned_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_points ON users(total_points DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_full_streak ON users(full_streak DESC)`;

  // ── Seed challenges ────────────────────────────────────────────────────────
  let inserted = 0;
  for (const c of challenges) {
    const result = await sql`
      INSERT INTO challenges (title, description, difficulty, category, points)
      VALUES (${c.title}, ${c.desc}, ${c.d}, ${c.cat}, ${c.pts})
      ON CONFLICT DO NOTHING`;
    if (result.rowCount && result.rowCount > 0) inserted++;
  }

  return NextResponse.json({
    ok: true,
    tablesCreated: true,
    challengesInserted: inserted,
    totalChallenges: challenges.length,
  });
}
