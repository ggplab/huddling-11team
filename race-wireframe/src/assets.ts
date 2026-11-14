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
