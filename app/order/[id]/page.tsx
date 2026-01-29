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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { text: 'New Order', class: 'badge-new' };
      case 'in_progress':
        return { text: 'In Progress', class: 'badge-progress' };
      case 'completed':
        return { text: 'Completed', class: 'badge-completed' };
      case 'cancelled':
        return { text: 'Cancelled', class: 'badge-cancelled' };
      default:
        return { text: status, class: 'bg-gray-200 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-burgundy text-xl font-bold">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-static p-12 text-center">
          <div className="text-red-600 text-xl mb-6 font-bold">{error || 'Order not found'}</div>
          <Link href="/" className="btn-pill-burgundy">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="header-gradient py-8 px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white font-semibold transition-colors">
            ← Back to Menu
          </Link>
          <h1 className="text-4xl font-extrabold text-gold mt-4" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            Order Confirmation
          </h1>
          <p className="text-white/80 mt-2 font-semibold">Thank you, {order.guest_name}!</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6">
        <div className="card-static p-8">
          {/* Status Badge */}
          <div className="mb-8 text-center">
            <span className={`status-badge ${statusBadge.class} text-lg px-8 py-3`}>
              {statusBadge.text}
            </span>
          </div>

          {/* Order Details */}
          <div className="mb-8 text-center">
            <span className="order-number-badge text-lg px-6 py-3">
              #{order.order_number}
            </span>
            <div className="text-sm text-gray-400 font-semibold mt-4">
              Placed: {formatDateTime(order.created_at)}
            </div>
            {order.group_name && (
              <span className="group-badge mt-4 inline-block">
                {order.group_name}
              </span>
            )}
          </div>

          {/* Order Items */}
          <div>
            <div className="column-header mb-6">
              Your Order
            </div>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="drink-item">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {item.quantity}x {item.item_name}
                    </span>
                    {item.is_custom && (
                      <span className="text-xs bg-gold text-burgundy-dark px-2 py-0.5 rounded-full font-bold">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status Message */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold">
              {order.status === 'new' && 'Your order has been received! The bartender will start preparing it soon.'}
              {order.status === 'in_progress' && 'Your drinks are being prepared!'}
              {order.status === 'completed' && 'Your order is ready! Enjoy!'}
              {order.status === 'cancelled' && 'This order was cancelled.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
