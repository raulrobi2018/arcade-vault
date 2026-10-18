import Link from "next/link";
import type { Game } from "@/app/data/games";

// One link per game; the selected game lives in ?juego=<id>.
// `activeId` is null while the page is still reading searchParams.
export function HallTabs({
  games,
  activeId,
}: {
  games: Game[];
  activeId: string | null;
}) {
  return (
    <nav className="hall-tabs" aria-label="Juegos">
      {games.map((g) => (
        <Link
          key={g.id}
          href={`/salon-de-la-fama?juego=${g.id}`}
          scroll={false}
          className={"chip" + (activeId === g.id ? " active" : "")}
          aria-current={activeId === g.id ? "page" : undefined}
        >
          {g.title}
        </Link>
      ))}
    </nav>
  );
}
