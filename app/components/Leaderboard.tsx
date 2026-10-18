import type { ScoreEntry } from "@/app/data/scores";
import { formatDate, formatScore, rankLabel, topClass } from "./format";

export function Leaderboard({ scores }: { scores: ScoreEntry[] }) {
  return (
    <div className="leaderboard">
      <h3>MEJORES PUNTUACIONES</h3>
      {scores.map((r, i) => (
        <div key={r.player} className={"lb-row" + topClass(i)}>
          <div className="rk">{rankLabel(r.rank)}</div>
          <div className="pl">
            {r.player}
            <div className="text-[10px] tracking-[0.1em] text-ink-faint">
              {formatDate(r.date)}
            </div>
          </div>
          <div className="sc">{formatScore(r.score)}</div>
        </div>
      ))}
    </div>
  );
}
