import { useState, useCallback, Dispatch, SetStateAction } from 'react';

const STORAGE_PREFIX = 'ccn_opt_';

/**
 * Custom hook that persists state in localStorage so user selections, dropdown choices,
 * checkboxes, radio buttons, and inputs remain intact after closing the browser or restarting the computer.
 *
 * @param key Unique key within the application for this option/field
 * @param defaultValue Default value or factory function if no value is found in localStorage
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const fullKey = STORAGE_PREFIX + key;

  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored !== null && stored !== 'undefined') {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Failed to read "${fullKey}" from localStorage:`, e);
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  });

  const setPersistentState: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      setState((prev) => {
        const nextValue = typeof action === 'function' ? (action as (prev: T) => T)(prev) : action;
        try {
          localStorage.setItem(fullKey, JSON.stringify(nextValue));
        } catch (e) {
          console.warn(`Failed to save "${fullKey}" to localStorage:`, e);
        }
        return nextValue;
      });
    },
    [fullKey]
  );

  return [state, setPersistentState];
}

/**
 * Utility to clear all saved options across forms if the user chooses to do a complete reset.
 */
export function clearAllPersistentOptions(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Failed to clear persistent options:', e);
  }
}
