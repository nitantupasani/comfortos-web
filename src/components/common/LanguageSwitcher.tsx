import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useLang, type Lang } from '../../i18n/landing';

const OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const pathFor = (lang: Lang): string => (lang === 'en' ? '/en' : '/');

/** Small language dropdown; navigates to / or /en so the URL reflects the choice. */
export default function LanguageSwitcher() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];

  const select = (code: Lang) => {
    setOpen(false);
    const target = pathFor(code);
    // Preserve hash fragment so in-page anchors survive the switch.
    const withHash = target + (location.hash || '');
    if (location.pathname === target) return;
    navigate(withHash, { replace: true });
  };

  return (
    // translate="no" + notranslate class tell Chrome/Safari's built-in
    // page-translator to leave this widget alone — otherwise 'en' (which
    // is also the Dutch word for 'and') gets auto-translated to 'AND',
    // and 'Nederlands' / 'English' get rewritten in place.
    <div
      ref={wrapperRef}
      className="notranslate relative"
      translate="no"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5 text-gray-500" />
        <span className="hidden sm:inline" translate="no">{current.flag}</span>
        <span className="uppercase tracking-wider" translate="no">
          {current.code}
        </span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-40 mt-1 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          translate="no"
        >
          {OPTIONS.map((o) => {
            const active = o.code === lang;
            return (
              <li key={o.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(o.code)}
                  lang={o.code}
                  translate="no"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition ${
                    active
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base leading-none">{o.flag}</span>
                  <span className="flex-1">{o.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-teal-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
