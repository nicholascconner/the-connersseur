'use client';

import { useEffect, useState } from 'react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  orderNumber: number;
  onClose: () => void;
}

export default function OrderConfirmationModal({
  isOpen,
  orderNumber,
  onClose,
}: OrderConfirmationModalProps) {
  const [shouldClose, setShouldClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setShouldClose(true);
        setTimeout(onClose, 300); // Allow animation to finish
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ${shouldClose ? 'bg-opacity-0' : 'bg-opacity-50'}`}>
      <div className={`bg-white rounded-lg p-8 max-w-md mx-4 text-center transform transition-all duration-300 ${shouldClose ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Success Animation */}
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-burgundy mb-2">Order Sent!</h2>
        <p className="text-gray-600 mb-4">Your order has been received</p>

        <div className="bg-gold bg-opacity-20 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">Your Order Number</div>
          <div className="text-4xl font-bold text-burgundy">#{orderNumber}</div>
        </div>

        <p className="text-sm text-gray-500">
          We'll text you updates as your drinks are prepared
        </p>

        <button
          onClick={() => {
            setShouldClose(true);
            setTimeout(onClose, 300);
          }}
          className="mt-6 px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
