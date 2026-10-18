import type { ScoreEntry } from "@/app/data/scores";
import { formatDate, formatScore } from "./format";

// Top 3 laid out silver · gold · bronze, gold raised in the middle.
export function Podium({ scores }: { scores: ScoreEntry[] }) {
  const [first, second, third] = scores;

  return (
    <div className="podium">
      {second && <Slot entry={second} tier="silver" />}
      {first && <Slot entry={first} tier="gold" />}
      {third && <Slot entry={third} tier="bronze" />}
    </div>
  );
}

function Slot({
  entry,
  tier,
}: {
  entry: ScoreEntry;
  tier: "gold" | "silver" | "bronze";
}) {
  const gold = tier === "gold";
  return (
    <div className={"podium-slot " + tier}>
      {gold && (
        <div className="pixel text-[9px] tracking-[0.18em] text-gold">
          CAMPEÓN
        </div>
      )}
      <div className={"rank-num" + (gold ? " mt-1 text-4xl" : "")}>
        {String(entry.rank).padStart(2, "0")}
      </div>
      <div className="name">{entry.player}</div>
      <div className={"score" + (gold ? " text-xl" : "")}>
        {formatScore(entry.score)}
      </div>
      <div className="date">{formatDate(entry.date)}</div>
    </div>
  );
}
