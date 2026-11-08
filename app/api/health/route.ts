import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Never cache: every call must actually reach the database.
export const dynamic = 'force-dynamic';

// Runs a tiny real query against Supabase. Called daily by the Vercel cron in
// vercel.json so the free-tier project never goes idle long enough to be paused
// (Supabase pauses free projects after ~7 days of inactivity). Also safe to point
// an uptime monitor at: returns 200 when the DB is reachable, 503 when it is not.
export async function GET() {
  const started = Date.now();
  try {
    // Read a real row (not a HEAD/count request): HEAD requests can report success
    // even when the table is unreadable, e.g. right after a project restore.
    const { data, error } = await supabase.from('menu_items').select('id').limit(1);

    if (error || !data || data.length === 0) {
      console.error('Health check: database query failed:', error);
      return NextResponse.json(
        { status: 'error', database: 'unreachable' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      database: 'reachable',
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check: unexpected error:', error);
    return NextResponse.json(
      { status: 'error', database: 'unreachable' },
      { status: 503 }
    );
  }
}
