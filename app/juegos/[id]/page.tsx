import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatScore } from "@/app/components/format";
import { Leaderboard } from "@/app/components/Leaderboard";
import { getGame, getGames } from "@/app/data/games";
import { getScores } from "@/app/data/scores";

type Params = PageProps<"/juegos/[id]">["params"];

export async function generateStaticParams() {
  const games = await getGames();
  return games.map((g) => ({ id: g.id }));
}

// params is URL data: reading it inside Suspense gives client navigations an
// instant shell (cacheComponents + partialPrefetching validation).
export default function GameDetailPage({ params }: PageProps<"/juegos/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <GameDetail params={params} />
    </Suspense>
  );
}

async function GameDetail({ params }: { params: Params }) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();
  const scores = await getScores(id, 10);

  return (
    <div className="av-detail fade-in">
      <div>
        <div className="detail-cover">
          <div className={"cover-bg " + game.cover}></div>
        </div>
        <div className="detail-info mt-5">
          <div className="detail-tags">
            <span>{game.category}</span>
            <span>1 JUGADOR</span>
            <span>TECLADO / TÁCTIL</span>
            <span>RETRO 1985</span>
          </div>
          <h2 className="neon-cyan">{game.title}</h2>
          <p>{game.long}</p>
          <div className="stat-strip">
            <div>
              <div className="l">Partidas</div>
              <div className="v">{game.plays}</div>
            </div>
            <div>
              <div className="l">Mejor global</div>
              <div className="v text-magenta [text-shadow:0_0_6px_rgba(255,0,110,0.5)]">
                {formatScore(game.best)}
              </div>
            </div>
            <div>
              <div className="l">Dificultad</div>
              <div className="v text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)]">
                ★ ★ ★ ☆ ☆
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <Link href={`/juegos/${game.id}/jugar`} className="btn xl pulse">
              ▶ JUGAR AHORA
            </Link>
            <Link href="/" className="btn ghost lg">
              VOLVER AL VAULT
            </Link>
          </div>
        </div>
      </div>

      <aside>
        <Leaderboard scores={scores} />
      </aside>
    </div>
  );
}

// Same frame as the detail (cover + leaderboard box) so nothing jumps
// when the content streams in.
function DetailSkeleton() {
  return (
    <div className="av-detail" aria-busy="true">
      <div className="detail-cover bg-bg-2"></div>
      <div className="leaderboard min-h-[420px]"></div>
    </div>
  );
}
