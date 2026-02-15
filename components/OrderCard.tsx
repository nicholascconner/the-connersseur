'use client';

import { OrderWithItems, OrderStatus } from '@/types';
import { formatTime, getRelativeTime, isOrderOld } from '@/lib/utils/formatters';

interface OrderCardProps {
  order: OrderWithItems;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  selected?: boolean;
  onToggleSelect?: (orderId: string) => void;
}

function printOrderTicket(order: OrderWithItems) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${order.order_number}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Courier New', monospace;
          max-width: 300px;
          margin: 20px auto;
          padding: 20px;
        }
        h1 {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .order-info {
          margin-bottom: 20px;
          font-size: 14px;
        }
        .item {
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px dashed #999;
        }
        .item-qty {
          font-weight: bold;
          font-size: 18px;
        }
        .item-name {
          font-size: 16px;
          font-weight: bold;
        }
        .notes {
          font-style: italic;
          margin-top: 5px;
          color: #666;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          border-top: 3px solid #000;
          padding-top: 10px;
        }
        button {
          margin: 20px auto;
          display: block;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <h1>The Connerseur</h1>
      <div class="order-info">
        <div><strong>Order #${order.order_number}</strong></div>
        <div>Guest: ${order.guest_name}</div>
        ${order.group_name ? `<div>Group: ${order.group_name}</div>` : ''}
        <div>Time: ${new Date(order.created_at).toLocaleTimeString()}</div>
      </div>
      <div class="items">
        ${order.order_items.map(item => `
          <div class="item">
            <div>
              <span class="item-qty">${item.quantity}x</span>
              <span class="item-name">${item.item_name}</span>
              ${item.is_custom ? ' <span style="background: #FFD700; padding: 2px 6px; font-size: 10px;">CUSTOM</span>' : ''}
            </div>
            ${item.notes ? `<div class="notes">"${item.notes}"</div>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="footer">
        Thank you!
      </div>
      <button class="no-print" onclick="window.print(); window.close();">Print</button>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}

export default function OrderCard({ order, onStatusChange, selected = false, onToggleSelect }: OrderCardProps) {
  const isOld = isOrderOld(order.created_at);
  const isCompleted = order.status === 'completed';

  return (
    <div
      className={`
        bg-white rounded-2xl p-7 mb-5 shadow-card cursor-pointer
        transition-all duration-300
        ${isOld && !isCompleted ? 'ring-2 ring-red-400 animate-pulse' : ''}
        ${selected ? 'ring-4 ring-blue-500' : ''}
        ${isCompleted ? 'opacity-70' : 'hover:shadow-card-hover hover:scale-[1.02]'}
      `}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(order.id)}
              className="w-5 h-5 cursor-pointer accent-burgundy"
            />
          )}
          <span className="order-number-badge">#{order.order_number}</span>
        </div>
        <span className="text-sm text-gray-400 font-semibold">
          {formatTime(order.created_at)}
          {isOld && !isCompleted && (
            <span className="ml-2 text-red-500 font-bold">
              ({getRelativeTime(order.created_at)})
            </span>
          )}
        </span>
      </div>

      {/* Guest Name */}
      <h3 className="text-2xl font-extrabold text-gray-800 mb-2 leading-tight">
        {order.guest_name}
      </h3>

      {/* Group Name Badge */}
      {order.group_name && (
        <span className="group-badge">
          {order.group_name}
        </span>
      )}

      {/* Drinks List */}
      <div className="mb-6">
        {order.order_items.map((item) => (
          <div key={item.id} className="drink-item">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-base">
                {item.quantity}x {item.item_name}
              </span>
              {item.is_custom && (
                <span className="text-xs bg-gold text-burgundy-dark px-2 py-0.5 rounded-full font-bold">
                  CUSTOM
                </span>
              )}
            </div>
            {item.notes && (
              <p className="text-sm text-gray-500 mt-1 italic">
                &quot;{item.notes}&quot;
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          {order.status === 'new' && (
            <button
              onClick={() => onStatusChange(order.id, 'in_progress')}
              className="btn-start"
            >
              Start
            </button>
          )}

          {order.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(order.id, 'completed')}
              className="btn-complete"
            >
              Complete
            </button>
          )}

          {(order.status === 'new' || order.status === 'in_progress') && (
            <button
              onClick={() => onStatusChange(order.id, 'cancelled')}
              className="btn-cancel"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Print Button */}
        <button
          onClick={() => printOrderTicket(order)}
          className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Print Ticket
        </button>
      </div>
    </div>
  );
}
