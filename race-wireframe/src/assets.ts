/**
 * 레이스 화면 그림 경로 모음. 조원 에셋이 새로 오면 이 파일만 바꾼다.
 * 그림 파일은 레포 루트의 public/images/race/ 에 둔다(배포 주소의 /images/race/).
 */
export const PENGUINS = [
  '/images/race/penguin-classic.png',
  '/images/race/penguin-baby.png',
  '/images/race/penguin-sporty.png',
  '/images/race/penguin-developer.png',
];

/** 조 번호(0부터)에 펭귄을 배정한다. 같은 조는 늘 같은 펭귄이다. */
export const penguinFor = (teamIndex: number) => PENGUINS[teamIndex % PENGUINS.length];

/** 파트(기획, 디자인, 개발, 문서) 순서와 같은 레벨 펭귄 이름 */
const PART_KEYS = ['planning', 'design', 'development', 'documentation'] as const;

/** 파트 커밋 수로 레벨(1~5)을 정한다. 0~1건 1, 2~4건 2, 5~9건 3, 10~19건 4, 20건 이상 5 */
export function partLevel(commits: number): number {
  if (commits >= 20) return 5;
  if (commits >= 10) return 4;
  if (commits >= 5) return 3;
  if (commits >= 2) return 2;
  return 1;
}

export const partPenguin = (partIndex: number, level: number) => `/images/race/penguins/penguin-${PART_KEYS[partIndex]}-level-${level}.png`;

/** 피그마 racing 소품 19장 (public/images/race/props) */
export const prop = (name: string) => `/images/race/props/${name}.png`;
