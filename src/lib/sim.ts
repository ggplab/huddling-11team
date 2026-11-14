// 예시 커밋을 시간 순서로 재생해 조별 진척을 계산한다. 세 시안이 이 파일 하나를 함께 쓴다.
import { useMemo, useSyncExternalStore } from 'react'
import { DURATION, EVENTS, KINDS, TEAMS, type CommitEvent, type Kind, type Team } from '../data/events'

// 점수 규칙. 숫자를 바꾸면 도시가 자라는 속도가 바뀐다.
export const RULES = {
  pointsPerWeight: 10, // 커밋 한 번의 기본 점수 = 무게 x 10
  mergeBonus: 5, // PR이 머지되면 더하는 점수
  conflictPenalty: 15, // 충돌이 나면 깎는 점수
  boostWindow: 10, // 최근 몇 분을 볼지
  boostCount: 6, // 그 안에 몇 번 이상 올리면 부스트인지
  boostRate: 1.5, // 부스트일 때 곱하는 값
  target: 320, // 한 구역이 100%가 되는 점수
  recentWindow: 20, // 상태를 판정할 때 보는 최근 몇 분
}

export type KindStat = { points: number; progress: number; level: number; commits: number }

export type Status = '시작 전' | '달리는 중' | '순항' | '충돌 중' | '멈춤'

export type TeamStat = Team & {
  kinds: Record<Kind, KindStat>
  total: number // 네 구역 평균, 0~100
  commits: number
  merges: number
  conflicts: number
  recent: number
  recentConflicts: number
  boost: boolean
  status: Status
  last?: CommitEvent
}

export type Snapshot = { t: number; teams: TeamStat[]; feed: CommitEvent[] }

function emptyKinds(): Record<Kind, KindStat> {
  return {
    dev: { points: 0, progress: 0, level: 0, commits: 0 },
    design: { points: 0, progress: 0, level: 0, commits: 0 },
    plan: { points: 0, progress: 0, level: 0, commits: 0 },
    docs: { points: 0, progress: 0, level: 0, commits: 0 },
  }
}

export function snapshot(t: number): Snapshot {
  const past = EVENTS.filter((e) => e.t <= t)
  const teams = TEAMS.map((team): TeamStat => {
    const mine = past.filter((e) => e.team === team.id)
    const kinds = emptyKinds()
    let merges = 0
    let conflicts = 0
    mine.forEach((e, i) => {
      const stat = kinds[e.kind]
      if (e.type === 'conflict') {
        conflicts += 1
        stat.points = Math.max(0, stat.points - RULES.conflictPenalty)
        return
      }
      const burst = mine.slice(0, i + 1).filter((p) => p.t > e.t - RULES.boostWindow).length
      let gain = e.weight * RULES.pointsPerWeight
      if (e.type === 'merge') {
        merges += 1
        gain += RULES.mergeBonus
      }
      if (burst >= RULES.boostCount) gain *= RULES.boostRate
      stat.points += gain
      stat.commits += 1
    })
    KINDS.forEach(({ key }) => {
      const stat = kinds[key]
      stat.progress = Math.min(1, stat.points / RULES.target)
      stat.level = Math.min(10, Math.floor(stat.progress * 10))
    })
    const recentEvents = mine.filter((e) => e.t > t - RULES.recentWindow)
    const recentConflicts = recentEvents.filter((e) => e.type === 'conflict').length
    const boost = mine.filter((e) => e.t > t - RULES.boostWindow && e.type !== 'conflict').length >= RULES.boostCount
    let status: Status = '순항'
    if (mine.length === 0) status = '시작 전'
    else if (recentConflicts >= 2) status = '충돌 중'
    else if (recentEvents.length === 0) status = '멈춤'
    else if (boost) status = '달리는 중'
    const total = Math.round((KINDS.reduce((sum, { key }) => sum + kinds[key].progress, 0) / KINDS.length) * 100)
    return {
      ...team,
      kinds,
      total,
      commits: mine.length - conflicts,
      merges,
      conflicts,
      recent: recentEvents.length,
      recentConflicts,
      boost,
      status,
      last: mine[mine.length - 1],
    }
  })
  return { t, teams, feed: past.slice(-14).reverse() }
}

// 재생 상태. 화면을 옮겨도 이어지도록 컴포넌트 밖에 둔다.
type SimState = { t: number; playing: boolean; speed: number }

const BASE_MINUTES_PER_SECOND = 2 // 1배속에서 1초에 2분이 흐른다
const TICK_MS = 100

let state: SimState = { t: 0, playing: false, speed: 5 }
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function set(next: Partial<SimState>) {
  state = { ...state, ...next }
  listeners.forEach((fn) => fn())
}

function tick() {
  const t = Math.min(DURATION, state.t + (state.speed * BASE_MINUTES_PER_SECOND * TICK_MS) / 1000)
  if (t >= DURATION) {
    stop()
    set({ t: DURATION, playing: false })
  } else {
    set({ t })
  }
}

function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}

export const sim = {
  play() {
    if (state.t >= DURATION) set({ t: 0 })
    stop()
    timer = setInterval(tick, TICK_MS)
    set({ playing: true })
  },
  pause() {
    stop()
    set({ playing: false })
  },
  toggle() {
    if (state.playing) sim.pause()
    else sim.play()
  },
  setSpeed(speed: number) {
    set({ speed })
  },
  seek(t: number) {
    set({ t: Math.max(0, Math.min(DURATION, t)) })
  },
  reset() {
    stop()
    set({ t: 0, playing: false })
  },
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function useSim() {
  const current = useSyncExternalStore(subscribe, () => state)
  const snap = useMemo(() => snapshot(current.t), [current.t])
  return { ...current, snap }
}

export function clock(t: number) {
  const minutes = Math.floor(t)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`
}

// 구역별 색. Tailwind가 읽을 수 있게 클래스 이름을 통째로 적는다.
export const KIND_STYLE: Record<Kind, { bg: string; soft: string; text: string; border: string }> = {
  dev: { bg: 'bg-dev', soft: 'bg-dev/15', text: 'text-dev', border: 'border-dev' },
  design: { bg: 'bg-design', soft: 'bg-design/15', text: 'text-design', border: 'border-design' },
  plan: { bg: 'bg-plan', soft: 'bg-plan/15', text: 'text-plan', border: 'border-plan' },
  docs: { bg: 'bg-docs', soft: 'bg-docs/15', text: 'text-docs', border: 'border-docs' },
}

export const STATUS_STYLE: Record<Status, string> = {
  '시작 전': 'bg-line text-muted',
  '달리는 중': 'bg-brand text-white',
  순항: 'bg-brand-soft text-brand',
  '충돌 중': 'bg-danger text-white',
  멈춤: 'bg-ink text-white',
}
