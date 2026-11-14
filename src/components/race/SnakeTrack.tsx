// 가운데 S자 트랙(SVG). 조 표식을 distance / 결승선 거리 만큼 길 위에 놓는다.
import { useLayoutEffect, useRef, useState } from 'react'
import { useSim, type TeamStat } from '../../lib/sim'
import { teamColor, teamNumber } from '../../lib/teamColor'
import AnimatedPenguin from './AnimatedPenguin'

const PATH = 'M150,120 H820 A110,110 0 0 1 820,340 H180 A110,110 0 0 0 180,560 H820'

type Props = { teams: TeamStat[]; finish: number; selected?: string; onSelect: (id: string) => void }

export default function SnakeTrack({ teams, finish, selected, onSelect }: Props) {
  const { playing } = useSim()
  const ref = useRef<SVGPathElement>(null)
  const [len, setLen] = useState(0)
  useLayoutEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength())
  }, [])

  const at = (ratio: number, side = 0) => {
    const p = ref.current
    if (!p || !len) return { x: 150, y: 120 }
    const d = Math.max(0, Math.min(len, ratio * len))
    const a = p.getPointAtLength(d)
    const b = p.getPointAtLength(Math.min(len, d + 1))
    const c = p.getPointAtLength(Math.max(0, d - 1))
    const dx = b.x - c.x
    const dy = b.y - c.y
    const n = Math.hypot(dx, dy) || 1
    return { x: a.x + (-dy / n) * side, y: a.y + (dx / n) * side }
  }

  // 가까운 조는 작은 격자로 펼치되, 각 조의 기준점은 실제 거리에 둔다.
  const sorted = [...teams].sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
  const positions: Record<string, { x: number; y: number }> = {}
  let group: TeamStat[] = []
  const flush = () => {
    if (!group.length) return
    const columns = Math.ceil(Math.sqrt(group.length))
    const rows = Math.ceil(group.length / columns)
    const points = group.map((tm, i) => {
      const point = at(tm.distance / finish)
      return {
        x: point.x + (i % columns - (columns - 1) / 2) * 72,
        y: point.y + (Math.floor(i / columns) - (rows - 1) / 2) * 72,
      }
    })
    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxY = Math.max(...points.map((p) => p.y))
    const shiftX = Math.max(0, 38 - minX) - Math.max(0, maxX - 962)
    const shiftY = Math.max(0, 38 - minY) - Math.max(0, maxY - 642)
    group.forEach((tm, i) => { positions[tm.id] = { x: points[i].x + shiftX, y: points[i].y + shiftY } })
    group = []
  }
  sorted.forEach((tm) => {
    if (group.length && (tm.distance - group[0].distance) / finish > 0.04) flush()
    group.push(tm)
  })
  flush()

  const leader = teams.find((x) => x.rank === 1)
  const mine = teams.find((x) => x.id === '11')
  const pct = (x: TeamStat) => Math.round((x.distance / finish) * 100)

  const lanes: [string, number][] = [['#fff', 124], ['var(--color-track)', 118], ['#fff', 92], ['var(--color-track)', 86], ['#fff', 60], ['var(--color-track)', 54], ['#fff', 28], ['var(--color-track)', 22]]
  return (
    <svg viewBox="0 0 1000 680" className="w-full rounded-card bg-grass" role="group" aria-label="S자 레이스 트랙">
      <path ref={ref} d={PATH} fill="none" stroke="none" />
      {lanes.map(([c, w], i) => (
        <path key={i} d={PATH} fill="none" stroke={c} strokeWidth={w} />
      ))}
      <text x="150" y="60" fontSize="30" fontWeight="800" fill="#111827">START</text>
      <rect x="140" y="62" width="14" height="116" fill="#111827" opacity="0.8" />
      <text x="760" y="640" fontSize="30" fontWeight="800" fill="#111827">FINISH</text>
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i % 2 ? 816 : 826} y={500 + i * 12} width="10" height="12" fill={i % 2 ? '#fff' : '#111827'} />
      ))}
      {[25, 50, 75].map((p) => {
        const q = at(p / 100)
        return (
          <g key={p}>
            <rect x={q.x - 22} y={q.y - 12} width="44" height="24" rx="4" fill="#fff" />
            <text x={q.x} y={q.y + 6} fontSize="16" fontWeight="700" textAnchor="middle" fill="#111827">{p}%</text>
          </g>
        )
      })}
      {leader && (
        <g>
          <rect x="360" y="215" width="280" height="64" rx="8" fill="#fff" />
          <text x="500" y="240" fontSize="16" textAnchor="middle" fill="#374151">현재 선두</text>
          <text x="500" y="268" fontSize="26" fontWeight="800" textAnchor="middle" fill="#111827">{`${teamNumber(leader.team)}팀, ${pct(leader)}%`}</text>
        </g>
      )}
      {mine && (
        <g>
          <rect x="360" y="440" width="280" height="64" rx="8" fill="#2563eb" />
          <text x="500" y="465" fontSize="16" textAnchor="middle" fill="#fff">우리 팀</text>
          <text x="500" y="493" fontSize="26" fontWeight="800" textAnchor="middle" fill="#fff">{`11팀, ${mine.rank}위, ${pct(mine)}%`}</text>
        </g>
      )}
      {len > 0 &&
        teams.map((tm) => {
          const q = positions[tm.id]
          const picked = selected === tm.id
          return (
            <g
              key={tm.id}
              role="button"
              tabIndex={0}
              aria-controls="team-detail"
              aria-label={`${teamNumber(tm.team)}팀, ${tm.rank}위, 진행률 ${pct(tm)}% 상세 보기`}
              aria-pressed={picked}
              onClick={() => onSelect(tm.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(tm.id)
                }
              }}
              style={{ transform: `translate(${q.x}px, ${q.y}px)`, transition: 'transform 0.3s linear', cursor: 'pointer' }}
            >
              <circle r="34" fill={picked ? '#fff' : 'transparent'} stroke={picked ? teamColor(tm.team) : 'transparent'} strokeWidth="4" />
              <foreignObject x="-32" y="-32" width="64" height="64" pointerEvents="none">
                <AnimatedPenguin size={64} running={playing} variant={teamNumber(tm.team)} />
              </foreignObject>
              <circle cx="25" cy="24" r="14" fill={teamColor(tm.team)} stroke="#fff" strokeWidth="2" />
              <text x="25" y="29" fontSize="14" fontWeight="800" textAnchor="middle" fill="#fff" pointerEvents="none">{teamNumber(tm.team)}</text>
            </g>
          )
        })}
    </svg>
  )
}
