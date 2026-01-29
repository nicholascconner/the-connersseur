'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';

interface DrinkCardProps {
  drink: MenuItem;
  onAddToCart: (drink: MenuItem, quantity: number, notes: string) => void;
}

export default function DrinkCard({ drink, onAddToCart }: DrinkCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    onAddToCart(drink, quantity, notes);
    setShowModal(false);
    setQuantity(1);
    setNotes('');
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-card p-6 cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]"
        onClick={() => setShowModal(true)}
        style={{ transform: 'translateZ(0)' }}
      >
        <h3 className="text-xl font-extrabold text-gray-800 mb-2">{drink.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drink.description}</p>
        <p className="text-xs text-gray-400 italic mb-4">{drink.ingredients}</p>
        <button
          className="btn-pill-burgundy w-full text-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        >
          Add to Cart
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{drink.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{drink.description}</p>
            <p className="text-xs text-gray-400 italic mb-6">{drink.ingredients}</p>

            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-bold text-xl"
                >
                  −
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border-2 border-gray-200 rounded-xl py-3 text-xl font-bold focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Preferences / Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., dirty martini with garlic olives, extra dry, on the rocks..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="btn-pill-burgundy flex-1"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
