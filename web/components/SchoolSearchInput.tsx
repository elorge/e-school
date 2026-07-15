// web/components/SchoolSearchInput.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { searchSchools } from '@/lib/endpoints/school-search';
import type { School } from '@/lib/types';
import { Search } from 'lucide-react';

/** Type-ahead: "green" matches "Greenwood College" — no need to know the exact slug/name. */
export default function SchoolSearchInput({ onSelect }: { onSelect: (school: School) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<School[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchSchools(query).then((r) => {
        setResults(r);
        setOpen(true);
      });
    }, 250);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/30" />
        <input
          className="rounded border py-1.5 pl-8 pr-2 text-sm"
          placeholder="Type a school name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border bg-white py-1 shadow-lg">
          {results.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelect(s);
                setQuery(s.name);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5"
            >
              {s.name} <span className="text-ink/40">— {s.slug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}