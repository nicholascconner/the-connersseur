'use client';

import { useState, useEffect, useRef } from 'react';
import { useNameAutocomplete } from '@/lib/hooks/useNameAutocomplete';

interface NameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function NameAutocomplete({ value, onChange, required = false }: NameAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useNameAutocomplete(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load last used name from localStorage on mount
  useEffect(() => {
    if (!value) {
      const lastUsedName = localStorage.getItem('connerseur_last_name');
      if (lastUsedName) {
        onChange(lastUsedName);
      }
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-2">
        Your Name {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        id="guest-name"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Enter your name"
        required={required}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-burgundy focus:border-transparent"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-burgundy hover:text-white transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
