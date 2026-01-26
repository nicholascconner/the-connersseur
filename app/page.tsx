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
          className="fixed bottom-6 right-6 bg-burgundy text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-burgundy-dark transition-colors z-40"
        >
          <div className="text-center">
            <div className="text-xs">Cart</div>
            <div className="text-xl font-bold">{itemCount}</div>
          </div>
        </Link>
      )}

      {/* Navigation Links */}
      <div className="px-4 mb-6 flex gap-4 justify-center">
        <Link
          href="/history"
          className="text-sm text-burgundy hover:text-burgundy-dark underline"
        >
          View Order History
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-burgundy text-lg">Loading menu...</div>
          </div>
        ) : (
          <>
            {/* Custom Order Card */}
            <div className="mb-8">
              <button
                onClick={() => setShowCustomModal(true)}
                className="w-full bg-gradient-to-r from-gold-dark to-gold text-burgundy-dark rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-burgundy"
              >
                <h3 className="text-xl font-bold mb-2">✨ Custom Order ✨</h3>
                <p className="text-sm">
                  Don&apos;t see what you want? Request a custom drink!
                </p>
              </button>
            </div>

            {/* Menu Items by Category */}
            {Object.entries(categorizedItems).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold text-burgundy mb-4 text-center">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
