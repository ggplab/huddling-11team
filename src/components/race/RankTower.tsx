// 왼쪽 어두운 순위 패널. 줄을 누르면 조가 선택된다.
import type { TeamStat } from '../../lib/sim'
import { teamColor, teamLabel } from '../../lib/teamColor'

type Props = {
  teams: TeamStat[]
  selected?: string
  onSelect: (id: string) => void
  moved: Record<string, number> // 조 id -> 순위가 오른 칸 수(음수면 내려감)
}

const MEDAL = ['bg-gold text-ink', 'bg-silver text-ink', 'bg-bronze text-white']

export default function RankTower({ teams, selected, onSelect, moved }: Props) {
  return (
    <div className="rounded-card bg-panel p-3 text-white">
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 font-bold tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          LIVE RANKING
        </span>
        <span className="text-white/70">선두와 차이</span>
      </div>
      <ul className="space-y-1">
        {teams.map((team) => {
          const m = moved[team.id] ?? 0
          const leader = team.rank === 1
          return (
            <li key={team.id}>
              <button
                type="button"
                onClick={() => onSelect(team.id)}
                aria-controls="team-detail"
                aria-pressed={selected === team.id}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm ${
                  leader ? 'bg-dev' : 'bg-white/10 hover:bg-white/20'
                } ${selected === team.id ? 'ring-2 ring-white' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    team.rank <= 3 ? MEDAL[team.rank - 1] : 'text-white/80'
                  }`}
                >
                  {team.rank}
                </span>
                <span className="h-4 w-1 rounded" style={{ backgroundColor: teamColor(team.team) }} />
                <span className="font-semibold">{teamLabel(team.team)}</span>
                {m !== 0 && (
                  <span className={`text-[10px] font-bold ${m > 0 ? 'text-docs' : 'text-danger'}`} style={{ filter: 'brightness(1.6)' }}>
                    {m > 0 ? '▲' : '▼'}
                    {Math.abs(m)}
                  </span>
                )}
                <span className="ml-auto text-xs font-semibold tabular-nums text-white">
                  {leader ? 'LEADER' : `-${Math.round(team.gap)}`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
