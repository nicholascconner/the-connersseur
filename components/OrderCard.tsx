'use client';

import { OrderWithItems, OrderStatus } from '@/types';
import { formatTime } from '@/lib/utils/formatters';

interface OrderCardProps {
  order: OrderWithItems;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 border-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 border-blue-400';
      case 'completed':
        return 'bg-green-100 border-green-400';
      case 'cancelled':
        return 'bg-red-100 border-red-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className={`${getStatusColor(order.status)} border-2 rounded-lg p-4 mb-4 shadow-md`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm text-gray-600">{formatTime(order.created_at)}</div>
          <h3 className="text-xl font-bold text-burgundy">{order.guest_name}</h3>
          {order.group_name && (
            <div className="text-sm text-gray-600 italic">Group: {order.group_name}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Order #{order.id.slice(0, 8)}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.order_items.map((item) => (
          <div key={item.id} className="bg-white bg-opacity-60 rounded p-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-burgundy-dark">
                {item.quantity}x
              </span>
              <span className="font-medium">
                {item.item_name}
                {item.is_custom && (
                  <span className="ml-2 text-xs bg-gold text-burgundy-dark px-2 py-0.5 rounded">
                    Custom
                  </span>
                )}
              </span>
            </div>
            {item.notes && (
              <div className="text-sm text-gray-700 mt-1 ml-8 italic">
                &quot;{item.notes}&quot;
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {order.status === 'new' && (
          <button
            onClick={() => onStatusChange(order.id, 'in_progress')}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
          >
            Start
          </button>
        )}

        {order.status === 'in_progress' && (
          <button
            onClick={() => onStatusChange(order.id, 'completed')}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium text-lg"
          >
            Complete
          </button>
        )}

        {(order.status === 'new' || order.status === 'in_progress') && (
          <button
            onClick={() => onStatusChange(order.id, 'cancelled')}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
