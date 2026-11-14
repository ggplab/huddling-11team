// 실시간 중계와 선택한 조의 떠 있는 상세 패널.
import type { RefObject } from 'react'
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

type Props = { snap: Snapshot; t: number; team?: TeamStat; finish: number; onClose: () => void; panelRef: RefObject<HTMLDivElement | null> }

export default function SidePanel({ snap, t, team, finish, onClose, panelRef }: Props) {
  return (
    <>
      <div className="rounded-card border border-line bg-surface p-4">
        <p className="mb-2 text-sm font-bold">실시간 중계</p>
        {snap.feed.length === 0 && <p className="text-xs text-muted">아직 커밋이 없습니다.</p>}
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {snap.feed.slice(0, 8).map((e) => (
            <EventRow key={e.id} e={e} name={(() => {
              const tm = snap.teams.find((x) => x.id === e.team)
              return tm ? teamLabel(tm.team) : undefined
            })()} />
          ))}
        </ul>
      </div>
      {team && <TeamDetail team={team} t={t} finish={finish} onClose={onClose} panelRef={panelRef} />}
    </>
  )
}

function TeamDetail({ team, t, finish, onClose, panelRef }: { team: TeamStat; t: number; finish: number; onClose: () => void; panelRef: RefObject<HTMLDivElement | null> }) {
  const pct = Math.min(100, Math.round((team.distance / finish) * 100))
  const sum = ORDER.reduce((s, k) => s + team.kinds[k].points, 0) || 1
  const recent = teamRecent(team.id, t, 8)
  const label = (k: (typeof ORDER)[number]) => KINDS.find((x) => x.key === k)?.label
  return (
    <div id="team-detail" ref={panelRef} role="dialog" aria-modal="false" aria-labelledby="team-detail-title" tabIndex={-1} className="fixed inset-y-3 right-3 z-50 w-[min(440px,calc(100vw-1.5rem))] overflow-y-auto rounded-card border border-line bg-surface p-5 text-ink shadow-lg outline-none sm:inset-y-6 sm:right-6 sm:max-h-[calc(100vh-3rem)]">
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3 text-xs text-muted">
        <span>레이스 / 팀 상세</span>
        <button type="button" onClick={onClose} className="rounded-card px-2 py-1 text-lg hover:bg-bg focus-visible:outline-2 focus-visible:outline-brand" aria-label="팀 상세 닫기">✕</button>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white" style={{ backgroundColor: teamColor(team.team) }}>
          {teamNumber(team.team)}
        </span>
        <div>
          <h2 id="team-detail-title" className="text-2xl font-bold">
            {teamLabel(team.team)}
            {team.id === '11' && <span className="ml-1 rounded bg-dev px-1.5 py-0.5 text-[10px] text-white">우리 팀</span>}
          </h2>
          <p className="text-xs text-muted">{team.rank}위, {team.status === '시작 전' ? '출발 전' : '레이스 중'}</p>
        </div>
      </div>
      <p className="mt-6 text-xs font-semibold text-muted">레이스 진행률</p>
      <p className="mt-2 text-3xl font-extrabold tabular-nums">
        {pct}%<span className="ml-2 text-xs font-normal text-muted">결승선까지 {Math.max(0, Math.round(finish - team.distance))}점</span>
      </p>
      <div className="mt-1 h-2 rounded-full bg-bg">
        <div className="h-2 rounded-full bg-dev transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-5 grid grid-cols-4 gap-1 text-center">
        {[['점수', Math.round(team.distance)], ['커밋', team.commits], ['PR 머지', team.merges], ['충돌', team.conflicts]].map(([k, v]) => (
          <div key={k} className="rounded-md bg-bg py-1">
            <p className="text-[10px] text-muted">{k}</p>
            <p className="text-sm font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-line pt-4 text-sm font-bold">파트별 주행 기록</p>
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
      <p className="mt-6 border-t border-line pt-4 text-sm font-bold">최근 활동</p>
      {recent.length === 0 && <p className="mt-1 text-xs text-muted">아직 활동이 없습니다.</p>}
      <ul className="mt-1 space-y-1.5">
        {recent.map((e) => (
          <EventRow key={e.id} e={e} />
        ))}
      </ul>
    </div>
  )
}
