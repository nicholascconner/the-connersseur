import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateOrderRequest } from '@/types';
import { sendBartenderNewOrderSMS, sendGuestOrderConfirmedSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate request
    if (!body.guest_name || !body.phone_number || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Guest name, phone number, and items are required' },
        { status: 400 }
      );
    }

    // Validate phone number (at least 10 digits)
    const phoneDigits = body.phone_number.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        guest_name: body.guest_name.trim(),
        group_name: body.group_name?.trim() || null,
        phone_number: body.phone_number.trim(),
        status: 'new',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id || null,
      item_name: item.item_name.trim(),
      quantity: item.quantity,
      notes: item.notes?.trim() || null,
      is_custom: item.is_custom || false,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback: delete the order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // Send SMS notifications (fire-and-forget)
    sendBartenderNewOrderSMS({
      order_number: order.order_number,
      guest_name: order.guest_name,
      items: body.items.map((i) => ({ item_name: i.item_name, quantity: i.quantity })),
    });
    sendGuestOrderConfirmedSMS(order.phone_number, order.order_number);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
