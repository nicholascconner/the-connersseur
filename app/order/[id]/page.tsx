'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems, OrderStatus } from '@/types';
import { formatDateTime } from '@/lib/utils/formatters';

export default function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to real-time updates for this order
    const channel = supabase
      .channel(`order_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { text: 'New Order', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'in_progress':
        return { text: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="text-burgundy text-xl">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error || 'Order not found'}</div>
          <Link
            href="/"
            className="inline-block bg-burgundy text-white py-2 px-6 rounded-lg hover:bg-burgundy-dark transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order.status);

  return (
    <div className="min-h-screen bg-cream-light pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-burgundy hover:text-burgundy-dark">
            ← Back to Menu
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-burgundy mb-2">Order Confirmation</h1>
          <p className="text-gray-600 mb-6">Thank you, {order.guest_name}!</p>

          {/* Status Badge */}
          <div className="mb-6">
            <div className={`inline-block px-6 py-3 rounded-lg border-2 ${statusDisplay.color} font-bold text-lg`}>
              {statusDisplay.text}
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-6">
            <div className="text-sm text-gray-600">
              Order ID: {order.id.slice(0, 8)}
            </div>
            <div className="text-sm text-gray-600">
              Placed: {formatDateTime(order.created_at)}
            </div>
            {order.group_name && (
              <div className="text-sm text-gray-600">
                Group: {order.group_name}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-xl font-semibold text-burgundy mb-4">Your Order</h2>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="bg-cream-light rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-burgundy-dark">
                      {item.quantity}x
                    </span>
                    <span className="font-medium">
                      {item.item_name}
                      {item.is_custom && (
                        <span className="ml-2 text-xs bg-gold text-burgundy-dark px-2 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-sm text-gray-700 mt-2 ml-8 italic">
                      &quot;{item.notes}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status Message */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              {order.status === 'new' && '🎉 Your order has been received! The bartender will start preparing it soon.'}
              {order.status === 'in_progress' && '🍹 Your drinks are being prepared!'}
              {order.status === 'completed' && '✅ Your order is ready! Enjoy!'}
              {order.status === 'cancelled' && '❌ This order was cancelled.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
