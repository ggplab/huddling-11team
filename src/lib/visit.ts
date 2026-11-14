// 운영진이 먼저 찾아갈 조를 고른다. 멈춘 조, 충돌 중인 조, 한쪽만 짓는 조 순서다.
import { KINDS, RULES, type TeamStat } from './sim'

export function pickVisit(teams: TeamStat[]): { team: TeamStat; reason: string } | undefined {
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
