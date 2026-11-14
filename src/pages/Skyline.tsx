// 시안 A. 조마다 도시 하나, 네 구역에 건물이 올라간다.
import Playback from '../components/Playback'
import TeamHeader from '../components/TeamHeader'
import { KINDS, type Kind } from '../data/events'
import { KIND_STYLE, RULES, useSim, type TeamStat } from '../lib/sim'

export const title = '시안 A 스카이라인'
export const order = 1

// 구역마다 건물 세 채. 숫자는 가장 높은 건물에 대한 높이 비율이다.
const SHAPES: Record<Kind, number[]> = {
  dev: [0.7, 1, 0.55],
  design: [0.5, 0.8, 0.65],
  plan: [0.45, 0.9, 0.45],
  docs: [0.35, 0.5, 0.3],
}

function District({ team, kind, t }: { team: TeamStat; kind: Kind; t: number }) {
  const stat = team.kinds[kind]
  const style = KIND_STYLE[kind]
  const last = team.last
  const hit = last && last.type === 'conflict' && last.kind === kind && t - last.t < 4
  const fresh = last && last.type !== 'conflict' && last.kind === kind && t - last.t < 2
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex flex-1 items-end justify-center gap-1 px-1">
        {SHAPES[kind].map((ratio, i) => (
          <div
            key={i}
            className={`w-1/4 rounded-t-sm transition-all duration-300 ${hit ? 'bg-danger' : style.bg} ${
              fresh ? 'opacity-100' : 'opacity-85'
            }`}
            style={{
              height: `${stat.progress * ratio * 92}%`,
              backgroundImage:
                kind === 'docs'
                  ? undefined
                  : 'repeating-linear-gradient(0deg, transparent 0 6px, rgba(255,255,255,0.35) 6px 8px)',
            }}
          />
        ))}
        {hit && <span className="absolute top-1 text-xl">💥</span>}
      </div>
      <div className={`border-t-2 ${style.border} px-1 pt-1 text-center`}>
        <p className={`text-xs font-semibold ${style.text}`}>{KINDS.find((k) => k.key === kind)?.label}</p>
        <p className="text-xs text-muted tabular-nums">레벨 {stat.level}</p>
      </div>
    </div>
  )
}

export default function Skyline() {
  const { snap, t } = useSim()
  return (
    <section>
      <h1 className="mb-1 text-2xl font-bold">시안 A 스카이라인</h1>
      <p className="mb-4 text-sm text-muted">
        커밋이 쌓이면 건물이 올라갑니다. 충돌이 나면 그 구역 점수가 {RULES.conflictPenalty}점 깎이고 건물이 낮아집니다.
      </p>
      <Playback />
      <div className="grid gap-4 md:grid-cols-2">
        {snap.teams.map((team) => (
          <article key={team.id} className="rounded-card border border-line bg-surface p-4">
            <TeamHeader team={team} />
            <div className="mt-3 flex h-48 gap-2 rounded-lg bg-sky px-2 pt-3">
              {KINDS.map(({ key }) => (
                <District key={key} team={team} kind={key} t={t} />
              ))}
            </div>
            <p className="mt-2 h-5 truncate text-xs text-muted">
              {team.last ? `최근: ${team.last.author}, ${team.last.message}` : '아직 커밋이 없습니다'}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
