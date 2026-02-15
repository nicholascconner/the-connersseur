'use client';

import { useState, useEffect } from 'react';

interface GuestPreference {
  name: string;
  preferences: string;
  lastUsed: string;
}

const STORAGE_KEY = 'the_connerseur_guest_preferences';

export function useGuestPreferences() {
  const [preferences, setPreferences] = useState<Map<string, GuestPreference>>(new Map());

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: GuestPreference[] = JSON.parse(stored);
          const map = new Map(parsed.map((p) => [p.name.toLowerCase(), p]));
          setPreferences(map);
        }
      } catch (error) {
        console.error('Error loading guest preferences:', error);
      }
    }
  }, []);

  // Save preference
  const savePreference = (name: string, preferenceText: string) => {
    const newPref: GuestPreference = {
      name,
      preferences: preferenceText,
      lastUsed: new Date().toISOString(),
    };

    const newPrefs = new Map(preferences);
    newPrefs.set(name.toLowerCase(), newPref);
    setPreferences(newPrefs);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newPrefs.values())));
      } catch (error) {
        console.error('Error saving guest preference:', error);
      }
    }
  };

  // Get preference
  const getPreference = (name: string): string | null => {
    const pref = preferences.get(name.toLowerCase());
    return pref ? pref.preferences : null;
  };

  return {
    savePreference,
    getPreference,
    hasPreference: (name: string) => preferences.has(name.toLowerCase()),
  };
}
