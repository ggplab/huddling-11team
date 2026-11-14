export type FeedKind = 'commit' | 'pr' | 'fire' | 'rank';

export interface FeedItem {
  time: string;
  kind: FeedKind;
  /** 칩에 보이는 라벨 (커밋, 부스터, 미끄러짐, 순위 변동, 완주) */
  type: string;
  text: string;
}

export interface TeamStats {
  commits: number;
  prs: number;
  fails: number;
  /** 파트별 커밋 수 [기획, 디자인, 개발, 문서] */
  parts: number[];
  recent: FeedItem[];
}

/** 중계 팝오버(로워서드) 4종 */
export type BannerKind = 'pr' | 'fire' | 'rank' | 'finish';

export interface Banner {
  kind: BannerKind;
  /** 팀 번호 (1부터) */
  team: number;
  /** rank: 이전 선두 팀 번호 */
  prev?: number;
  /** finish: 몇 번째 완주인지 */
  order?: number;
  time: string;
  title: string;
  /** 캐스터/해설 멘트 */
  line: string;
}

export interface RaceState {
  tick: number;
  /** 경과 시간(초) */
  elapsed: number;
  commits: number;
  prs: number;
  /** 팀별 점수 (index 0 = 1팀) */
  scores: number[];
  stats: TeamStats[];
  /** 이번 틱에 미끄러진 팀 index */
  slip: Record<number, boolean>;
  /** 이번 틱에 부스터 쓴 팀 index */
  boost: Record<number, boolean>;
  /** 완주 순서대로 팀 index */
  finished: number[];
  /** 이번 틱 순위 변화 (+n 상승, -n 하락) */
  moves: Record<number, number>;
  feed: FeedItem[];
  banner: Banner | null;
}

/** 케이스별 고정 화면 (디자인 검수, QA용) */
export type Scenario = 'live' | 'pr' | 'fire' | 'rank' | 'finish';
