import { CONFIG } from '../config';

export function hms(totalSec: number): string {
  const v = Math.max(0, Math.floor(totalSec));
  return [Math.floor(v / 3600), Math.floor(v / 60) % 60, v % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

/** 경과 초 → 벽시계 HH:MM */
export function clockAt(elapsedSec: number): string {
  const t = CONFIG.clockStartHour * 3600 + elapsedSec;
  return `${String(Math.floor(t / 3600) % 24).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}`;
}

/** 점수 배열 → 팀 index별 순위(1부터) */
export function rankMap(scores: number[]): Record<number, number> {
  const map: Record<number, number> = {};
  scores
    .map((s, i) => ({ i, s }))
    .sort((a, b) => b.s - a.s)
    .forEach((t, k) => {
      map[t.i] = k + 1;
    });
  return map;
}

export function sortedTeams(scores: number[]): { i: number; score: number }[] {
  return scores.map((score, i) => ({ i, score })).sort((a, b) => b.score - a.score);
}
