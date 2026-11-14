// 커밋을 시간 순서로 재생해 조별 진척을 계산한다. 세 시안이 이 파일 하나를 함께 쓴다.
// 계산은 core.ts(순수 함수)가 하고, 이 파일은 원천 선택과 재생 상태를 맡는다.
import { useMemo, useSyncExternalStore } from 'react'
import { DURATION, EVENTS, KINDS, TEAMS } from '../data/events'
import type { CommitEvent, Kind } from '../data/events'
import {
  RULES,
  computeRaceTrack,
  computeSnapshot,
  toDataset,
  type Dataset,
  type RaceTrack,
  type Snapshot,
  type Status,
} from './core'

export { RULES, KINDS }
export type { KindStat, Status, TeamStat, Snapshot, RaceTrack, Dataset } from './core'

export type Source = 'example' | 'real'
export type LoadState = 'idle' | 'loading' | 'ready' | 'failed'

const EXAMPLE: Dataset = {
  events: EVENTS,
  teams: TEAMS,
  duration: DURATION,
  excluded: { before: 0, after: 0, invalid: 0 },
}

export const REAL_URL = '/data/snapshot.json'

let real: Dataset | undefined // 불러온 실제 데이터(이벤트 1건 이상일 때만)

function active(): Dataset {
  return state.source === 'real' && state.load === 'ready' && real ? real : EXAMPLE
}

export function snapshot(t: number): Snapshot {
  return computeSnapshot(active(), t)
}

export function raceTrack(steps: number): RaceTrack {
  return computeRaceTrack(active(), steps)
}

// 재생 상태. 화면을 옮겨도 이어지도록 컴포넌트 밖에 둔다.
type SimState = { t: number; playing: boolean; speed: number; source: Source; load: LoadState }

const BASE_MINUTES_PER_SECOND = 2 // 1배속에서 1초에 2분이 흐른다
const TICK_MS = 100

let state: SimState = { t: 0, playing: false, speed: 5, source: 'example', load: 'idle' }
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function set(next: Partial<SimState>) {
  state = { ...state, ...next }
  listeners.forEach((fn) => fn())
}

function tick() {
  const end = active().duration
  const t = Math.min(end, state.t + (state.speed * BASE_MINUTES_PER_SECOND * TICK_MS) / 1000)
  if (t >= end) {
    stop()
    set({ t: end, playing: false })
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
    if (state.t >= active().duration) set({ t: 0 })
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
    set({ t: Math.max(0, Math.min(active().duration, t)) })
  },
  reset() {
    stop()
    set({ t: 0, playing: false })
  },
  // 데이터 원천을 바꾼다. 재생은 처음으로 돌아간다. 'real'은 불러오기에 실패하면 예시 데이터로 남는다.
  async setSource(source: Source) {
    stop()
    if (source === 'example') {
      set({ source, t: 0, playing: false, load: 'idle' })
      return
    }
    set({ source, t: 0, playing: false, load: 'loading' })
    try {
      const res = await fetch(REAL_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ds = toDataset(await res.json())
      if (ds.events.length === 0) throw new Error('이벤트 0건')
      real = ds
      if (state.source === 'real') set({ load: 'ready', t: 0 })
    } catch {
      real = undefined
      if (state.source === 'real') set({ load: 'failed', t: 0 })
    }
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
  const ds = current.source === 'real' && current.load === 'ready' ? real : undefined
  const data = ds ?? EXAMPLE
  const snap = useMemo(() => computeSnapshot(data, current.t), [data, current.t])
  return {
    ...current, // t, playing, speed, source(고른 원천), load('idle'|'loading'|'ready'|'failed')
    activeSource: (ds ? 'real' : 'example') as Source, // 지금 실제로 보이는 원천
    fallback: current.source === 'real' && current.load === 'failed', // 실제 데이터 실패로 예시를 보여 주는 중
    duration: data.duration,
    excluded: data.excluded, // 재생에서 뺀 건수(시작 이전, 끝 이후, 형식 오류)
    collectedAt: data.collectedAt,
    snap,
  }
}

// 순위 변화 그래프나 자취용. 현재 원천 기준으로 steps칸의 distance와 rank를 돌려준다.
export function useRaceTrack(steps: number): RaceTrack {
  const { activeSource } = useSim()
  return useMemo(() => computeRaceTrack(active(), steps), [activeSource, steps])
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

// 조 하나의 최근 이벤트 n건(최신이 맨 앞). t 이전 것만.
export function teamRecent(teamId: string, t: number, n: number): CommitEvent[] {
  return active()
    .events.filter((e) => e.team === teamId && e.t <= t)
    .slice(-n)
    .reverse()
}
