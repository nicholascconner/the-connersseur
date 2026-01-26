import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ names: [] });
    }

    // Get distinct guest names that match the search query
    const { data, error } = await supabase
      .from('orders')
      .select('guest_name')
      .ilike('guest_name', `${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching guest names:', error);
      return NextResponse.json({ error: 'Failed to search names' }, { status: 500 });
    }

    // Extract unique names
    const uniqueNames = Array.from(
      new Set((data || []).map((row: { guest_name: string }) => row.guest_name))
    );

    return NextResponse.json({ names: uniqueNames });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
