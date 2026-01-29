import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { OrderWithItems, Order, OrderItem } from '@/types';
import { generateOrdersCsv, generateCsvFilename } from '@/lib/utils/csv';

export async function GET(request: NextRequest) {
  try {
    // Get bartender key from headers or query params
    const bartenderKey =
      request.headers.get('x-bartender-key') || request.nextUrl.searchParams.get('key');
    const sessionAuth = request.nextUrl.searchParams.get('auth') === 'session';

    // Validate authorization - accept either bartender key or session auth
    if ((!bartenderKey || bartenderKey.length === 0) && !sessionAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optional date range filters
    const fromDate = request.nextUrl.searchParams.get('from');
    const toDate = request.nextUrl.searchParams.get('to');

    // Build query for orders (completed and cancelled)
    let ordersQuery = supabaseAdmin
      .from('orders')
      .select('*')
      .in('status', ['completed', 'cancelled']); // Export completed and cancelled orders

    // Apply date filters if provided
    if (fromDate) {
      ordersQuery = ordersQuery.gte('created_at', fromDate);
    }
    if (toDate) {
      ordersQuery = ordersQuery.lte('created_at', toDate);
    }

    const { data: ordersData, error: ordersError } = await ordersQuery.order('created_at', {
      ascending: true,
    });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (!ordersData || ordersData.length === 0) {
      return NextResponse.json({ error: 'No completed or cancelled orders found' }, { status: 404 });
    }

    // Fetch all order items for these orders
    const orderIds = ordersData.map((o) => o.id);
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
    }

    // Combine orders with their items
    const ordersWithItems: OrderWithItems[] = ordersData.map((order: Order) => ({
      ...order,
      order_items: (itemsData || []).filter((item: OrderItem) => item.order_id === order.id),
    }));

    // Generate CSV content
    const csvContent = generateOrdersCsv(ordersWithItems);

    // Generate filename
    const filename = generateCsvFilename('the_connersseur_orders');

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
