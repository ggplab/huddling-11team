// 트랙 전체. 줄 쌓기, 25/50/75% 표시, 결승선, 배경 그림 자리를 맡는다.
import { raceAssets } from '../../lib/raceAssets'
import type { TeamStat } from '../../lib/sim'
import Lane from './Lane'

type Props = { teams: TeamStat[]; finish: number; t: number }

export default function Track({ teams, finish, t }: Props) {
  // 줄 높이 = 가용 높이(약 560px) / 조 수, 최소 30 최대 72
  const height = Math.max(30, Math.min(72, Math.floor(560 / Math.max(1, teams.length))))
  const bg = raceAssets.trackBackground
  return (
    <div
      className="relative overflow-hidden rounded-card border border-line bg-ground/40"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover' } : undefined}
    >
      {/* 지점 표시는 차 길(왼쪽 40px, 오른쪽 96px 여백)과 같은 기준으로 둔다 */}
      <div className="pointer-events-none absolute inset-y-0 left-10 right-24" aria-hidden>
        {[25, 50, 75].map((p) => (
          <div key={p} className="absolute inset-y-0 border-l border-dashed border-muted/40" style={{ left: `${p}%` }}>
            <span className="absolute -top-0 left-1 text-[10px] text-muted">{p}%</span>
          </div>
        ))}
        <div className="absolute inset-y-0 right-0 w-2 bg-ink/80" />
        <span className="absolute -top-0 right-3 text-[10px] font-semibold text-ink">
          {raceAssets.finishFlag ? <img src={raceAssets.finishFlag} alt="결승선" className="h-4" /> : '🏁 결승'}
        </span>
      </div>
      <div className="relative">
        {teams.map((team) => (
          <Lane key={team.id} team={team} finish={finish} height={height} t={t} idle={team.commits === 0 && team.distance === 0} />
        ))}
      </div>
    </div>
  )
}
