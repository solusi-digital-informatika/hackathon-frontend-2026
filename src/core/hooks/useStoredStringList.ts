import { useState } from 'react';

function read(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

/** Browser-local display preference, scoped by storage key. */
export function useStoredStringList(key: string) {
  const [values, setValues] = useState<Record<string, string[]>>({});
  const current = values[key] ?? read(key);
  const setItem = (item: string, included: boolean) => {
    const next = included ? [...new Set([...current, item])] : current.filter(value => value !== item);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Keep preference for this session. */ }
    setValues(previous => ({ ...previous, [key]: next }));
  };
  return [current, setItem] as const;
}
