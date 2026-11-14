// 오른쪽 흰 카드. 선택한 조가 없으면 실시간 중계, 있으면 파트별 주행 기록.
import type { CommitEvent } from '../../data/events'
import { KIND_STYLE, KINDS, clock, teamRecent, type Snapshot, type TeamStat } from '../../lib/sim'
import { teamColor, teamLabel, teamNumber } from '../../lib/teamColor'

const TAG: Record<CommitEvent['type'], { label: string; cls: string }> = {
  commit: { label: '커밋', cls: 'bg-bg text-muted' },
  merge: { label: '부스터', cls: 'bg-brand-soft text-brand' },
  conflict: { label: '미끄러짐', cls: 'bg-danger/10 text-danger' },
}
const ORDER = ['plan', 'design', 'dev', 'docs'] as const

function EventRow({ e, name }: { e: CommitEvent; name?: string }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      <span className="w-12 shrink-0 text-muted tabular-nums">{clock(e.t)}</span>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${TAG[e.type].cls}`}>{TAG[e.type].label}</span>
      <span className={e.type === 'conflict' ? 'text-danger' : ''}>
        {name && <span className="font-semibold">{name}, </span>}
        {e.message}
      </span>
    </li>
  )
}

type Props = { snap: Snapshot; t: number; team?: TeamStat; finish: number; onClose: () => void }

export default function SidePanel({ snap, t, team, finish, onClose }: Props) {
  if (!team) {
    return (
      <div className="space-y-3">
        <div className="rounded-card border border-line bg-surface p-3">
          <p className="text-sm font-bold">파트별 주행 기록 보기</p>
          <p className="mt-1 text-xs text-muted">왼쪽 순위에서 조를 누르거나 트랙의 조 표식을 누르면 기획, 디자인, 개발, 문서 파트의 기록이 여기에 열립니다.</p>
        </div>
        <div className="rounded-card border border-line bg-surface p-3">
          <p className="mb-2 text-sm font-bold">실시간 중계</p>
          {snap.feed.length === 0 && <p className="text-xs text-muted">아직 커밋이 없습니다.</p>}
          <ul className="space-y-2">
            {snap.feed.slice(0, 8).map((e) => (
              <EventRow key={e.id} e={e} name={(() => {
                const tm = snap.teams.find((x) => x.id === e.team)
                return tm ? teamLabel(tm.team) : undefined
              })()} />
            ))}
          </ul>
        </div>
      </div>
    )
  }
  const pct = Math.min(100, Math.round((team.distance / finish) * 100))
  const sum = ORDER.reduce((s, k) => s + team.kinds[k].points, 0) || 1
  const recent = teamRecent(team.id, t, 8)
  const label = (k: (typeof ORDER)[number]) => KINDS.find((x) => x.key === k)?.label
  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white" style={{ backgroundColor: teamColor(team.team) }}>
          {teamNumber(team.team)}
        </span>
        <div>
          <p className="font-bold">
            {teamLabel(team.team)}
            {team.id === '11' && <span className="ml-1 rounded bg-dev px-1.5 py-0.5 text-[10px] text-white">우리 팀</span>}
          </p>
          <p className="text-xs text-muted">{team.rank}위, {team.status === '시작 전' ? '출발 전' : '레이스 중'}</p>
        </div>
        <button type="button" onClick={onClose} className="ml-auto rounded-lg border border-line px-2 py-1 text-sm" aria-label="닫기">
          ✕
        </button>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums">
        {pct}%<span className="ml-2 text-xs font-normal text-muted">결승선까지 {Math.max(0, Math.round(finish - team.distance))}점</span>
      </p>
      <div className="mt-1 h-2 rounded-full bg-bg">
        <div className="h-2 rounded-full bg-dev transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 text-center">
        {[['점수', Math.round(team.distance)], ['커밋', team.commits], ['PR 머지', team.merges], ['충돌', team.conflicts]].map(([k, v]) => (
          <div key={k} className="rounded-md bg-bg py-1">
            <p className="text-[10px] text-muted">{k}</p>
            <p className="text-sm font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm font-bold">파트별 주행 기록</p>
      <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-bg">
        {ORDER.map((k) => (
          <div key={k} className={KIND_STYLE[k].bg} style={{ width: `${(team.kinds[k].points / sum) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {ORDER.map((k) => (
          <li key={k} className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${KIND_STYLE[k].bg}`} />
            <span className="w-10">{label(k)}</span>
            <div className="h-1.5 flex-1 rounded-full bg-bg">
              <div className={`h-1.5 rounded-full ${KIND_STYLE[k].bg}`} style={{ width: `${team.kinds[k].progress * 100}%` }} />
            </div>
            <span className="w-16 text-right tabular-nums">{Math.round(team.kinds[k].points)}점 {Math.round((team.kinds[k].points / sum) * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-bold">최근 활동</p>
      {recent.length === 0 && <p className="mt-1 text-xs text-muted">아직 활동이 없습니다.</p>}
      <ul className="mt-1 space-y-1.5">
        {recent.map((e) => (
          <EventRow key={e.id} e={e} />
        ))}
      </ul>
    </div>
  )
}
