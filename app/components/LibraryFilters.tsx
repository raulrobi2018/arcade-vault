"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_FILTERS, type CategoryFilter } from "@/app/data/games";

const SEARCH_DEBOUNCE_MS = 250;

function libraryHref(q: string, cat: CategoryFilter) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (cat !== "TODOS") params.set("cat", cat);
  const qs = params.toString();
  return qs ? `/juegos?${qs}` : "/juegos";
}

export function LibraryFilters({
  q,
  cat,
  pending = false,
}: {
  q: string;
  cat: CategoryFilter;
  pending?: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(q);
  // Last q this component wrote to the URL. If the URL changes to anything
  // else (e.g. the Nav "Biblioteca" link), resync the input with it.
  const [pushed, setPushed] = useState(q);
  if (q !== pushed) {
    setPushed(q);
    setText(q);
  }

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (nextQ: string, nextCat: CategoryFilter) => {
    clearTimeout(timer.current);
    setPushed(nextQ.trim());
    router.replace(libraryHref(nextQ, nextCat), { scroll: false });
  };

  const onSearch = (value: string) => {
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(value, cat), SEARCH_DEBOUNCE_MS);
  };

  return (
    <div className="av-filters">
      <div className="av-search">
        <span className="ico">⌕</span>
        <input
          value={text}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar un juego por nombre…"
          aria-label="Buscar un juego por nombre"
          disabled={pending}
        />
      </div>
      <div className="av-chips">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            className={"chip" + (cat === c ? " active" : "")}
            aria-pressed={cat === c}
            onClick={() => go(text, c)}
            disabled={pending}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
