/** 레이스 전역 설정. 운영 값은 여기 한 곳에서 바꾼다. */
export const CONFIG = {
  teamCount: 15,
  /** 강조할 우리 팀 번호 (1부터) */
  myTeam: 11,
  /** 결승선 점수 */
  goal: 1600,
  /** 해커톤 진행 시간(초) */
  durationSec: 3 * 3600,
  /** 시뮬레이션 시작 시각 표시용 (시 단위) */
  clockStartHour: 10,
  /** 이벤트 배너 노출 시간(ms) */
  bannerMs: 6500,
  /** 출발 후 레이스 화면으로 넘어가기까지(ms) */
  startToRaceMs: 3500,
  /** 파트(역할) 이름. 커밋 작성자를 파트에 매핑해서 '파트별 주행 기록'을 만든다 */
  parts: ['기획', '디자인', '개발', '문서'] as const,
} as const;

export type Speed = 'slow' | 'normal' | 'fast';
/** 시뮬레이션 틱 간격: 몇 초마다 이벤트 1개를 만들지 */
export const SPEED_EVERY: Record<Speed, number> = { slow: 4, normal: 2, fast: 1 };
