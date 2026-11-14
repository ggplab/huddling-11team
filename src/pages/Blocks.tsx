// 시안 B. 위에서 내려다본 도시. 구역마다 땅 16칸이 채워진다.
import Playback from '../components/Playback'
import TeamHeader from '../components/TeamHeader'
import { KINDS, type Kind } from '../data/events'
import { KIND_STYLE, useSim, type TeamStat } from '../lib/sim'

export const title = '시안 B 블록 지도'
export const order = 2

const TILES = 16

function Quarter({ team, kind, t }: { team: TeamStat; kind: Kind; t: number }) {
  const stat = team.kinds[kind]
  const style = KIND_STYLE[kind]
  const filled = Math.round(stat.progress * TILES)
  const last = team.last
  const hit = last && last.type === 'conflict' && last.kind === kind && t - last.t < 4
  return (
    <div className={`rounded-lg p-2 ${style.soft}`}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className={`text-xs font-semibold ${style.text}`}>{KINDS.find((k) => k.key === kind)?.label}</span>
        <span className="text-xs text-muted tabular-nums">
          {filled}/{TILES}칸
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: TILES }, (_, i) => {
          const on = i < filled
          const rubble = hit && i === filled
          return (
            <div
              key={i}
              className={`aspect-square rounded-sm transition-colors duration-300 ${
                rubble ? 'bg-danger' : on ? style.bg : 'bg-surface'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function Blocks() {
  const { snap, t } = useSim()
  return (
    <section>
      <h1 className="mb-1 text-2xl font-bold">시안 B 블록 지도</h1>
      <p className="mb-4 text-sm text-muted">
        구역마다 땅이 16칸 있습니다. 커밋이 쌓이면 한 칸씩 채워지고, 충돌이 나면 한 칸이 무너져 빨갛게 보입니다.
      </p>
      <Playback />
      <div className="grid gap-4 md:grid-cols-2">
        {snap.teams.map((team) => (
          <article key={team.id} className="rounded-card border border-line bg-surface p-4">
            <TeamHeader team={team} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {KINDS.map(({ key }) => (
                <Quarter key={key} team={team} kind={key} t={t} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
