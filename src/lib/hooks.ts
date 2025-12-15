"use client";

// client-side react hooks
// these need "use client" because they use browser apis and react state

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================
// debouncing hooks
// ============================================

// debounces a value - useful for search inputs so we don't spam the api
// waits for the user to stop typing before updating the value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup: cancel the timeout if value changes before delay is up
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// similar to useDebounce but for callback functions instead of values
// useful when you need to debounce a function that you pass to a child component
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// ============================================
// dom interaction hooks
// ============================================

// detects clicks outside an element - great for closing dropdowns and modals
// just attach the returned ref to your element
export function useClickOutside<T extends HTMLElement>(
  handler: () => void
): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handler]);

  return ref;
}

// listens for keyboard shortcuts globally
// supports modifier keys like ctrl, shift, alt, meta
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
  } = {}
): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { ctrl = false, shift = false, alt = false, meta = false, preventDefault = true } = options;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
}

// ============================================
// storage hooks
// ============================================

// persistent storage that works with server-side rendering
// loads from localStorage on mount, saves automatically when value changes
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // save to localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const newValue = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } catch (error) {
        console.warn(`error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

// ============================================
// media query hooks
// ============================================

// tracks css media query matches in react
// useful for responsive behavior that can't be done with css alone
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

// ============================================
// async state hooks
// ============================================

// wraps async functions with loading and error state
// automatically tracks loading state and catches errors
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("an error occurred"));
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
}
