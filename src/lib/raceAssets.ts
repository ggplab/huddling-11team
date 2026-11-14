// 레이스 화면 그림 경로 모음. 그림 파일은 public/images/race/ 에 둔다.
// 조 번호에 따라 펭귄 네 종류가 돌아가며 배정된다(같은 조는 늘 같은 펭귄).
const PENGUINS = [
  '/images/race/penguin-classic.png',
  '/images/race/penguin-baby.png',
  '/images/race/penguin-sporty.png',
  '/images/race/penguin-developer.png',
]

export function penguinFor(teamNo: number): string {
  return PENGUINS[Math.abs(teamNo) % PENGUINS.length]
}
