// 레이싱 화면 그림 경로 모음. 그림 파일은 public/images/race/ 에 넣고 여기 경로만 적는다.
// 예: car: '/images/race/car.png'. 비어 있으면(undefined) 임시 모양을 그린다.
export const raceAssets: {
  car?: string
  trackBackground?: string
  finishFlag?: string
  carByTeam?: Record<string, string> // 조 id -> 그림 경로
} = {
  car: undefined,
  trackBackground: undefined,
  finishFlag: undefined,
  carByTeam: {},
}
