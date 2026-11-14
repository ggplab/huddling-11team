/** 디자인 토큰. 와이어프레임에서 쓴 값 그대로. */
export const color = {
  bg: '#F3F3F1',
  surface: '#FFFFFF',
  line: '#D6D6D2',
  lineSoft: '#EDEDEA',
  text: '#1B1B1A',
  textMuted: '#5E5E5A',
  ink: '#1B1B1A',
  inkRow: '#2A2A2E',
  accent: '#2459D6',
  accentSoft: '#E6EDFB',
  myTeamRing: '#FCE7A8',
  field: '#A8C98F',
  track: '#D9604A',
  stands: '#D9D6CC',
  seat: '#5A5FC9',
  live: '#B42318',
  liveSoft: '#FDECEC',
  boost: '#2459D6',
  slip: '#D9622B',
  lead: '#E8B931',
  up: '#5BD48A',
  down: '#FF8A7A',
} as const;

/** 금, 은, 동 (트로피/메달) */
export const MEDAL = ['#E8B931', '#C9CCD1', '#C98B4E'] as const;
export const MEDAL_DARK = ['#A67C00', '#8E9299', '#8A5A2B'] as const;
export const MEDAL_RGB = ['232,185,49', '201,204,209', '201,139,78'] as const;

/** 출발 블록 번호 타일 색 (레퍼런스 에셋의 1~6 블록) */
export const TILE_BG = ['#FFFFFF', '#55555B', '#2E9D52', '#E8564A', '#F2C230', '#3A6FE0'] as const;
export const TILE_FG = ['#1B1B1A', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#1B1B1A', '#FFFFFF'] as const;

/** 파트별 색 (기획, 디자인, 개발, 문서) */
export const PART_COLORS = ['#2459D6', '#0F7B6C', '#B4540A', '#6B2FA8'] as const;

/** 팀 고유 색. 우리 팀은 accent. index는 0부터 */
export function teamColor(index: number, myTeamIndex: number, accent: string = color.accent): string {
  if (index === myTeamIndex) return accent;
  return `hsl(${Math.round(index * 24)}, 45%, 38%)`;
}

export const FONT = "'Noto Sans KR', system-ui, sans-serif";
