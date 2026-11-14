// 시연용 예시 데이터. 실제 조의 기록이 아니다.
// 가상의 네 조가 3시간 동안 올린 커밋을 씨앗값으로 만들어 낸다. 값을 바꾸면 이야기가 바뀐다.
export type Kind = 'dev' | 'design' | 'plan' | 'docs'
export type EventType = 'commit' | 'merge' | 'conflict'

export type CommitEvent = {
  id: number
  t: number // 시작 후 몇 분
  team: string
  kind: Kind
  type: EventType
  weight: 1 | 2 | 3 // 1 작은 수정, 2 기능 하나, 3 핵심 구조
  author: string
  message: string
}

export const DURATION = 180 // 분

export const KINDS: { key: Kind; label: string; building: string }[] = [
  { key: 'dev', label: '개발', building: '아파트' },
  { key: 'design', label: '디자인', building: '상점가' },
  { key: 'plan', label: '기획', building: '시청' },
  { key: 'docs', label: '문서', building: '표지판' },
]

export type Team = { id: string; team: string; city: string; service: string; authors: string[] }

export const TEAMS: Team[] = [
  { id: 'A', team: 'A조', city: '새벽시', service: '우산 챙겨 알림', authors: ['haneul', 'dotori', 'bom'] },
  { id: 'B', team: 'B조', city: '파도시', service: '지하철 환승 길잡이', authors: ['pado', 'sora', 'mulgyeol'] },
  { id: 'C', team: 'C조', city: '숲속시', service: '냉장고 털이 요리', authors: ['sup', 'iseul', 'namu'] },
  { id: 'D', team: 'D조', city: '별빛시', service: '약속 출발 알림', authors: ['byeol', 'dal', 'gureum'] },
]

// 구간마다 분당 커밋 확률, 구역 비중(개발, 디자인, 기획, 문서), 충돌 확률을 정한다.
type Phase = { from: number; to: number; rate: number; mix: [number, number, number, number]; conflict: number }

const PROFILES: Record<string, Phase[]> = {
  // 고르게 짓는 조
  A: [
    { from: 0, to: 30, rate: 0.3, mix: [0.1, 0.2, 0.5, 0.2], conflict: 0 },
    { from: 30, to: 150, rate: 0.45, mix: [0.35, 0.35, 0.1, 0.2], conflict: 0.04 },
    { from: 150, to: 180, rate: 0.35, mix: [0.3, 0.2, 0.1, 0.4], conflict: 0.02 },
  ],
  // 개발만 달리다 충돌이 잦은 조
  B: [
    { from: 0, to: 20, rate: 0.2, mix: [0.6, 0.1, 0.3, 0], conflict: 0 },
    { from: 20, to: 60, rate: 0.6, mix: [0.8, 0.1, 0.05, 0.05], conflict: 0.08 },
    { from: 60, to: 110, rate: 0.7, mix: [0.75, 0.15, 0.05, 0.05], conflict: 0.25 },
    { from: 110, to: 180, rate: 0.5, mix: [0.7, 0.2, 0, 0.1], conflict: 0.1 },
  ],
  // 기획만 오래 하다 뒤늦게 몰아 짓는 조
  C: [
    { from: 0, to: 90, rate: 0.08, mix: [0, 0, 0.6, 0.4], conflict: 0 },
    { from: 90, to: 180, rate: 0.75, mix: [0.35, 0.5, 0.05, 0.1], conflict: 0.06 },
  ],
  // 잘 가다가 한 시간 가까이 멈춘 조
  D: [
    { from: 0, to: 40, rate: 0.4, mix: [0.2, 0.3, 0.4, 0.1], conflict: 0.02 },
    { from: 40, to: 100, rate: 0.45, mix: [0.4, 0.4, 0.1, 0.1], conflict: 0.05 },
    { from: 100, to: 155, rate: 0, mix: [1, 0, 0, 0], conflict: 0 },
    { from: 155, to: 180, rate: 0.3, mix: [0.5, 0.3, 0, 0.2], conflict: 0.05 },
  ],
}

const MESSAGES: Record<Kind, string[]> = {
  dev: ['버튼 동작 연결', '목록 데이터 불러오기', '저장 기능 추가', '입력값 검사 추가', '서버 함수 연결', '오류 화면 처리'],
  design: ['첫 화면 배치 다듬기', '버튼 색과 모서리 통일', '모바일 여백 조정', '아이콘 교체', '카드 그림자 정리'],
  plan: ['한 줄 기획 확정', '화면 목록 정리', '시연 순서 작성', '하지 않을 기능 정리'],
  docs: ['README에 실행 방법 추가', '발표 대본 초안', '역할 표 갱신', '배포 주소 기록'],
}

const ORDER: Kind[] = ['dev', 'design', 'plan', 'docs']

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let x = Math.imul(a ^ (a >>> 15), 1 | a)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)]
}

function pickKind(rand: () => number, mix: number[]): Kind {
  const total = mix.reduce((sum, v) => sum + v, 0)
  let r = rand() * total
  for (let i = 0; i < mix.length; i += 1) {
    r -= mix[i]
    if (r <= 0) return ORDER[i]
  }
  return 'dev'
}

function generate(): CommitEvent[] {
  const out: Omit<CommitEvent, 'id'>[] = []
  TEAMS.forEach((team, index) => {
    const rand = mulberry32(2026 + index * 97)
    for (let t = 1; t < DURATION; t += 1) {
      const phase = PROFILES[team.id].find((p) => t >= p.from && t < p.to)
      if (!phase || rand() >= phase.rate) continue
      const isConflict = rand() < phase.conflict
      const kind = isConflict ? (rand() < 0.7 ? 'dev' : 'design') : pickKind(rand, phase.mix)
      const roll = rand()
      const weight = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3
      const type: EventType = isConflict ? 'conflict' : rand() < 0.2 ? 'merge' : 'commit'
      const base = pick(rand, MESSAGES[kind])
      const message =
        type === 'conflict' ? '같은 파일을 동시에 고쳐 충돌' : type === 'merge' ? `PR 머지: ${base}` : base
      out.push({ t, team: team.id, kind, type, weight, author: pick(rand, team.authors), message })
    }
  })
  out.sort((a, b) => a.t - b.t)
  return out.map((e, i) => ({ ...e, id: i + 1 }))
}

export const EVENTS: CommitEvent[] = generate()
