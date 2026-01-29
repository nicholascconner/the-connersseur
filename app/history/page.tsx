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
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(50);

        if (ordersError) throw ordersError;

        const orderIds = (ordersData || []).map((o) => o.id);
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        const ordersWithItems: OrderWithItems[] = (ordersData || []).map((order) => ({
          ...order,
          order_items: (itemsData || []).filter((item) => item.order_id === order.id),
        }));

        setRecentOrders(ordersWithItems);

        const drinkCounts: Record<string, { count: number; isCustom: boolean }> = {};

        (itemsData || []).forEach((item) => {
          if (item.is_custom) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-burgundy text-xl font-bold">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="header-gradient py-8 px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white font-semibold transition-colors">
            ← Back to Menu
          </Link>
          <h1 className="text-4xl font-extrabold text-gold mt-4" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            Community Order History
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6">
        {/* Most Popular Drinks */}
        <div className="card-static p-8 mb-8">
          <div className="column-header mb-6">
            Most Popular Drinks
          </div>
          {popularDrinks.length === 0 ? (
            <p className="text-gray-500 font-semibold">No orders yet!</p>
          ) : (
            <div className="space-y-4">
              {popularDrinks.map((drink, index) => (
                <div
                  key={drink.item_name}
                  className="drink-item flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-extrabold text-burgundy w-10">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {drink.item_name}
                        {drink.is_custom && (
                          <span className="ml-2 text-xs bg-gold text-burgundy-dark px-2 py-1 rounded-full font-bold">
                            CUSTOM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-burgundy">
                    {drink.order_count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card-static p-8">
          <div className="column-header mb-6">
            Recent Orders
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 font-semibold">No completed orders yet!</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-extrabold text-gray-800 text-lg">
                        {getPrivacyName(order.guest_name)}
                      </div>
                      <div className="text-sm text-gray-400 font-semibold">
                        {formatDateTime(order.created_at)}
                      </div>
                    </div>
                    {order.group_name && (
                      <span className="group-badge">
                        {order.group_name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="drink-item">
                        <span className="font-bold text-gray-800">
                          {item.quantity}x
                        </span>{' '}
                        <span className="text-gray-600">
                          {item.is_custom ? 'Custom Request' : item.item_name}
                        </span>
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
