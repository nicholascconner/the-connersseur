'use client';

import { MenuItem } from '@/types';

interface MenuItemToggleProps {
  item: MenuItem;
  isSaving: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (id: string, newActive: boolean) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}

export default function MenuItemToggle({ item, isSaving, isFirst, isLast, onToggle, onReorder }: MenuItemToggleProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-4 shadow-card transition-all duration-300
        ${item.is_active ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-200 opacity-60'}
        ${isSaving ? 'animate-pulse' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Reorder Arrows */}
        <div className="flex flex-col gap-1 shrink-0 mt-1">
          <button
            onClick={() => onReorder(item.id, 'up')}
            disabled={isFirst || isSaving}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors
              ${isFirst || isSaving ? 'text-gray-200 cursor-default' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
            `}
            aria-label={`Move ${item.name} up`}
          >
            ▲
          </button>
          <button
            onClick={() => onReorder(item.id, 'down')}
            disabled={isLast || isSaving}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors
              ${isLast || isSaving ? 'text-gray-200 cursor-default' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
            `}
            aria-label={`Move ${item.name} down`}
          >
            ▼
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-extrabold mb-1 truncate ${item.is_active ? 'text-gray-800' : 'text-gray-400'}`}>
            {item.name}
          </h3>
          <p className={`text-sm mb-1 line-clamp-1 ${item.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
            {item.description}
          </p>
          <p className={`text-xs italic ${item.is_active ? 'text-gray-400' : 'text-gray-300'}`}>
            {item.ingredients}
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(item.id, !item.is_active)}
          disabled={isSaving}
          className={`
            relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out mt-1
            ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}
            ${isSaving ? 'opacity-50 cursor-wait' : ''}
          `}
          role="switch"
          aria-checked={item.is_active}
          aria-label={`Toggle ${item.name} ${item.is_active ? 'off' : 'on'}`}
        >
          <span
            className={`
              pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0
              transition duration-200 ease-in-out
              ${item.is_active ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
