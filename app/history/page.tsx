'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems, PopularDrink } from '@/types';
import { getPrivacyName, formatDateTime } from '@/lib/utils/formatters';

export default function HistoryPage() {
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([]);
  const [popularDrinks, setPopularDrinks] = useState<PopularDrink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetch recent orders (last 50, completed only)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(50);

        if (ordersError) throw ordersError;

        // Fetch all order items for those orders
        const orderIds = (ordersData || []).map((o) => o.id);
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        // Combine orders with items
        const ordersWithItems: OrderWithItems[] = (ordersData || []).map((order) => ({
          ...order,
          order_items: (itemsData || []).filter((item) => item.order_id === order.id),
        }));

        setRecentOrders(ordersWithItems);

        // Calculate popular drinks
        const drinkCounts: Record<string, { count: number; isCustom: boolean }> = {};

        (itemsData || []).forEach((item) => {
          if (item.is_custom) {
            // Group all custom drinks together
            const key = 'Custom Request';
            drinkCounts[key] = drinkCounts[key] || { count: 0, isCustom: true };
            drinkCounts[key].count += item.quantity;
          } else {
            const key = item.item_name;
            drinkCounts[key] = drinkCounts[key] || { count: 0, isCustom: false };
            drinkCounts[key].count += item.quantity;
          }
        });

        const popular: PopularDrink[] = Object.entries(drinkCounts)
          .map(([name, data]) => ({
            item_name: name,
            order_count: data.count,
            is_custom: data.isCustom,
          }))
          .sort((a, b) => b.order_count - a.order_count)
          .slice(0, 10);

        setPopularDrinks(popular);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="text-burgundy text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-burgundy hover:text-burgundy-dark">
            ← Back to Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-burgundy mb-8 text-center">
          Community Order History
        </h1>

        {/* Most Popular Drinks */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-burgundy mb-4">
            🏆 Most Popular Drinks
          </h2>
          {popularDrinks.length === 0 ? (
            <p className="text-gray-600">No orders yet!</p>
          ) : (
            <div className="space-y-3">
              {popularDrinks.map((drink, index) => (
                <div
                  key={drink.item_name}
                  className="flex items-center justify-between bg-cream-light rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-burgundy w-8">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-burgundy-dark">
                        {drink.item_name}
                        {drink.is_custom && (
                          <span className="ml-2 text-xs bg-gold text-burgundy-dark px-2 py-1 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-700">
                    {drink.order_count} {drink.order_count === 1 ? 'order' : 'orders'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-burgundy mb-4">
            📋 Recent Orders
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-600">No completed orders yet!</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-cream-light transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-burgundy">
                        {getPrivacyName(order.guest_name)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(order.created_at)}
                      </div>
                    </div>
                    {order.group_name && (
                      <div className="text-sm text-gray-600 italic">
                        {order.group_name}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="text-sm text-gray-700">
                        <span className="font-medium text-burgundy-dark">
                          {item.quantity}x
                        </span>{' '}
                        {item.is_custom ? 'Custom Request' : item.item_name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
