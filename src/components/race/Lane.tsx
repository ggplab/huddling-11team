// 줄 하나. 차의 가로 위치와 옆 글씨(조 이름, 순위, 속도)를 맡는다.
import type { TeamStat } from '../../lib/sim'
import { teamColor } from '../../lib/teamColor'
import Car from './Car'

type Props = { team: TeamStat; finish: number; height: number; t: number; idle: boolean }

export default function Lane({ team, finish, height, t, idle }: Props) {
  const ratio = idle ? 0 : Math.max(0, Math.min(1, team.distance / finish))
  const crashed =
    team.status === '충돌 중' || (team.last?.type === 'conflict' && t - team.last.t >= 0 && t - team.last.t <= 4)
  const carSize = Math.floor(height * 0.7)
  return (
    <div className="relative border-b border-line/60" style={{ height, opacity: idle ? 0.45 : 1 }}>
      <span className="absolute left-1 top-1/2 z-10 -translate-y-1/2 text-xs font-semibold">{team.team}</span>
      {/* 차가 지나는 길: 양 끝에 차 폭만큼 여백을 둬서 결승선에서 잘리지 않게 한다 */}
      <div className="absolute inset-y-0 left-10 right-24">
        <div
          className="absolute inset-y-0 flex items-center whitespace-nowrap transition-[left] duration-300 ease-linear"
          style={{ left: `${ratio * 100}%`, transform: `translateX(-${ratio * 100}%)` }}
        >
          <Car
            teamId={team.id}
            color={teamColor(team.team)}
            running={team.status === '달리는 중'}
            stopped={team.status === '멈춤'}
            crashed={crashed}
            size={carSize}
          />
        </div>
      </div>
      <span className={`absolute right-1 top-1/2 -translate-y-1/2 text-right text-[11px] font-medium leading-tight tabular-nums ${idle ? 'text-muted' : 'text-ink'}`}>
        {idle ? '출발 전' : `${team.rank}위 / ${team.speed}점`}
      </span>
    </div>
  )
}
