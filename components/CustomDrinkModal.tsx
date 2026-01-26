'use client';

import { useState } from 'react';

interface CustomDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, description: string, quantity: number) => void;
}

export default function CustomDrinkModal({ isOpen, onClose, onAdd }: CustomDrinkModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a drink name');
      return;
    }
    onAdd(name.trim(), description.trim(), quantity);
    setName('');
    setDescription('');
    setQuantity(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-burgundy mb-4">Custom Order</h2>
        <p className="text-sm text-gray-600 mb-4">
          Can&apos;t find what you&apos;re looking for? Let us know what you&apos;d like!
        </p>

        <div className="mb-4">
          <label htmlFor="custom-name" className="block text-sm font-medium text-gray-700 mb-2">
            Drink Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="custom-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Long Island Iced Tea"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="custom-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description / Preferences
          </label>
          <textarea
            id="custom-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us how you'd like it made, any specific ingredients, preferences..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="custom-quantity" className="block text-sm font-medium text-gray-700 mb-2">
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
              id="custom-quantity"
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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-burgundy text-white py-2 px-4 rounded-lg hover:bg-burgundy-dark transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
