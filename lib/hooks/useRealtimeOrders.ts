'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems, Order, OrderItem } from '@/types';
import { DateFilter, getDateRange } from '@/lib/utils/dateFilters';

export function useRealtimeOrders(dateFilter: DateFilter = 'week') {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial orders with items
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Apply date filtering
      const { start, end } = getDateRange(dateFilter);
      let query = supabase.from('orders').select('*');

      if (start) {
        query = query.gte('created_at', start.toISOString());
      }
      if (end) {
        query = query.lte('created_at', end.toISOString());
      }

      const { data: ordersData, error: ordersError } = await query.order('created_at', {
        ascending: false,
      });

      if (ordersError) throw ordersError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Combine orders with their items
      const ordersWithItems: OrderWithItems[] = (ordersData || []).map((order: Order) => ({
        ...order,
        order_items: (itemsData || []).filter((item: OrderItem) => item.order_id === order.id),
      }));

      setOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [dateFilter]);

  return { orders, loading, error, refetch: fetchOrders };
}
