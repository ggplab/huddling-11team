// React에 묶이지 않은 순수 계산: 실제 데이터 변환, 점수, 레이싱 지표.
// 런타임에 다른 파일을 불러오지 않는다(타입만 가져온다). 그래서 Node로 바로 시험할 수 있다.
import type { CommitEvent, EventType, Kind, Team } from '../data/events'

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

// 실제 데이터의 재생 구간. 행사 당일 09:00~14:20 한국 시간. 여기 한 곳에서 바꾼다.
export const REAL_WINDOW = {
  start: '2026-11-14T00:00:00Z',
  end: '2026-11-14T05:20:00Z',
}

const KIND_KEYS: Kind[] = ['dev', 'design', 'plan', 'docs']
const TYPES: EventType[] = ['commit', 'merge', 'conflict']

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
  // 레이싱 지표
  distance: number // 네 구역 점수의 합(충돌 감점 반영). 차의 위치
  rank: number // distance 순위(같으면 같은 순위, 1부터)
  speed: number // 최근 boostWindow분에 얻은 점수. 차의 속도
  gap: number // 1위와의 distance 차이(1위는 0)
}

export type Snapshot = { t: number; teams: TeamStat[]; feed: CommitEvent[] }

// 한 원천(예시 또는 실제)을 재생하는 데 필요한 값 전부
export type Dataset = {
  events: CommitEvent[] // t 오름차순
  teams: Team[]
  duration: number // 분
  excluded: { before: number; after: number; invalid: number } // 재생에서 뺀 건수
  collectedAt?: string
}

export type RaceTrack = {
  times: number[] // 각 칸의 끝 시각(분). 마지막 값 = duration
  distance: Record<string, number[]> // 조 id -> 칸마다 distance
  rank: Record<string, number[]> // 조 id -> 칸마다 순위
}

// ---------- 실제 데이터 변환 ----------

type RawEvent = {
  id?: number
  at?: string
  team?: string
  type?: string
  kind?: string
  weight?: number
  author?: string
  message?: string
}
type RawTeam = { id?: string; repo?: string }
export type RawSnapshot = {
  meta?: { collectedAt?: string }
  teams?: RawTeam[]
  events?: RawEvent[]
}

function teamOrder(a: string, b: string) {
  const na = Number(a)
  const nb = Number(b)
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb
  return a.localeCompare(b)
}

export function toDataset(raw: RawSnapshot, window = REAL_WINDOW): Dataset {
  const startMs = Date.parse(window.start)
  // 재생 끝 = min(구간 끝, 수집 시각). 수집 시각이 없거나 시작보다 이르면 구간 끝을 쓴다.
  const windowEndMs = Date.parse(window.end)
  const collectedMs = raw.meta?.collectedAt ? Date.parse(raw.meta.collectedAt) : NaN
  const endMs = Number.isFinite(collectedMs) && collectedMs >= startMs ? Math.min(windowEndMs, collectedMs) : windowEndMs
  const duration = (endMs - startMs) / 60000
  const excluded = { before: 0, after: 0, invalid: 0 }
  const kept: CommitEvent[] = []
  const rawEvents = Array.isArray(raw.events) ? raw.events : []
  rawEvents.forEach((e, i) => {
    const ms = typeof e.at === 'string' ? Date.parse(e.at) : NaN
    const kind = KIND_KEYS.find((k) => k === e.kind)
    const type = TYPES.find((k) => k === e.type)
    if (Number.isNaN(ms) || e.team == null || !kind || !type) {
      excluded.invalid += 1
      return
    }
    const t = (ms - startMs) / 60000
    if (t < 0) {
      excluded.before += 1
      return
    }
    if (t > duration) {
      excluded.after += 1
      return
    }
    const weight = e.weight === 1 || e.weight === 2 || e.weight === 3 ? e.weight : 2
    kept.push({
      id: typeof e.id === 'number' ? e.id : i + 1,
      t,
      team: String(e.team),
      kind,
      type,
      weight,
      author: e.author ?? '',
      message: e.message ?? '',
    })
  })
  kept.sort((a, b) => a.t - b.t || a.id - b.id)

  // 조 목록: 정리본의 조 전부(이벤트 0건 포함) + 이벤트에만 나오는 조
  const ids = new Set<string>()
  const repos = new Map<string, string>()
  ;(Array.isArray(raw.teams) ? raw.teams : []).forEach((t) => {
    if (t.id == null) return
    ids.add(String(t.id))
    if (t.repo) repos.set(String(t.id), t.repo)
  })
  rawEvents.forEach((e) => {
    if (e.team != null) ids.add(String(e.team))
  })
  const authors = new Map<string, Set<string>>()
  kept.forEach((e) => {
    if (!e.author) return
    if (!authors.has(e.team)) authors.set(e.team, new Set())
    authors.get(e.team)!.add(e.author)
  })
  const teams: Team[] = [...ids].sort(teamOrder).map((id) => ({
    id,
    team: `${id}조`,
    city: `${id}조`, // 도시 이름이 없는 실제 조의 기본값
    service: repos.get(id) ?? '', // 서비스 이름 대신 레포 이름
    authors: [...(authors.get(id) ?? [])],
  }))
  return { events: kept, teams, duration, excluded, collectedAt: raw.meta?.collectedAt }
}

// ---------- 점수 계산 ----------

type Acc = {
  points: Record<Kind, number>
  commits: Record<Kind, number>
  merges: number
  conflicts: number
}

function emptyAcc(): Acc {
  return {
    points: { dev: 0, design: 0, plan: 0, docs: 0 },
    commits: { dev: 0, design: 0, plan: 0, docs: 0 },
    merges: 0,
    conflicts: 0,
  }
}

// 이벤트 하나를 반영하고 얻은 점수(충돌은 0)를 돌려준다. burst는 최근 boostWindow분 이벤트 수.
function apply(acc: Acc, e: CommitEvent, burst: number): number {
  if (e.type === 'conflict') {
    acc.conflicts += 1
    acc.points[e.kind] = Math.max(0, acc.points[e.kind] - RULES.conflictPenalty)
    return 0
  }
  let gain = e.weight * RULES.pointsPerWeight
  if (e.type === 'merge') {
    acc.merges += 1
    gain += RULES.mergeBonus
  }
  if (burst >= RULES.boostCount) gain *= RULES.boostRate
  acc.points[e.kind] += gain
  acc.commits[e.kind] += 1
  return gain
}

const sumPoints = (acc: Acc) => KIND_KEYS.reduce((s, k) => s + acc.points[k], 0)

// 조별 이벤트 목록(t 오름차순)
function byTeam(ds: Dataset): Map<string, CommitEvent[]> {
  const map = new Map<string, CommitEvent[]>()
  ds.teams.forEach((t) => map.set(t.id, []))
  ds.events.forEach((e) => map.get(e.team)?.push(e))
  return map
}

// 같은 순위 규칙: 나보다 distance가 큰 조의 수 + 1
function withRanks(values: number[]): number[] {
  return values.map((v) => values.filter((o) => o > v).length + 1)
}

export function computeSnapshot(ds: Dataset, t: number): Snapshot {
  const grouped = byTeam(ds)
  const past = ds.events.filter((e) => e.t <= t)
  const teams = ds.teams.map((team): TeamStat => {
    const mine = (grouped.get(team.id) ?? []).filter((e) => e.t <= t)
    const acc = emptyAcc()
    let lo = 0
    let speed = 0
    mine.forEach((e, i) => {
      // mine은 t 순서라 최근 구간 밖의 이벤트는 앞쪽에 몰려 있다
      while (mine[lo].t <= e.t - RULES.boostWindow) lo += 1
      const gain = apply(acc, e, i + 1 - lo)
      if (e.t > t - RULES.boostWindow) speed += gain
    })
    const kinds = {} as Record<Kind, KindStat>
    KIND_KEYS.forEach((key) => {
      const points = acc.points[key]
      const progress = Math.min(1, points / RULES.target)
      kinds[key] = { points, progress, level: Math.min(10, Math.floor(progress * 10)), commits: acc.commits[key] }
    })
    const recentEvents = mine.filter((e) => e.t > t - RULES.recentWindow)
    const recentConflicts = recentEvents.filter((e) => e.type === 'conflict').length
    const boost = mine.filter((e) => e.t > t - RULES.boostWindow && e.type !== 'conflict').length >= RULES.boostCount
    let status: Status = '순항'
    if (mine.length === 0) status = '시작 전'
    else if (recentConflicts >= 2) status = '충돌 중'
    else if (recentEvents.length === 0) status = '멈춤'
    else if (boost) status = '달리는 중'
    const total = Math.round((KIND_KEYS.reduce((sum, k) => sum + kinds[k].progress, 0) / KIND_KEYS.length) * 100)
    return {
      ...team,
      kinds,
      total,
      commits: mine.length - acc.conflicts,
      merges: acc.merges,
      conflicts: acc.conflicts,
      recent: recentEvents.length,
      recentConflicts,
      boost,
      status,
      last: mine[mine.length - 1],
      distance: sumPoints(acc),
      rank: 0,
      speed,
      gap: 0,
    }
  })
  const ranks = withRanks(teams.map((s) => s.distance))
  const top = teams.reduce((m, s) => Math.max(m, s.distance), 0)
  teams.forEach((s, i) => {
    s.rank = ranks[i]
    s.gap = top - s.distance
  })
  return { t, teams, feed: past.slice(-14).reverse() }
}

// 재생 길이를 steps칸으로 나눠 칸 끝 시각의 distance와 순위를 돌려준다.
export function computeRaceTrack(ds: Dataset, steps: number): RaceTrack {
  const n = Math.max(1, Math.floor(steps))
  const times = Array.from({ length: n }, (_, i) => (ds.duration * (i + 1)) / n)
  const grouped = byTeam(ds)
  const distance: Record<string, number[]> = {}
  ds.teams.forEach((team) => {
    const mine = grouped.get(team.id) ?? []
    const acc = emptyAcc()
    const out: number[] = []
    let next = 0
    let lo = 0
    times.forEach((end) => {
      while (next < mine.length && mine[next].t <= end) {
        const e = mine[next]
        while (mine[lo].t <= e.t - RULES.boostWindow) lo += 1
        apply(acc, e, next + 1 - lo)
        next += 1
      }
      out.push(sumPoints(acc))
    })
    distance[team.id] = out
  })
  const rank: Record<string, number[]> = {}
  ds.teams.forEach((team) => (rank[team.id] = []))
  times.forEach((_, i) => {
    const r = withRanks(ds.teams.map((team) => distance[team.id][i]))
    ds.teams.forEach((team, j) => rank[team.id].push(r[j]))
  })
  return { times, distance, rank }
}
