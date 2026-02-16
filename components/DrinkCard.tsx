'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { getDrinkOptions, serializeDrinkOptions, DrinkOptionGroup } from '@/lib/drinkOptions';

const NOTES_PLACEHOLDERS: Record<string, string> = {
  'chardonnay': 'e.g. oaky, buttery, lightly toasted, crisp/clean',
  'italian': 'e.g. Brunello, Chianti, Nebbiolo and more',
  'bordeaux style': 'e.g. the age old question, left bank or right bank',
  'pinot noir': 'e.g. light or medium body, more on the cab profile side',
};

interface DrinkCardProps {
  drink: MenuItem;
  onAddToCart: (drink: MenuItem, quantity: number, notes: string) => void;
}

export default function DrinkCard({ drink, onAddToCart }: DrinkCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>({});

  const drinkOptions = getDrinkOptions(drink.name);

  const handleOpen = () => {
    setShowModal(true);
    // Reset selections when opening
    if (drinkOptions) {
      const initial: Record<string, string> = {};
      drinkOptions.forEach(group => { initial[group.label] = ''; });
      setSelections(initial);
    }
  };

  const allOptionsSelected = !drinkOptions || drinkOptions.every(g => selections[g.label] !== '' && selections[g.label] !== undefined);

  const handleAdd = () => {
    if (!allOptionsSelected) return;
    let finalNotes = notes;
    if (drinkOptions) {
      finalNotes = serializeDrinkOptions(selections, notes);
    }
    onAddToCart(drink, quantity, finalNotes);
    setShowModal(false);
    setQuantity(1);
    setNotes('');
    setSelections({});
  };

  const handleClose = () => {
    setShowModal(false);
    setQuantity(1);
    setNotes('');
    setSelections({});
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-card p-6 cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] flex flex-col"
        onClick={handleOpen}
        style={{ transform: 'translateZ(0)' }}
      >
        <h3 className="text-xl font-extrabold text-gray-800 mb-2">{drink.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drink.description}</p>
        <p className="text-xs text-gray-400 italic mb-4 flex-1">{drink.ingredients}</p>
        <button
          className="btn-pill-burgundy w-full text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
        >
          Add to Cart
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{drink.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{drink.description}</p>
            <p className="text-xs text-gray-400 italic mb-6">{drink.ingredients}</p>

            {/* Structured Options (Martini, Old Fashioned, etc.) */}
            {drinkOptions && (
              <div className="mb-6 space-y-4">
                {drinkOptions.map((group: DrinkOptionGroup) => (
                  <div key={group.label}>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      {group.label}
                    </label>
                    <select
                      value={selections[group.label] || ''}
                      onChange={(e) => setSelections(prev => ({ ...prev, [group.label]: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none bg-white appearance-none"
                    >
                      <option value="">Select {group.label.toLowerCase()}...</option>
                      {group.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

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
                {drinkOptions ? 'Additional Notes' : 'Preferences / Notes'}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={drinkOptions ? 'Any other preferences...' : (NOTES_PLACEHOLDERS[drink.name.toLowerCase()] || 'e.g., dirty martini with garlic olives, extra dry, on the rocks...')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!allOptionsSelected}
                className={`flex-1 ${allOptionsSelected ? 'btn-pill-burgundy' : 'bg-gray-300 text-gray-500 py-4 px-6 rounded-xl font-bold cursor-not-allowed'}`}
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
