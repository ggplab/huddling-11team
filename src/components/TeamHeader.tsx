// 공용 파일: 조장만 고친다. 조 이름, 전체 진척, 상태 배지.
import { STATUS_STYLE, type TeamStat } from '../lib/sim'

export default function TeamHeader({ team }: { team: TeamStat }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold">{team.city}</span>
      <span className="text-sm text-muted">
        {team.team}, {team.service}
      </span>
      <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[team.status]}`}>
        {team.status}
      </span>
      <span className="w-12 text-right text-lg font-bold tabular-nums">{team.total}%</span>
    </div>
  )
}
