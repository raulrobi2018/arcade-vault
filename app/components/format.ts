// Shared display formatters (es-ES conventions used across the UI).

export const formatScore = (n: number) => n.toLocaleString("es-ES");

// "2026-05-11" → "11/05/2026". Parsed by hand to avoid timezone shifts.
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export const rankLabel = (rank: number) => `#${String(rank).padStart(2, "0")}`;

// Podium tier class used by .lb-row and .hall-table rows.
export function topClass(index: number) {
  return index === 0 ? " top1" : index === 1 ? " top2" : index === 2 ? " top3" : "";
}
