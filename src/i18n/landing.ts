/**
 * Lightweight Dutch/English toggle for the public landing surfaces.
 *
 * Usage:
 *   const { lang, setLang, t } = useLang();
 *   <h2>{t('Hallo', 'Hello')}</h2>
 *
 * Module-level state is backed by localStorage and exposed through
 * useSyncExternalStore so components re-render on language change
 * without a React context provider wrapping the tree.
 */

import { useSyncExternalStore } from 'react';

export type Lang = 'nl' | 'en';

const STORAGE_KEY = 'comfortos.landing.lang';
const DEFAULT_LANG: Lang = 'nl';

function langFromPath(pathname: string): Lang | null {
  // /en, /en/, /en?... → English. Everything else defers to storage / default.
  if (/^\/en(?:\/|$|\?|#)/.test(pathname)) return 'en';
  return null;
}

function readInitial(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const fromPath = langFromPath(window.location.pathname);
  if (fromPath) return fromPath;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'nl') return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

let currentLang: Lang = readInitial();
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (currentLang === lang) return;
  currentLang = lang;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  } catch {
    /* ignore */
  }
  notify();
}

export { langFromPath };

/** Pure lookup usable anywhere; callers in React should use useLang() to re-render. */
export function t(nl: string, en: string): string {
  return currentLang === 'nl' ? nl : en;
}

/** Hook that re-renders when the language changes. */
export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    lang,
    setLang,
    t: (nl: string, en: string) => (lang === 'nl' ? nl : en),
  };
}

// Keep <html lang> in sync at module load.
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang;
}
