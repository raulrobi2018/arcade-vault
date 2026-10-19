import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HallTable } from "@/app/components/HallTable";
import { HallTabs } from "@/app/components/HallTabs";
import { Podium } from "@/app/components/Podium";
import { getGames } from "@/app/data/games";
import { getScores } from "@/app/data/scores";

export const metadata: Metadata = {
  title: "Salón de la Fama · Arcade Vault",
};

type SearchParams = PageProps<"/salon-de-la-fama">["searchParams"];

export default function HallOfFamePage({
  searchParams,
}: PageProps<"/salon-de-la-fama">) {
  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel text-[10px]">
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      {/* ?juego is request data: read it inside Suspense (cacheComponents). */}
      <Suspense fallback={<HallFallback />}>
        <Hall searchParams={searchParams} />
      </Suspense>

      <div className="mt-8 text-center">
        <Link href="/juegos" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}

async function Hall({ searchParams }: { searchParams: SearchParams }) {
  const [{ juego }, games] = await Promise.all([searchParams, getGames()]);
  const requested = Array.isArray(juego) ? juego[0] : juego;
  // Missing or unknown ?juego falls back to the first game.
  const game = games.find((g) => g.id === requested) ?? games[0];
  const scores = await getScores(game.id);

  return (
    <>
      <HallTabs games={games} activeId={game.id} />
      <Podium scores={scores} />
      <HallTable scores={scores} />
    </>
  );
}

async function HallFallback() {
  const games = await getGames();
  return (
    <>
      <HallTabs games={games} activeId={null} />
      <div className="min-h-[60vh]" aria-busy="true" />
    </>
  );
}
