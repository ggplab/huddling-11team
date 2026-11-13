// 가짜 데이터. 실제 서버가 붙기 전까지 화면은 이 값을 쓴다.
export type Item = {
  id: number
  title: string
  description: string
}

export const items: Item[] = [
  { id: 1, title: '첫 번째 항목', description: '가짜 데이터입니다. 주제가 정해지면 바꿉니다.' },
  { id: 2, title: '두 번째 항목', description: '화면을 먼저 만들고 실제 데이터는 나중에 붙입니다.' },
  { id: 3, title: '세 번째 항목', description: '필요한 칸이 있으면 개발 담당에게 말합니다.' },
]
