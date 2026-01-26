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
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
        onClick={() => setShowModal(true)}
      >
        <h3 className="text-lg font-semibold text-burgundy mb-2">{drink.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drink.description}</p>
        <p className="text-xs text-gray-500 italic mb-3">{drink.ingredients}</p>
        <button
          className="w-full bg-burgundy text-white py-2 px-4 rounded-lg hover:bg-burgundy-dark transition-colors font-medium"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-burgundy mb-2">{drink.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{drink.description}</p>
            <p className="text-xs text-gray-500 italic mb-4">{drink.ingredients}</p>

            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-300 rounded-lg py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Preferences / Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., dirty martini with garlic olives, extra dry, on the rocks..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 bg-burgundy text-white py-2 px-4 rounded-lg hover:bg-burgundy-dark transition-colors font-medium"
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
