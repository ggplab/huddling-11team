// 조 번호로 차 색을 정한다. 조가 15개여도 이웃한 조 색이 겹치지 않게 색상환을 황금각으로 나눈다.
export function teamNumber(team: string): number {
  const digits = team.match(/\d+/)
  if (digits) return Number(digits[0])
  const letter = team.trim().charAt(0).toUpperCase().charCodeAt(0) - 64 // A=1
  return letter > 0 ? letter : 1
}

export function teamColor(team: string): string {
  const hue = (teamNumber(team) * 137.5) % 360
  return `hsl(${hue.toFixed(0)} 70% 50%)`
}
