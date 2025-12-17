/**
 * useLocalStorage Hook
 * Custom hook for managing localStorage with React state
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { setItem, getItem, removeItem } from '../utils/storage';

/**
 * Custom hook for localStorage with React state synchronization
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = getItem<T>(key);
      // Return item or initialValue
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value: SetStateAction<T>) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        setItem(key, valueToStore);

        // Dispatch custom event to notify other tabs/windows
        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      removeItem(key);
      setStoredValue(initialValue);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('local-storage-change', {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Browser native storage event (from other tabs)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error(`Error parsing storage event value for key "${key}":`, error);
          }
        }
      } else {
        // Custom event (from same tab)
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value !== null ? detail.value : initialValue);
        }
      }
    };

    // Listen for both native storage events and custom events
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for localStorage with SSR support
 */
export function useLocalStorageSSR<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  // Check if window is defined (browser environment)
  const isBrowser = typeof window !== 'undefined';

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser) {
      return initialValue;
    }

    try {
      const item = getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value: SetStateAction<T>) => {
      if (!isBrowser) {
        console.warn('localStorage is not available in this environment');
        return;
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        setItem(key, valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isBrowser]
  );

  const removeValue = useCallback(() => {
    if (!isBrowser) {
      console.warn('localStorage is not available in this environment');
      return;
    }

    try {
      removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, isBrowser]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for localStorage with validation
 */
export interface UseLocalStorageValidatedOptions<T> {
  validator?: (value: any) => value is T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export function useLocalStorageValidated<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageValidatedOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void, string | null] {
  const { validator, serializer, deserializer } = options;
  const [error, setError] = useState<string | null>(null);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return initialValue;
      }

      const parsedValue = deserializer ? deserializer(item) : JSON.parse(item);

      if (validator && !validator(parsedValue)) {
        setError('Stored value failed validation');
        return initialValue;
      }

      return parsedValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setError('Failed to read from localStorage');
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value: SetStateAction<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        if (validator && !validator(valueToStore)) {
          setError('Value failed validation');
          return;
        }

        setStoredValue(valueToStore);
        setError(null);

        const serialized = serializer
          ? serializer(valueToStore)
          : JSON.stringify(valueToStore);

        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
        setError('Failed to write to localStorage');
      }
    },
    [key, storedValue, validator, serializer]
  );

  const removeValue = useCallback(() => {
    try {
      removeItem(key);
      setStoredValue(initialValue);
      setError(null);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      setError('Failed to remove from localStorage');
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, error];
}

/**
 * Hook for localStorage with expiration
 */
export interface StorageWithExpiry<T> {
  value: T;
  expiry: number;
}

export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryMs?: number
): [T, (value: T, expiryMs?: number) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return initialValue;
      }

      const parsed: StorageWithExpiry<T> = JSON.parse(item);
      const now = Date.now();

      if (parsed.expiry && now > parsed.expiry) {
        // Value has expired
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T, customExpiryMs?: number) => {
      try {
        const expiry = customExpiryMs || expiryMs;
        const expiryTime = expiry ? Date.now() + expiry : null;

        const storageValue: StorageWithExpiry<T> = {
          value,
          expiry: expiryTime || 0,
        };

        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(storageValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, expiryMs]
  );

  const removeValue = useCallback(() => {
    try {
      removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Check for expiry on mount and periodically
  useEffect(() => {
    const checkExpiry = () => {
      try {
        const item = localStorage.getItem(key);

        if (item !== null) {
          const parsed: StorageWithExpiry<T> = JSON.parse(item);
          const now = Date.now();

          if (parsed.expiry && now > parsed.expiry) {
            removeValue();
          }
        }
      } catch (error) {
        console.error(`Error checking expiry for key "${key}":`, error);
      }
    };

    // Check immediately
    checkExpiry();

    // Check every minute
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, [key, removeValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
