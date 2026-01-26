'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealtimeOrders } from '@/lib/hooks/useRealtimeOrders';
import OrderCard from '@/components/OrderCard';
import { OrderWithItems, OrderStatus } from '@/types';
import { isToday } from '@/lib/utils/formatters';

function BartenderDashboardContent() {
  const searchParams = useSearchParams();
  const bartenderKey = searchParams.get('key');
  const { orders, loading, error } = useRealtimeOrders();
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check authentication
  const isAuthorized = bartenderKey && bartenderKey.length > 0;

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
  }, []);

  // Detect new orders and trigger notification
  useEffect(() => {
    const newOrders = orders.filter((o) => o.status === 'new');
    const newOrderCount = newOrders.length;

    if (previousOrderCount > 0 && newOrderCount > previousOrderCount) {
      // New order arrived!
      setShowToast(true);

      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error('Error playing sound:', e));
      }

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    }

    setPreviousOrderCount(newOrderCount);
  }, [orders, previousOrderCount]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          bartender_key: bartenderKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h1>
          <p className="text-gray-600">
            You need a valid key to access the bartender dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="text-burgundy text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center px-4">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  // Filter orders by status
  const newOrders = orders.filter((o) => o.status === 'new');
  const inProgressOrders = orders.filter((o) => o.status === 'in_progress');
  const completedOrders = orders.filter((o) => o.status === 'completed' && isToday(o.created_at));

  return (
    <div className="min-h-screen bg-cream-light pb-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl animate-bounce">
          <div className="text-lg font-bold">🔔 New Order Received!</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-burgundy text-white p-6 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-center">Bartender Dashboard</h1>
        <p className="text-center text-cream mt-2">The Connersseur Order Queue</p>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Orders Column */}
          <div>
            <div className="bg-yellow-400 text-burgundy-dark px-4 py-3 rounded-t-lg font-bold text-lg flex items-center justify-between">
              <span>New Orders</span>
              <span className="bg-white rounded-full w-8 h-8 flex items-center justify-center">
                {newOrders.length}
              </span>
            </div>
            <div className="bg-yellow-50 rounded-b-lg p-4 min-h-[400px]">
              {newOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No new orders</p>
              ) : (
                newOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <div className="bg-blue-400 text-white px-4 py-3 rounded-t-lg font-bold text-lg flex items-center justify-between">
              <span>In Progress</span>
              <span className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                {inProgressOrders.length}
              </span>
            </div>
            <div className="bg-blue-50 rounded-b-lg p-4 min-h-[400px]">
              {inProgressOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders in progress</p>
              ) : (
                inProgressOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed (Today) Column */}
          <div>
            <div className="bg-green-400 text-white px-4 py-3 rounded-t-lg font-bold text-lg flex items-center justify-between">
              <span>Completed Today</span>
              <span className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center">
                {completedOrders.length}
              </span>
            </div>
            <div className="bg-green-50 rounded-b-lg p-4 min-h-[400px]">
              {completedOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No completed orders today</p>
              ) : (
                completedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BartenderDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="text-burgundy text-xl">Loading...</div>
      </div>
    }>
      <BartenderDashboardContent />
    </Suspense>
  );
}
