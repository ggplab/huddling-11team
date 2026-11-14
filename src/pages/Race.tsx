// 시안 D. 조마다 차 한 대. 커밋이 쌓이면 앞으로 나가고 충돌이 나면 뒤로 밀린다.
import Playback from '../components/Playback'
import Standings from '../components/race/Standings'
import Track from '../components/race/Track'
import { useRaceTrack, useSim } from '../lib/sim'

export const title = '레이싱'
export const order = 1

export default function Race() {
  const { t, snap } = useSim()
  const track = useRaceTrack(60)
  // 결승선 거리: 재생이 끝났을 때 1위의 distance. 0이면 1로 둔다.
  const finish = Math.max(1, ...Object.values(track.distance).map((list) => list[list.length - 1] ?? 0))
  // 줄 순서는 조 번호 순으로 고정한다(추월이 보이게)
  const teams = [...snap.teams].sort((a, b) => a.team.localeCompare(b.team, 'ko', { numeric: true }))
  return (
    <section>
      <style>{`
        @keyframes race-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 75% { transform: translateX(3px) } }
        .race-shake { animation: race-shake 0.25s linear infinite }
      `}</style>
      <h1 className="mb-3 text-2xl font-bold">레이싱</h1>
      <Playback />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Track teams={teams} finish={finish} t={t} />
        </div>
        <Standings teams={snap.teams} />
      </div>
    </section>
  )
}
