// 시안 C. 순위, 최근 속도, 충돌을 한 표로 보고 지금 가 볼 조를 알려 준다.
import Playback from '../components/Playback'
import { KINDS, TEAMS } from '../data/events'
import { KIND_STYLE, RULES, STATUS_STYLE, clock, useSim, type TeamStat } from '../lib/sim'

export const title = '시안 C 관제판'
export const order = 3

// 운영진이 먼저 찾아갈 조를 고른다. 멈춘 조, 충돌 중인 조, 한쪽만 짓는 조 순서다.
function pickVisit(teams: TeamStat[]): { team: TeamStat; reason: string } | undefined {
  const stalled = teams.find((team) => team.status === '멈춤')
  if (stalled) return { team: stalled, reason: `최근 ${RULES.recentWindow}분 동안 커밋이 없습니다. 막힌 곳이 있는지 물어봅니다.` }
  const crashing = teams.find((team) => team.status === '충돌 중')
  if (crashing)
    return { team: crashing, reason: `최근 ${RULES.recentWindow}분에 충돌이 ${crashing.recentConflicts}번 났습니다. 파일을 나눠 맡았는지 봅니다.` }
  const lopsided = teams
    .filter((team) => team.commits > 5)
    .map((team) => {
      const values = KINDS.map(({ key }) => team.kinds[key].progress)
      return { team, gap: Math.max(...values) - Math.min(...values) }
    })
    .sort((a, b) => b.gap - a.gap)[0]
  if (lopsided && lopsided.gap > 0.5)
    return { team: lopsided.team, reason: '한 구역만 높습니다. 나머지 역할이 비어 있는지 봅니다.' }
  return undefined
}

export default function Board() {
  const { snap } = useSim()
  const ranked = [...snap.teams].sort((a, b) => b.total - a.total)
  const visit = pickVisit(snap.teams)
  return (
    <section>
      <h1 className="mb-1 text-2xl font-bold">시안 C 관제판</h1>
      <p className="mb-4 text-sm text-muted">운영진이 보는 화면입니다. 어느 조를 먼저 찾아갈지 맨 위에 알려 줍니다.</p>
      <Playback />

      <div className="mb-4 rounded-card border border-line bg-surface p-4">
        <p className="text-xs font-semibold text-brand">지금 가 볼 조</p>
        {visit ? (
          <p className="mt-1">
            <span className="text-lg font-bold">
              {visit.team.city} ({visit.team.team})
            </span>
            <span className="ml-2 text-sm text-muted">{visit.reason}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">지금은 급히 가 볼 조가 없습니다.</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-x-auto rounded-card border border-line bg-surface p-4 lg:col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 font-medium">순위</th>
                <th className="pb-2 font-medium">도시</th>
                <th className="pb-2 font-medium">전체</th>
                <th className="pb-2 font-medium">네 구역</th>
                <th className="pb-2 text-right font-medium">최근 {RULES.recentWindow}분</th>
                <th className="pb-2 text-right font-medium">충돌</th>
                <th className="pb-2 text-right font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((team, i) => (
                <tr key={team.id} className="border-t border-line">
                  <td className="py-3 font-bold tabular-nums">{i + 1}</td>
                  <td className="py-3">
                    <p className="font-semibold">{team.city}</p>
                    <p className="text-xs text-muted">{team.team}</p>
                  </td>
                  <td className="py-3 text-lg font-bold tabular-nums">{team.total}%</td>
                  <td className="py-3">
                    <div className="space-y-1">
                      {KINDS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-10 text-xs text-muted">{label}</span>
                          <div className="h-2 w-28 rounded-full bg-bg">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${KIND_STYLE[key].bg}`}
                              style={{ width: `${team.kinds[key].progress * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums">{team.recent}건</td>
                  <td className="py-3 text-right tabular-nums">{team.conflicts}번</td>
                  <td className="py-3 text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[team.status]}`}>
                      {team.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">방금 올라온 커밋</p>
          {snap.feed.length === 0 && <p className="text-sm text-muted">아직 커밋이 없습니다.</p>}
          <ul className="space-y-2">
            {snap.feed.map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-sm">
                <span className="w-14 shrink-0 text-xs text-muted tabular-nums">{clock(e.t)}</span>
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${e.type === 'conflict' ? 'bg-danger' : KIND_STYLE[e.kind].bg}`}
                />
                <span className={e.type === 'conflict' ? 'text-danger' : ''}>
                  <span className="font-semibold">{TEAMS.find((team) => team.id === e.team)?.city}</span> {e.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
