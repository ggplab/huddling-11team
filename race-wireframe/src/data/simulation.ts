import { CONFIG } from '../config';
import { clockAt, rankMap } from '../lib/format';
import type { Banner, FeedItem, RaceState, Scenario, TeamStats } from './types';

/**
 * 목업 시뮬레이션. 실제 GitHub 데이터 없이 레이스가 굴러가는 걸 보여 주기 위한 용도.
 * 실제 연동 시에는 data/github.ts 의 폴링 결과를 같은 RaceState 형태로 만들어 넘기면 된다.
 */

const INITIAL_SCORES = [640, 520, 980, 410, 300, 720, 870, 560, 450, 690, 1240, 380, 610, 290, 500];
const PART_WEIGHTS = [0.4, 0.28, 0.2, 0.12];

const PART_MESSAGES: string[][] = [
  ['docs: 기능 명세 업데이트', 'docs: 사용자 플로우 정리', 'chore: 이슈 템플릿 추가'],
  ['style: 버튼 컬러 조정', 'style: 순위 타워 여백 수정', 'feat: 트로피 아이콘 추가'],
  ['feat: GitHub API 연동', 'fix: 진짜 마지막 수정', 'refactor: 점수 계산 분리'],
  ['docs: README 업데이트', 'docs: 발표 스크립트 추가', 'docs: 설치 가이드 정리'],
];

export function bannerCopy(kind: Banner['kind'], team: number, extra: { prev?: number; order?: number } = {}): Pick<Banner, 'title' | 'line'> {
  switch (kind) {
    case 'pr':
      return { title: `${team}팀, 부스터 발동!`, line: '캐스터, PR이 머지됩니다! 단숨에 +30, 순식간에 치고 나가요' };
    case 'fire':
      return { title: `${team}팀, 바나나를 밟았어요`, line: '해설, 빌드가 깨졌네요. 잠깐 주춤하지만 다음 커밋이면 바로 복구됩니다' };
    case 'rank':
      return { title: `${team}팀, 선두 탈환!`, line: `캐스터, 역전입니다! ${extra.prev}팀을 제치고 ${team}팀이 1위로 올라섭니다` };
    case 'finish':
      return {
        title: `${team}팀, 결승선 통과!`,
        line: extra.order === 1 ? '캐스터, 커밋 레이스 첫 완주 팀이 나왔습니다!' : `캐스터, ${extra.order}번째로 결승선을 통과합니다!`,
      };
  }
}

export function createInitialState(): RaceState {
  const stats: TeamStats[] = INITIAL_SCORES.map((score, i) => {
    const commits = Math.round(score / 12);
    const rotated = PART_WEIGHTS.slice(i % 4).concat(PART_WEIGHTS.slice(0, i % 4));
    const parts = rotated.map((w) => Math.round(commits * w));
    return {
      commits: parts.reduce((a, b) => a + b, 0),
      prs: Math.round(score / 200),
      fails: i % 4,
      parts,
      recent: [
        { time: `11:3${i % 10}`, kind: 'commit', type: '커밋', text: '디자인, "style: 첫 화면 레이아웃"' },
        { time: `11:2${i % 10}`, kind: 'pr', type: '부스터', text: 'PR 머지, 개발' },
      ],
    };
  });
  return {
    tick: 0,
    elapsed: 6130,
    commits: 1284,
    prs: 96,
    scores: [...INITIAL_SCORES],
    stats,
    slip: {},
    boost: {},
    finished: [],
    moves: {},
    feed: [
      { time: '11:42', kind: 'pr', type: '부스터', text: '11팀, PR 머지로 단숨에 +30' },
      { time: '11:41', kind: 'commit', type: '커밋', text: '3팀, "fix: 진짜 마지막 수정"' },
      { time: '11:40', kind: 'fire', type: '미끄러짐', text: '3팀, CI 실패로 잠깐 주춤' },
      { time: '11:35', kind: 'rank', type: '순위 변동', text: '7팀, 3위로 올라섰어요' },
    ],
    banner: null,
  };
}

/** 팝오버 케이스별 고정 화면 (QA, 디자인 검수용). ?scenario=pr 처럼 쓴다 */
export function createScenarioState(scenario: Scenario): RaceState {
  const st = createInitialState();
  if (scenario === 'live') return st;
  const add = (item: FeedItem) => {
    st.feed = [item, ...st.feed].slice(0, 8);
  };
  const s = st.scores;
  if (scenario === 'pr') {
    s[10] = 1270;
    st.boost = { 10: true };
    st.elapsed = 6190;
    st.prs = 97;
    add({ time: '11:43', kind: 'pr', type: '부스터', text: '11팀, PR 머지로 단숨에 +30' });
    st.banner = { kind: 'pr', team: 11, time: '11:43', ...bannerCopy('pr', 11) };
  } else if (scenario === 'fire') {
    s[2] = 975;
    st.slip = { 2: true };
    st.elapsed = 6250;
    add({ time: '11:44', kind: 'fire', type: '미끄러짐', text: '3팀, CI 실패로 잠깐 주춤' });
    st.banner = { kind: 'fire', team: 3, time: '11:44', ...bannerCopy('fire', 3) };
  } else if (scenario === 'rank') {
    s[6] = 1255;
    st.moves = { 6: 2, 10: -1, 2: -1 };
    st.elapsed = 6420;
    add({ time: '11:47', kind: 'rank', type: '순위 변동', text: '7팀, 선두 등극' });
    st.banner = { kind: 'rank', team: 7, prev: 11, time: '11:47', ...bannerCopy('rank', 7, { prev: 11 }) };
  } else if (scenario === 'finish') {
    s[10] = CONFIG.goal;
    s[6] = 1430;
    s[2] = 1385;
    s[0] = 1200;
    st.finished = [10];
    st.elapsed = 10180;
    add({ time: '12:49', kind: 'rank', type: '완주', text: '11팀, 1번째로 결승선 통과' });
    st.banner = { kind: 'finish', team: 11, order: 1, time: '12:49', ...bannerCopy('finish', 11, { order: 1 }) };
  }
  return st;
}

export interface StepOptions {
  goal: number;
  myTeam: number;
  /** 사이드 패널에서 선택한 팀 index (데모용으로 이벤트가 조금 더 자주 생김) */
  selected: number | null;
  random?: () => number;
}

/** 이벤트 1개를 만들어 다음 상태를 돌려준다 (순수 함수) */
export function simulateEvent(prev: RaceState, opts: StepOptions): RaceState {
  const rnd = opts.random ?? Math.random;
  const scores = prev.scores.slice();
  const finished = prev.finished.slice();
  const slip: Record<number, boolean> = {};
  const boost: Record<number, boolean> = {};
  const leaderBefore = scores.indexOf(Math.max(...scores));

  let idx = rnd() < 0.18 ? opts.myTeam - 1 : Math.floor(rnd() * scores.length);
  if (opts.selected !== null && rnd() < 0.2) idx = opts.selected;
  if (finished.includes(idx)) idx = (idx + 5) % scores.length;
  const team = idx + 1;
  const time = clockAt(prev.elapsed);

  const st: TeamStats = { ...prev.stats[idx], parts: prev.stats[idx].parts.slice() };
  const total = st.parts.reduce((a, b) => a + b, 0) || 1;
  let x = rnd() * total;
  let part = 3;
  for (let k = 0; k < 4; k++) {
    x -= st.parts[k];
    if (x <= 0) {
      part = k;
      break;
    }
  }
  const partName = CONFIG.parts[part];

  let item: FeedItem;
  let teamItem: FeedItem;
  let banner: Banner | null = null;
  let commits = prev.commits;
  let prs = prev.prs;
  const r = rnd();
  if (r < 0.14) {
    scores[idx] += 30;
    prs += 1;
    boost[idx] = true;
    st.prs += 1;
    item = { time, kind: 'pr', type: '부스터', text: `${team}팀, PR 머지로 단숨에 +30` };
    teamItem = { time, kind: 'pr', type: '부스터', text: `PR 머지, ${partName}, +30` };
    banner = { kind: 'pr', team, time, ...bannerCopy('pr', team) };
  } else if (r < 0.22) {
    scores[idx] = Math.max(0, scores[idx] - 5);
    slip[idx] = true;
    st.fails += 1;
    item = { time, kind: 'fire', type: '미끄러짐', text: `${team}팀, CI 실패로 잠깐 주춤` };
    teamItem = { time, kind: 'fire', type: '미끄러짐', text: `CI 실패, ${partName} 파트 커밋, -5` };
    banner = { kind: 'fire', team, time, ...bannerCopy('fire', team) };
  } else {
    const gain = 10 + Math.floor(rnd() * 3) * 5;
    scores[idx] += gain;
    commits += 1;
    st.commits += 1;
    st.parts[part] += 1;
    const pool = PART_MESSAGES[part];
    const msg = pool[Math.floor(rnd() * pool.length)];
    item = { time, kind: 'commit', type: '커밋', text: `${team}팀, "${msg}"` };
    teamItem = { time, kind: 'commit', type: '커밋', text: `${partName}, "${msg}", +${gain}` };
  }
  st.recent = [teamItem, ...st.recent].slice(0, 6);
  const stats = prev.stats.slice();
  stats[idx] = st;

  let feed = [item, ...prev.feed];
  if (scores[idx] >= opts.goal && !finished.includes(idx)) {
    finished.push(idx);
    banner = { kind: 'finish', team, order: finished.length, time, ...bannerCopy('finish', team, { order: finished.length }) };
    feed = [{ time, kind: 'rank', type: '완주', text: `${team}팀, ${finished.length}번째로 결승선 통과` }, ...feed];
  } else {
    const leaderAfter = scores.indexOf(Math.max(...scores));
    if (leaderAfter !== leaderBefore) {
      banner = { kind: 'rank', team: leaderAfter + 1, prev: leaderBefore + 1, time, ...bannerCopy('rank', leaderAfter + 1, { prev: leaderBefore + 1 }) };
      feed = [{ time, kind: 'rank', type: '순위 변동', text: `${leaderAfter + 1}팀, 선두 등극` }, ...feed];
    }
  }

  const before = rankMap(prev.scores);
  const after = rankMap(scores);
  const moves: Record<number, number> = {};
  for (let i = 0; i < scores.length; i++) if (before[i] !== after[i]) moves[i] = before[i] - after[i];

  return { ...prev, scores, stats, finished, slip, boost, moves, commits, prs, feed: feed.slice(0, 8), banner: banner ?? prev.banner };
}
