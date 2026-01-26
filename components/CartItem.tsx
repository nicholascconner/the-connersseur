'use client';

import { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onRemove: (index: number) => void;
}

export default function CartItem({
  item,
  index,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
}: CartItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-burgundy">
            {item.name}
            {item.isCustom && <span className="ml-2 text-xs bg-gold text-burgundy-dark px-2 py-1 rounded">Custom</span>}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(index)}
          className="ml-4 text-red-500 hover:text-red-700 transition-colors text-xl font-bold"
          aria-label="Remove item"
        >
          ×
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <button
          onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-bold"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-bold"
        >
          +
        </button>
      </div>

      <div>
        <label htmlFor={`notes-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
          Notes / Preferences
        </label>
        <textarea
          id={`notes-${index}`}
          value={item.notes}
          onChange={(e) => onUpdateNotes(index, e.target.value)}
          placeholder="Add any special requests..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
          rows={2}
        />
      </div>
    </div>
  );
}
