import type { FeedItem, RaceState } from './types';

/**
 * 실제 수집본(public/data/snapshot.json)을 레이스 상태에 섞는다.
 * 점수, 커밋 수, PR 머지 수, 파트별 기록, 최근 중계는 실제 기록으로 바꾸고,
 * 그 뒤의 진행은 시뮬레이션이 이어 간다. 수집본이 없으면 시뮬레이션만 돈다.
 */

type SnapEvent = { at: string; team: string; type: 'commit' | 'merge' | 'conflict'; kind: string; message: string };
type SnapTeam = { id: string; commits: number; prs: { merged: number; conflicting: number } };
type Snapshot = { teams: SnapTeam[]; events: SnapEvent[] };

const KIND_INDEX: Record<string, number> = { plan: 0, design: 1, dev: 2, docs: 3 };
const LEADER_SCORE = 1250; // 실제 1위를 결승선(1600) 앞 이 지점에 둔다
const REAL_SHARE = 0.7; // 출발 점수 중 실제 기록이 차지하는 비율

function hhmm(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toFeed(e: SnapEvent, withTeam: boolean): FeedItem {
  const who = withTeam ? `${Number(e.team)}팀, ` : '';
  const msg = e.message.split('\n')[0].slice(0, 40);
  if (e.type === 'merge') return { time: hhmm(e.at), kind: 'pr', type: '부스터', text: `${who}PR 머지, "${msg}"` };
  if (e.type === 'conflict') return { time: hhmm(e.at), kind: 'fire', type: '미끄러짐', text: `${who}충돌, "${msg}"` };
  return { time: hhmm(e.at), kind: 'commit', type: '커밋', text: `${who}"${msg}"` };
}

export async function loadSnapshot(): Promise<Snapshot | null> {
  try {
    const res = await fetch('/data/snapshot.json', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Snapshot;
  } catch {
    return null;
  }
}

export function blendReal(prev: RaceState, snap: Snapshot): RaceState {
  const events = [...snap.events].sort((a, b) => a.at.localeCompare(b.at));
  // 커밋 하나가 파트별로 나뉘어 여러 줄이므로 중계에는 한 번만 보인다
  const seen = new Set<string>();
  const uniq = events.filter((e) => {
    const k = `${e.at}|${e.team}|${e.type}|${e.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const raw = prev.scores.map((_, i) => {
    const t = snap.teams.find((x) => Number(x.id) === i + 1);
    if (!t) return 0;
    return t.commits * 10 + t.prs.merged * 30 - t.prs.conflicting * 10;
  });
  const max = Math.max(1, ...raw);
  const scores = prev.scores.map((sim, i) => Math.round((raw[i] / max) * LEADER_SCORE * REAL_SHARE + sim * (1 - REAL_SHARE)));
  const stats = prev.stats.map((st, i) => {
    const t = snap.teams.find((x) => Number(x.id) === i + 1);
    if (!t) return st;
    const mine = events.filter((e) => Number(e.team) === i + 1);
    const parts = [0, 0, 0, 0];
    mine.filter((e) => e.type === 'commit').forEach((e) => (parts[KIND_INDEX[e.kind] ?? 2] += 1));
    const recent = uniq.filter((e) => Number(e.team) === i + 1).slice(-4).reverse().map((e) => toFeed(e, false));
    return { ...st, commits: t.commits, prs: t.prs.merged, fails: t.prs.conflicting, parts, recent: recent.length ? recent : st.recent };
  });
  const feed = uniq.slice(-6).reverse().map((e) => toFeed(e, true));
  return {
    ...prev,
    scores,
    stats,
    commits: snap.teams.reduce((s, t) => s + t.commits, 0),
    prs: snap.teams.reduce((s, t) => s + t.prs.merged, 0),
    feed: feed.length ? feed : prev.feed,
  };
}
