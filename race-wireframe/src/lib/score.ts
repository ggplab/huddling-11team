/**
 * 점수(=트랙 위 진행 거리) 규칙.
 * 기획서의 점수 표를 코드로 옮긴 것. GitHub 연동(data/github.ts)과 시뮬레이션이 같이 쓴다.
 */
export const SCORE = {
  /** 커밋 1개 기본 점수 */
  commitBase: 10,
  /** 변경량 보너스: 변경 줄 수 × 0.1, 커밋당 최대 */
  commitLineBonusMax: 20,
  commitLineBonusRate: 0.1,
  /** 변경 3줄 미만 커밋은 0점 */
  minChangedLines: 3,
  /** PR 머지 = 부스터 */
  prMerged: 30,
  /** CI 실패 = 미끄러짐 */
  ciFailed: -5,
  /** 어뷰징 방지: 1인당 10분에 커밋 3개까지만 인정 */
  rateLimit: { windowMs: 10 * 60 * 1000, maxCommits: 3 },
  /** 점수 계산에서 제외할 파일 패턴 */
  ignoredPaths: [/package-lock\.json$/, /yarn\.lock$/, /pnpm-lock\.yaml$/, /(^|\/)dist\//, /(^|\/)build\//, /\.(png|jpe?g|gif|webp|svg|ico)$/i],
} as const;

export function commitScore(changedLines: number): number {
  if (changedLines < SCORE.minChangedLines) return 0;
  const bonus = Math.min(SCORE.commitLineBonusMax, Math.round(changedLines * SCORE.commitLineBonusRate));
  return SCORE.commitBase + bonus;
}

/**
 * 작성자별 커밋을 시간순으로 받아 rate limit을 넘는 커밋을 걸러낸다.
 * @returns 인정된 커밋만
 */
export function applyRateLimit<T extends { author: string; at: number }>(commits: T[]): T[] {
  const byAuthor = new Map<string, number[]>();
  const accepted: T[] = [];
  for (const c of [...commits].sort((a, b) => a.at - b.at)) {
    const times = byAuthor.get(c.author) ?? [];
    const recent = times.filter((t) => c.at - t < SCORE.rateLimit.windowMs);
    if (recent.length < SCORE.rateLimit.maxCommits) {
      recent.push(c.at);
      accepted.push(c);
    }
    byAuthor.set(c.author, recent);
  }
  return accepted;
}
