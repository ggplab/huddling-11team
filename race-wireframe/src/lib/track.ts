/**
 * S자 트랙 지오메트리. 트랙 좌표계는 1100×700 (화면에서는 0.84배로 축소해 그린다).
 * 직선 3개 + 반원 2개로 이루어져 있고, 진행률 t(0~1)로 트랙 위 좌표를 구한다.
 */
export const TRACK = {
  width: 1100,
  height: 700,
  scale: 0.84,
  x0: 195,
  x1: 905,
  y1: 110,
  r: 120,
  /** 트랙 폭(5레인 × 26px) */
  laneWidth: 26,
  lanes: 5,
} as const;

const Y2 = TRACK.y1 + 2 * TRACK.r;
const Y3 = Y2 + 2 * TRACK.r;
const SEG = TRACK.x1 - TRACK.x0;
const ARC = Math.PI * TRACK.r;
export const TRACK_LENGTH = SEG * 3 + ARC * 2;

export const TRACK_PATH =
  `M ${TRACK.x0} ${TRACK.y1} L ${TRACK.x1} ${TRACK.y1} ` +
  `A ${TRACK.r} ${TRACK.r} 0 0 1 ${TRACK.x1} ${Y2} L ${TRACK.x0} ${Y2} ` +
  `A ${TRACK.r} ${TRACK.r} 0 0 0 ${TRACK.x0} ${Y3} L ${TRACK.x1} ${Y3}`;

export interface TrackPoint {
  x: number;
  y: number;
  /** 진행 방향 단위벡터 */
  dx: number;
  dy: number;
}

export function pointAt(progress: number): TrackPoint {
  const { x0, x1, y1, r } = TRACK;
  let d = Math.max(0, Math.min(1, progress)) * TRACK_LENGTH;
  if (d <= SEG) return { x: x0 + d, y: y1, dx: 1, dy: 0 };
  d -= SEG;
  if (d <= ARC) {
    const a = -Math.PI / 2 + d / r;
    return { x: x1 + r * Math.cos(a), y: y1 + r + r * Math.sin(a), dx: -Math.sin(a), dy: Math.cos(a) };
  }
  d -= ARC;
  if (d <= SEG) return { x: x1 - d, y: Y2, dx: -1, dy: 0 };
  d -= SEG;
  if (d <= ARC) {
    const a = -Math.PI / 2 - d / r;
    return { x: x0 + r * Math.cos(a), y: Y2 + r + r * Math.sin(a), dx: Math.sin(a), dy: -Math.cos(a) };
  }
  d -= ARC;
  return { x: x0 + d, y: Y3, dx: 1, dy: 0 };
}

/** 팀 index를 5개 레인 중 하나에 배치했을 때의 좌표 */
export function runnerPosition(progress: number, teamIndex: number): { x: number; y: number } {
  const p = pointAt(progress);
  const lane = (teamIndex % TRACK.lanes) - 2;
  const nx = -p.dy;
  const ny = p.dx;
  return { x: Math.round(p.x + nx * lane * TRACK.laneWidth), y: Math.round(p.y + ny * lane * TRACK.laneWidth) };
}
