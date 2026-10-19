import { Suspense } from "react";
import { GameCard } from "@/app/components/GameCard";
import { LibraryFilters } from "@/app/components/LibraryFilters";
import {
  CATEGORY_FILTERS,
  getGames,
  type Category,
  type CategoryFilter,
} from "@/app/data/games";

type SearchParams = PageProps<"/juegos">["searchParams"];

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

function parseCategory(v: string | undefined): CategoryFilter {
  const upper = v?.toUpperCase();
  return CATEGORY_FILTERS.find((c) => c === upper) ?? "TODOS";
}

export default function LibraryPage({ searchParams }: PageProps<"/juegos">) {
  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>

      {/* searchParams is request data: under cacheComponents it must be
          read inside a Suspense boundary so the hero stays in the static shell. */}
      <Suspense fallback={<LibraryFilters q="" cat="TODOS" pending />}>
        <Library searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Library({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const cat = parseCategory(first(sp.cat));
  const games = await getGames({
    q,
    category: cat === "TODOS" ? undefined : (cat as Category),
  });

  return (
    <>
      <LibraryFilters q={q} cat={cat} />
      <div className="av-grid">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
        {games.length === 0 && (
          <div className="col-span-full p-20 text-center text-ink-faint">
            <div className="pixel mb-3 text-sm text-magenta">
              NO HAY RESULTADOS
            </div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </>
  );
}
