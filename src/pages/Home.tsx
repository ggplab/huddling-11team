// 첫 화면: 커밋 레이스. 순위 타워, S자 트랙, 파트별 주행 기록을 한 화면에 보여 준다.
import { useState } from 'react'
import RankTower from '../components/race/RankTower'
import SidePanel from '../components/race/SidePanel'
import SnakeTrack from '../components/race/SnakeTrack'
import TopBar from '../components/race/TopBar'
import { useRaceTrack, useSim } from '../lib/sim'
import { teamNumber } from '../lib/teamColor'

export const title = '레이스'
export const order = 0

const STEPS = 60
const LOOKBACK = 2 // 몇 칸 전 순위와 비교할지

export default function Home() {
  const { t, snap, duration } = useSim()
  const track = useRaceTrack(STEPS)
  const [selectedId, setSelectedId] = useState<string>()

  // 결승선 거리: 재생이 끝났을 때 1위의 distance. 0이면 1로 둔다.
  const finish = Math.max(1, ...Object.values(track.distance).map((list) => list[list.length - 1] ?? 0))
  const ranked = [...snap.teams].sort((a, b) => a.rank - b.rank || teamNumber(a.team) - teamNumber(b.team))
  const commits = snap.teams.reduce((s, x) => s + x.commits, 0)
  const merges = snap.teams.reduce((s, x) => s + x.merges, 0)

  // 순위 변동: 지금 칸과 LOOKBACK칸 전의 rank 배열을 비교한다(양수면 올라감).
  const cell = Math.min(STEPS - 1, Math.floor((t / duration) * STEPS) - 1)
  const moved: Record<string, number> = {}
  if (cell >= LOOKBACK) {
    snap.teams.forEach((x) => {
      const r = track.rank[x.id]
      if (r) moved[x.id] = r[cell - LOOKBACK] - r[cell]
    })
  }
  const selected = snap.teams.find((x) => x.id === selectedId)
  const pick = (id: string) => setSelectedId((cur) => (cur === id ? undefined : id))

  return (
    <section className="space-y-3">
      <TopBar commits={commits} merges={merges} />
      <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)_320px]">
        <RankTower teams={ranked} selected={selectedId} onSelect={pick} moved={moved} />
        <div className="rounded-card border border-line bg-surface p-3">
          <div className="mb-2 flex flex-wrap items-baseline gap-2">
            <h2 className="font-bold">레이스 트랙</h2>
            <span className="text-xs text-muted">결승선 {Math.round(finish).toLocaleString('ko-KR')}점</span>
            <span className="ml-auto text-xs text-muted">커밋 = 전진, PR 머지 = 부스터, 충돌 = 미끄러짐</span>
          </div>
          <SnakeTrack teams={snap.teams} finish={finish} selected={selectedId} onSelect={pick} />
        </div>
        <SidePanel snap={snap} t={t} team={selected} finish={finish} onClose={() => setSelectedId(undefined)} />
      </div>
    </section>
  )
}
