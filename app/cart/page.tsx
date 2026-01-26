'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart, CartProvider } from '@/lib/hooks/useCart';
import CartItem from '@/components/CartItem';
import NameAutocomplete from '@/components/NameAutocomplete';
import { CreateOrderRequest } from '@/types';

function CartContent() {
  const router = useRouter();
  const { items, itemCount, updateQuantity, updateNotes, removeFromCart, clearCart } = useCart();
  const [guestName, setGuestName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('Please enter your name');
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

      // Save name to localStorage for next time
      localStorage.setItem('connersseur_last_name', guestName.trim());

      // Clear cart
      clearCart();

      // Redirect to order status page
      router.push(`/order/${data.order.id}`);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to submit order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-light pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-burgundy hover:text-burgundy-dark">
            ← Back to Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-burgundy mb-6 text-center">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block bg-burgundy text-white py-2 px-6 rounded-lg hover:bg-burgundy-dark transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Cart Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-burgundy mb-4">
                Items ({itemCount})
              </h2>
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-burgundy mb-4">Your Information</h2>

              <div className="mb-4">
                <NameAutocomplete
                  value={guestName}
                  onChange={setGuestName}
                  required
                />
              </div>

              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name (Optional)
                </label>
                <input
                  type="text"
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Smith Family, Birthday Party"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-burgundy focus:border-transparent"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full bg-burgundy text-white py-4 px-6 rounded-lg hover:bg-burgundy-dark transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Order...' : 'Submit Order'}
            </button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Your order will be sent to the bartender immediately
            </p>
          </form>
        )}
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
