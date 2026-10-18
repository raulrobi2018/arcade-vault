// Mock high scores: 12 static entries per game, sorted by score descending.
// The #1 score of each game matches its `best` in games.ts.

export type ScoreEntry = {
  rank: number;
  player: string;
  score: number;
  date: string; // ISO "YYYY-MM-DD"
};

type Row = [player: string, score: number, date: string];

const SCORES: Record<string, Row[]> = {
  "bloque-buster": [
    ["PX_KAI", 28450, "2026-09-28"],
    ["NEONFOX", 27120, "2026-09-14"],
    ["GLITCHA", 25980, "2026-08-30"],
    ["Z3R0COOL", 24310, "2026-08-02"],
    ["SCANLINE", 22870, "2026-07-19"],
    ["BIT_LORD", 21540, "2026-07-03"],
    ["RGB_QUEEN", 19900, "2026-06-21"],
    ["VAULT_07", 18260, "2026-06-08"],
    ["DROID_X", 16730, "2026-05-25"],
    ["JOY_STK", 15180, "2026-05-11"],
    ["ARKADYA", 13420, "2026-04-27"],
    ["PIXEL_DAD", 11950, "2026-04-09"],
  ],
  caida: [
    ["M00NRYU", 184220, "2026-10-03"],
    ["RETROVIRA", 171880, "2026-09-22"],
    ["PX_KAI", 160340, "2026-09-05"],
    ["CYBER_LU", 148910, "2026-08-17"],
    ["MAGENTA88", 139270, "2026-08-01"],
    ["VECTORX", 126550, "2026-07-12"],
    ["NEONFOX", 118030, "2026-06-29"],
    ["ATARI_KID", 104760, "2026-06-10"],
    ["GLITCHA", 97420, "2026-05-23"],
    ["SCANLINE", 88150, "2026-05-02"],
    ["DROID_X", 79630, "2026-04-15"],
    ["JOY_STK", 71200, "2026-03-28"],
  ],
  serpentina: [
    ["VECTORX", 7820, "2026-09-30"],
    ["ARKADYA", 7410, "2026-09-11"],
    ["BIT_LORD", 6980, "2026-08-24"],
    ["PIXEL_DAD", 6630, "2026-08-06"],
    ["NEONFOX", 6170, "2026-07-21"],
    ["M00NRYU", 5840, "2026-07-04"],
    ["CYBER_LU", 5390, "2026-06-16"],
    ["Z3R0COOL", 4960, "2026-05-30"],
    ["RGB_QUEEN", 4520, "2026-05-13"],
    ["VAULT_07", 4180, "2026-04-26"],
    ["GLITCHA", 3750, "2026-04-08"],
    ["ATARI_KID", 3310, "2026-03-19"],
  ],
  gloton: [
    ["RGB_QUEEN", 96400, "2026-10-06"],
    ["ATARI_KID", 91250, "2026-09-19"],
    ["SCANLINE", 87630, "2026-09-02"],
    ["PX_KAI", 82140, "2026-08-14"],
    ["DROID_X", 77980, "2026-07-27"],
    ["MAGENTA88", 71260, "2026-07-09"],
    ["RETROVIRA", 66840, "2026-06-22"],
    ["JOY_STK", 60310, "2026-06-03"],
    ["BIT_LORD", 55720, "2026-05-18"],
    ["NEONFOX", 50190, "2026-04-30"],
    ["VECTORX", 46380, "2026-04-12"],
    ["CYBER_LU", 41920, "2026-03-25"],
  ],
  invasores: [
    ["Z3R0COOL", 54190, "2026-09-26"],
    ["DROID_X", 51060, "2026-09-09"],
    ["VAULT_07", 48730, "2026-08-21"],
    ["ARKADYA", 45220, "2026-08-04"],
    ["GLITCHA", 42870, "2026-07-17"],
    ["PIXEL_DAD", 39410, "2026-06-30"],
    ["M00NRYU", 36650, "2026-06-12"],
    ["SCANLINE", 33280, "2026-05-27"],
    ["RETROVIRA", 30940, "2026-05-09"],
    ["RGB_QUEEN", 27510, "2026-04-21"],
    ["PX_KAI", 24830, "2026-04-03"],
    ["MAGENTA88", 21460, "2026-03-16"],
  ],
  rocas: [
    ["CYBER_LU", 41200, "2026-10-01"],
    ["JOY_STK", 39370, "2026-09-16"],
    ["VECTORX", 36820, "2026-08-28"],
    ["NEONFOX", 34510, "2026-08-10"],
    ["ATARI_KID", 31960, "2026-07-24"],
    ["Z3R0COOL", 29740, "2026-07-06"],
    ["BIT_LORD", 27180, "2026-06-19"],
    ["GLITCHA", 24630, "2026-06-01"],
    ["ARKADYA", 22290, "2026-05-15"],
    ["DROID_X", 19870, "2026-04-28"],
    ["M00NRYU", 17420, "2026-04-10"],
    ["VAULT_07", 15060, "2026-03-22"],
  ],
  ranaria: [
    ["PIXEL_DAD", 18900, "2026-09-24"],
    ["MAGENTA88", 17650, "2026-09-07"],
    ["RGB_QUEEN", 16820, "2026-08-19"],
    ["RETROVIRA", 15430, "2026-08-03"],
    ["PX_KAI", 14710, "2026-07-15"],
    ["SCANLINE", 13380, "2026-06-27"],
    ["VAULT_07", 12260, "2026-06-09"],
    ["CYBER_LU", 11140, "2026-05-21"],
    ["JOY_STK", 10050, "2026-05-04"],
    ["ATARI_KID", 9320, "2026-04-17"],
    ["NEONFOX", 8170, "2026-03-30"],
    ["BIT_LORD", 7240, "2026-03-12"],
  ],
  "duelo-pixel": [
    ["ARKADYA", 24, "2026-10-04"],
    ["GLITCHA", 23, "2026-09-18"],
    ["DROID_X", 21, "2026-09-01"],
    ["M00NRYU", 20, "2026-08-13"],
    ["VECTORX", 19, "2026-07-26"],
    ["NEONFOX", 17, "2026-07-08"],
    ["Z3R0COOL", 16, "2026-06-20"],
    ["RETROVIRA", 15, "2026-06-02"],
    ["PIXEL_DAD", 13, "2026-05-16"],
    ["CYBER_LU", 12, "2026-04-29"],
    ["SCANLINE", 11, "2026-04-11"],
    ["MAGENTA88", 9, "2026-03-24"],
  ],
};

export async function getScores(
  gameId: string,
  limit?: number,
): Promise<ScoreEntry[]> {
  const rows = SCORES[gameId] ?? [];
  return rows
    .slice(0, limit)
    .map(([player, score, date], i) => ({ rank: i + 1, player, score, date }));
}
