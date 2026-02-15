'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarqueeLogo from '@/components/MarqueeLogo';
import FilterDropdown from '@/components/FilterDropdown';
import { useRealtimeOrders } from '@/lib/hooks/useRealtimeOrders';
import OrderCard from '@/components/OrderCard';
import StatsCard from '@/components/StatsCard';
import { OrderStatus } from '@/types';
import { DateFilter, getFilterLabel } from '@/lib/utils/dateFilters';

function BartenderDashboardContent() {
  const searchParams = useSearchParams();
  const bartenderKey = searchParams.get('key');

  // Date filter state with localStorage persistence
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bartender_date_filter');
      return (stored as DateFilter) || 'week';
    }
    return 'week';
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const { orders, loading, error } = useRealtimeOrders(dateFilter);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persist date filter to localStorage
  useEffect(() => {
    localStorage.setItem('bartender_date_filter', dateFilter);
  }, [dateFilter]);

  // Check if already authenticated via sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = sessionStorage.getItem('bartender_authenticated');
      if (authenticated === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'connerseur') {
      sessionStorage.setItem('bartender_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
      setPasswordInput('');
    }
  };

  // Check authentication (old URL key OR new session auth)
  const isAuthorized = (bartenderKey && bartenderKey.length > 0) || isAuthenticated;

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.wav');
  }, []);

  // Detect new orders and trigger notification
  useEffect(() => {
    const newOrders = orders.filter((o) => o.status === 'new');
    const newOrderCount = newOrders.length;

    if (previousOrderCount > 0 && newOrderCount > previousOrderCount) {
      setShowToast(true);

      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error('Error playing sound:', e));
      }

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

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
          session_auth: !bartenderKey,
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

  const handleExportOrders = async () => {
    try {
      const url = bartenderKey
        ? `/api/exports/orders?key=${encodeURIComponent(bartenderKey)}`
        : `/api/exports/orders?auth=session`;

      window.open(url, '_blank');
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert('Failed to export orders');
    }
  };

  const handleToggleSelect = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) {
      alert('No orders selected');
      return;
    }

    if (!confirm(`Are you sure you want to ${newStatus} ${selectedOrders.size} order(s)?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedOrders).map((orderId) =>
          fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: newStatus,
              bartender_key: bartenderKey,
              session_auth: !bartenderKey,
            }),
          })
        )
      );

      setSelectedOrders(new Set());
      setBulkActionMode(false);
    } catch (err) {
      console.error('Error updating orders:', err);
      alert('Failed to update some orders');
    }
  };

  // Login Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full">
          <div className="text-center mb-6 sm:mb-8">
            <MarqueeLogo size="medium" />
            <p className="text-gray-600 font-semibold mt-3 sm:mt-4">Bartender Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4 sm:mb-6">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-gold focus:outline-none font-semibold text-base sm:text-lg"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-semibold text-sm sm:text-base">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="btn-pill-burgundy w-full text-base sm:text-lg"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <Link href="/" className="text-gray-500 hover:text-burgundy font-semibold transition-colors">
              ← Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-burgundy text-xl font-bold">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-red-600 text-xl font-bold">{error}</div>
      </div>
    );
  }

  // Search/filter orders
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    if (order.guest_name.toLowerCase().includes(query)) return true;
    if (order.order_number.toString().includes(query)) return true;
    if (order.group_name?.toLowerCase().includes(query)) return true;

    const hasDrinkMatch = order.order_items.some((item) =>
      item.item_name.toLowerCase().includes(query)
    );
    if (hasDrinkMatch) return true;

    return false;
  });

  // Filter orders by status
  const newOrders = filteredOrders.filter((o) => o.status === 'new');
  const inProgressOrders = filteredOrders.filter((o) => o.status === 'in_progress');
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed');
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled');
  const completedLabel = dateFilter === 'all' ? 'Completed' : `Completed ${getFilterLabel(dateFilter)}`;

  // Calculate total drinks
  const totalDrinks = filteredOrders.reduce((sum, order) => {
    return sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  return (
    <div className="min-h-screen pb-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-5 rounded-2xl shadow-2xl animate-bounce">
          <div className="text-lg font-extrabold">New Order Received!</div>
        </div>
      )}

      {/* Header */}
      <header className="header-gradient py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Row - Buttons */}
          <div className="flex justify-end gap-3 mb-4">
            <button onClick={handleExportOrders} className="btn-pill-gold text-sm">
              Export
            </button>
            <Link href="/bartender/menu" className="btn-pill-gold text-sm">
              Manage Menu
            </Link>
            <Link href="/" className="btn-pill-gold text-sm">
              Menu
            </Link>
          </div>

          {/* Centered Logo */}
          <div className="text-center mb-7">
            <MarqueeLogo size="small" />
            <p className="text-white/90 font-bold mt-3 text-xl">Bartender Dashboard</p>
          </div>

          {/* Filter Row */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <FilterDropdown
              value={dateFilter}
              onChange={(value) => setDateFilter(value as DateFilter)}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'all', label: 'All Time' },
              ]}
            />
          </div>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by guest, order #, or drink..."
                  className="search-input"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 bg-burgundy text-gold px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                  {searchQuery ? `${filteredOrders.length}` : 'Live'}
                </span>
              </div>
              <button
                onClick={() => {
                  setBulkActionMode(!bulkActionMode);
                  if (bulkActionMode) setSelectedOrders(new Set());
                }}
                className="btn-pill-gold text-sm"
              >
                {bulkActionMode ? '✓ Bulk ON' : 'Bulk'}
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {bulkActionMode && (
            <div className="mt-6 bg-blue-600 text-white py-4 px-8 rounded-2xl flex items-center justify-between max-w-2xl mx-auto">
              <div className="font-bold">
                {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="btn-complete text-sm px-6"
                  disabled={selectedOrders.size === 0}
                >
                  Complete All
                </button>
                <button
                  onClick={() => handleBulkStatusChange('cancelled')}
                  className="btn-cancel text-sm px-6"
                  disabled={selectedOrders.size === 0}
                >
                  Cancel All
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <StatsCard label="Total Drinks" count={totalDrinks} icon="🍸" />
          <StatsCard label="Total Orders" count={filteredOrders.length} icon="📊" />
          <StatsCard label="New" count={newOrders.length} icon="🆕" />
          <StatsCard label="In Progress" count={inProgressOrders.length} icon="⏳" />
          <StatsCard label="Completed" count={completedOrders.length} icon="✅" />
          <StatsCard label="Cancelled" count={cancelledOrders.length} icon="❌" />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* New Orders Column */}
          <div>
            <div className="column-header">
              🆕 New Orders
              <span className="status-badge badge-new">{newOrders.length}</span>
            </div>
            {newOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-12 font-semibold">No new orders</p>
            ) : (
              newOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  selected={selectedOrders.has(order.id)}
                  onToggleSelect={bulkActionMode ? handleToggleSelect : undefined}
                />
              ))
            )}
          </div>

          {/* In Progress Column */}
          <div>
            <div className="column-header">
              ⏳ In Progress
              <span className="status-badge badge-progress">{inProgressOrders.length}</span>
            </div>
            {inProgressOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-12 font-semibold">No orders in progress</p>
            ) : (
              inProgressOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  selected={selectedOrders.has(order.id)}
                  onToggleSelect={bulkActionMode ? handleToggleSelect : undefined}
                />
              ))
            )}
          </div>

          {/* Completed Column */}
          <div>
            <div className="column-header">
              ✅ {completedLabel}
              <span className="status-badge badge-completed">{completedOrders.length}</span>
            </div>
            {completedOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-12 font-semibold">No completed orders</p>
            ) : (
              completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  selected={selectedOrders.has(order.id)}
                  onToggleSelect={bulkActionMode ? handleToggleSelect : undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BartenderDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-burgundy text-xl font-bold">Loading...</div>
      </div>
    }>
      <BartenderDashboardContent />
    </Suspense>
  );
}
