import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GamePlayer } from "@/app/components/GamePlayer";
import { getGame, getGames } from "@/app/data/games";

type Params = PageProps<"/juegos/[id]/jugar">["params"];

export async function generateStaticParams() {
  const games = await getGames();
  return games.map((g) => ({ id: g.id }));
}

// params is URL data: read it inside Suspense so navigations get an instant shell.
export default function GamePlayerPage({
  params,
}: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense fallback={<PlayerSkeleton />}>
      <Player params={params} />
    </Suspense>
  );
}

async function Player({ params }: { params: Params }) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}

// Empty HUD bar and a dark CRT, matching the player's frame.
function PlayerSkeleton() {
  return (
    <div className="av-player" aria-busy="true">
      <div className="player-hud min-h-[76px]"></div>
      <div className="crt">
        <div className="crt-screen"></div>
      </div>
    </div>
  );
}
