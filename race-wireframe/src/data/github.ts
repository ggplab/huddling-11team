/**
 * GitHub 연동 어댑터 (초안).
 *
 * 화면은 지금 data/simulation.ts 의 목업으로 돌아간다. 실제 해커톤에서는 아래 함수로
 * 15개 저장소를 1~2분마다 폴링해서 팀별 이벤트를 만들고, 점수 규칙(lib/score.ts)으로 계산한 뒤
 * RaceState 로 바꿔 useRace 에 넣으면 된다.
 *
 * 주의
 * - 토큰 없이 호출하면 시간당 60회 제한. 반드시 토큰 사용 (시간당 5,000회).
 * - 프론트에 토큰을 넣는 건 데모 한정. 운영은 서버/서버리스 함수에서 호출하고 결과만 내려줄 것.
 * - 커밋별 변경 줄 수(stats)는 커밋 상세 API를 따로 불러야 해서 호출 수가 늘어난다.
 *   여유가 없으면 변경량 보너스를 빼고 커밋 기본 점수 + PR + CI만으로 시작해도 된다.
 * - 작성자 → 파트(기획/디자인/개발/문서) 매핑은 운영자 설정에서 받는 걸 전제로 한다.
 */
import { applyRateLimit, commitScore, SCORE } from '../lib/score';

export interface TeamRepo {
  team: number;
  /** owner/repo */
  repo: string;
}

export type RaceEvent =
  | { type: 'commit'; team: number; sha: string; author: string; at: number; message: string; changedLines: number }
  | { type: 'pr'; team: number; number: number; author: string; at: number; title: string }
  | { type: 'ci_failed'; team: number; runId: number; at: number; name: string };

const API = 'https://api.github.com';

async function gh<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

interface GhCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  author: { login: string } | null;
  parents: unknown[];
}
interface GhCommitDetail {
  stats?: { additions: number; deletions: number };
  files?: { filename: string; additions: number; deletions: number }[];
}
interface GhPull {
  number: number;
  title: string;
  merged_at: string | null;
  user: { login: string } | null;
}
interface GhRuns {
  workflow_runs: { id: number; name: string; conclusion: string | null; created_at: string }[];
}

/** 한 팀 저장소에서 since 이후 이벤트를 가져온다 */
export async function fetchTeamEvents(t: TeamRepo, sinceIso: string, token?: string, withLineStats = false): Promise<RaceEvent[]> {
  const [commits, pulls, runs] = await Promise.all([
    gh<GhCommit[]>(`/repos/${t.repo}/commits?since=${encodeURIComponent(sinceIso)}&per_page=100`, token),
    gh<GhPull[]>(`/repos/${t.repo}/pulls?state=closed&sort=updated&direction=desc&per_page=50`, token),
    gh<GhRuns>(`/repos/${t.repo}/actions/runs?created=>=${encodeURIComponent(sinceIso)}&per_page=50`, token).catch(() => ({ workflow_runs: [] })),
  ]);

  const since = Date.parse(sinceIso);
  const events: RaceEvent[] = [];

  for (const c of commits) {
    if (c.parents.length > 1) continue; // 머지 커밋은 PR 점수로만
    let changedLines: number = SCORE.minChangedLines; // 상세 미조회 시 기본 인정
    if (withLineStats) {
      const d = await gh<GhCommitDetail>(`/repos/${t.repo}/commits/${c.sha}`, token);
      changedLines = (d.files ?? [])
        .filter((f) => !SCORE.ignoredPaths.some((re) => re.test(f.filename)))
        .reduce((sum: number, f) => sum + f.additions + f.deletions, 0);
    }
    events.push({
      type: 'commit',
      team: t.team,
      sha: c.sha,
      author: c.author?.login ?? c.commit.author.name,
      at: Date.parse(c.commit.author.date),
      message: c.commit.message.split('\n')[0],
      changedLines,
    });
  }
  for (const p of pulls) {
    if (!p.merged_at || Date.parse(p.merged_at) < since) continue;
    events.push({ type: 'pr', team: t.team, number: p.number, author: p.user?.login ?? '', at: Date.parse(p.merged_at), title: p.title });
  }
  for (const r of runs.workflow_runs) {
    if (r.conclusion !== 'failure') continue;
    events.push({ type: 'ci_failed', team: t.team, runId: r.id, at: Date.parse(r.created_at), name: r.name });
  }
  return events.sort((a, b) => a.at - b.at);
}

/** 이벤트 목록 → 팀 점수 */
export function scoreEvents(events: RaceEvent[]): number {
  const commits = applyRateLimit(events.filter((e): e is Extract<RaceEvent, { type: 'commit' }> => e.type === 'commit'));
  const commitPts = commits.reduce((sum, c) => sum + commitScore(c.changedLines), 0);
  const prPts = events.filter((e) => e.type === 'pr').length * SCORE.prMerged;
  const ciPts = events.filter((e) => e.type === 'ci_failed').length * SCORE.ciFailed;
  return Math.max(0, commitPts + prPts + ciPts);
}

/** .env 의 VITE_TEAM_REPOS 를 TeamRepo[] 로 */
export function teamReposFromEnv(): TeamRepo[] {
  const raw = (import.meta.env.VITE_TEAM_REPOS as string | undefined) ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((repo, i) => ({ team: i + 1, repo }));
}
