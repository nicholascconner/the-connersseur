'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart, CartProvider } from '@/lib/hooks/useCart';
import CartItem from '@/components/CartItem';
import NameAutocomplete from '@/components/NameAutocomplete';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import { CreateOrderRequest } from '@/types';

function CartContent() {
  const router = useRouter();
  const { items, itemCount, updateQuantity, updateNotes, removeFromCart, clearCart } = useCart();
  const [guestName, setGuestName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [groupName, setGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setSubmitting(true);

    try {
      const orderRequest: CreateOrderRequest = {
        guest_name: guestName.trim(),
        phone_number: phoneNumber.trim(),
        group_name: groupName.trim() || undefined,
        items: items.map((item) => ({
          menu_item_id: item.menuItemId,
          item_name: item.name,
          quantity: item.quantity,
          notes: item.notes || undefined,
          is_custom: item.isCustom,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const data = await response.json();

      localStorage.setItem('connerseur_last_name', guestName.trim());
      clearCart();

      setConfirmedOrderNumber(data.order.order_number || 0);
      setShowConfirmation(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to submit order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="header-gradient py-8 px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white font-semibold transition-colors">
            ← Back to Menu
          </Link>
          <h1 className="text-4xl font-extrabold text-gold mt-4" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            Your Cart
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6">
        {items.length === 0 ? (
          <div className="card-static p-12 text-center">
            <p className="text-gray-500 mb-6 font-semibold">Your cart is empty</p>
            <Link href="/" className="btn-pill-burgundy">
              Browse Menu
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Cart Items */}
            <div className="mb-8">
              <div className="column-header mb-6">
                Items
                <span className="status-badge badge-new">{itemCount}</span>
              </div>
              {items.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  index={index}
                  onUpdateQuantity={updateQuantity}
                  onUpdateNotes={updateNotes}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Guest Information */}
            <div className="card-static p-8 mb-8">
              <h2 className="text-xl font-extrabold text-gray-800 mb-6">Your Information</h2>

              <div className="mb-6">
                <NameAutocomplete
                  value={guestName}
                  onChange={setGuestName}
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="phone-number" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(469) 555-1234"
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base focus:border-gold focus:outline-none font-semibold"
                />
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  We'll text you when your drink is ready
                </p>
              </div>

              <div>
                <label htmlFor="group-name" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Group Name (Optional)
                </label>
                <input
                  type="text"
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Smith Family, Birthday Party"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base focus:border-gold focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 font-semibold">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="btn-pill-burgundy w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Order...' : 'Submit Order'}
            </button>

            <p className="text-sm text-gray-500 text-center mt-6 font-semibold">
              Your order will be sent to the bartender immediately
            </p>
          </form>
        )}

        <OrderConfirmationModal
          isOpen={showConfirmation}
          orderNumber={confirmedOrderNumber}
          onClose={() => {
            setShowConfirmation(false);
            router.push('/');
          }}
        />
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartProvider>
      <CartContent />
    </CartProvider>
  );
}
