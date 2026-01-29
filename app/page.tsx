'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import DrinkCard from '@/components/DrinkCard';
import CustomDrinkModal from '@/components/CustomDrinkModal';
import { MenuItem, CartItem } from '@/types';
import { useCart, CartProvider } from '@/lib/hooks/useCart';

function MenuContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const { addToCart, itemCount } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data.items || []);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAddToCart = (drink: MenuItem, quantity: number, notes: string) => {
    const cartItem: CartItem = {
      menuItemId: drink.id,
      name: drink.name,
      description: drink.description,
      quantity,
      notes,
      isCustom: false,
    };
    addToCart(cartItem);
  };

  const handleAddCustom = (name: string, description: string, quantity: number) => {
    const cartItem: CartItem = {
      name,
      description,
      quantity,
      notes: description,
      isCustom: true,
    };
    addToCart(cartItem);
  };

  // Group items by category
  const categorizedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen pb-24">
      <Logo />

      {/* Cart Floating Badge */}
      {itemCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-6 right-6 bg-burgundy text-white rounded-full w-20 h-20 flex items-center justify-center shadow-gold hover:scale-110 transition-all duration-300 z-40"
          style={{ boxShadow: '0 8px 24px rgba(139, 21, 56, 0.4)' }}
        >
          <div className="text-center">
            <div className="text-xs font-bold">Cart</div>
            <div className="text-2xl font-extrabold">{itemCount}</div>
          </div>
        </Link>
      )}

      {/* Navigation Links */}
      <div className="px-6 py-6 flex gap-4 justify-between items-center max-w-4xl mx-auto">
        <Link
          href="/history"
          className="text-sm font-semibold text-burgundy hover:text-burgundy-dark transition-colors"
        >
          View Order History
        </Link>
        <Link
          href="/bartender"
          className="text-sm font-semibold text-gray-500 hover:text-burgundy transition-colors flex items-center gap-1"
          title="Access Bartender Dashboard"
        >
          Bartender Mode
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-burgundy text-lg font-bold">Loading menu...</div>
          </div>
        ) : (
          <>
            {/* Custom Order Card */}
            <div className="mb-10">
              <button
                onClick={() => setShowCustomModal(true)}
                className="w-full bg-white rounded-2xl shadow-card p-8 hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 border-l-4 border-gold"
                style={{ transform: 'translateZ(0)' }}
              >
                <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Custom Order</h3>
                <p className="text-gray-600">
                  Don&apos;t see what you want? Request a custom drink!
                </p>
              </button>
            </div>

            {/* Menu Items by Category */}
            {Object.entries(categorizedItems).map(([category, items]) => (
              <div key={category} className="mb-10">
                <div className="category-header mb-6">
                  {category}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((drink) => (
                    <DrinkCard
                      key={drink.id}
                      drink={drink}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Duplicate Custom Order Card at Bottom */}
            <div className="mb-10 mt-10">
              <button
                onClick={() => setShowCustomModal(true)}
                className="w-full bg-white rounded-2xl shadow-card p-8 hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 border-l-4 border-gold"
                style={{ transform: 'translateZ(0)' }}
              >
                <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Custom Order</h3>
                <p className="text-gray-600">
                  Don&apos;t see what you want? Request a custom drink!
                </p>
              </button>
            </div>
          </>
        )}
      </div>

      <CustomDrinkModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onAdd={handleAddCustom}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
