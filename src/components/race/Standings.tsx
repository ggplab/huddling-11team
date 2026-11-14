// 옆 패널. 현재 순위표와 지금 가 볼 조 한 줄.
import { STATUS_STYLE, type TeamStat } from '../../lib/sim'
import { teamColor } from '../../lib/teamColor'
import { pickVisit } from '../../lib/visit'

export default function Standings({ teams }: { teams: TeamStat[] }) {
  const ranked = [...teams].sort((a, b) => a.rank - b.rank || a.team.localeCompare(b.team, 'ko', { numeric: true }))
  const visit = pickVisit(teams)
  return (
    <aside className="space-y-3">
      <div className="rounded-card border border-line bg-surface p-3">
        <p className="text-xs font-semibold text-brand">지금 가 볼 조</p>
        {visit ? (
          <p className="mt-1 text-sm">
            <span className="font-bold">
              {visit.team.city === visit.team.team ? visit.team.team : `${visit.team.city} (${visit.team.team})`}
            </span>
            <span className="ml-1 text-muted">{visit.reason}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">지금은 급히 가 볼 조가 없습니다.</p>
        )}
      </div>
      <div className="overflow-x-auto rounded-card border border-line bg-surface p-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-1 font-medium">순위</th>
              <th className="pb-1 font-medium">조</th>
              <th className="pb-1 text-right font-medium">거리</th>
              <th className="pb-1 text-right font-medium">차이</th>
              <th className="pb-1 text-right font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team) => (
              <tr key={team.id} className="border-t border-line">
                <td className="py-1 font-bold tabular-nums">{team.rank}</td>
                <td className="py-1">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: teamColor(team.team) }} />
                  {team.team}
                </td>
                <td className="py-1 text-right tabular-nums">{team.distance}</td>
                <td className="py-1 text-right tabular-nums">{team.gap === 0 ? '선두' : `-${team.gap}`}</td>
                <td className="py-1 text-right">
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[team.status]}`}>
                    {team.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  )
}
