import type { ScoreEntry } from "@/app/data/scores";
import { formatDate, formatScore, rankLabel, topClass } from "./format";

const ROW_STAGGER_MS = 50;

export function HallTable({ scores }: { scores: ScoreEntry[] }) {
  return (
    <div className="hall-table">
      <div className="th">
        <div>RANGO</div>
        <div>JUGADOR</div>
        <div>PUNTUACIÓN</div>
        <div>FECHA</div>
      </div>
      {scores.map((r, i) => (
        <div
          key={r.player}
          className={"tr" + topClass(i)}
          style={{ animationDelay: `${i * ROW_STAGGER_MS}ms` }}
        >
          <div className="rk">{rankLabel(r.rank)}</div>
          <div className="pl">{r.player}</div>
          <div className="sc">{formatScore(r.score)}</div>
          <div className="dt">{formatDate(r.date)}</div>
        </div>
      ))}
    </div>
  );
}
