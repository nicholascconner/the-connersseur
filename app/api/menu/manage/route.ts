import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET - Fetch ALL menu items (active and inactive) for management UI
// Uses supabaseAdmin to bypass RLS policy that restricts reads to is_active = true
export async function GET(request: NextRequest) {
  const isSessionAuth = request.nextUrl.searchParams.get('auth') === 'session';

  if (!isSessionAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Toggle is_active for one or more menu items
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate auth (same session_auth pattern as orders/[id]/route.ts)
    const isSessionAuth = body.session_auth === true;

    if (!isSessionAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Body shape: { items: [{ id: string, is_active: boolean }], session_auth: boolean }
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    for (const item of body.items) {
      if (!item.id || typeof item.is_active !== 'boolean') {
        return NextResponse.json({ error: 'Each item must have id and is_active' }, { status: 400 });
      }
    }

    // Update each item
    const results = await Promise.all(
      body.items.map((item: { id: string; is_active: boolean }) =>
        supabaseAdmin
          .from('menu_items')
          .update({ is_active: item.is_active })
          .eq('id', item.id)
          .select()
          .single()
      )
    );

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Error updating menu items:', errors.map(e => e.error));
      return NextResponse.json({ error: 'Some updates failed' }, { status: 500 });
    }

    return NextResponse.json({
      updated: results.map(r => r.data),
      count: results.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
