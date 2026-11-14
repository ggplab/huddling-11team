// 가운데 S자 트랙(SVG). 조 표식을 distance / 결승선 거리 만큼 길 위에 놓는다.
import { useLayoutEffect, useRef, useState } from 'react'
import { penguinFor } from '../../lib/raceAssets'
import type { TeamStat } from '../../lib/sim'
import { teamColor, teamNumber } from '../../lib/teamColor'

const PATH = 'M150,120 H820 A110,110 0 0 1 820,340 H180 A110,110 0 0 0 180,560 H820'

type Props = { teams: TeamStat[]; finish: number; selected?: string; onSelect: (id: string) => void }

export default function SnakeTrack({ teams, finish, selected, onSelect }: Props) {
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

  // 같은 자리에 몰린 조는 길과 수직 방향으로 어긋나게 놓는다
  const sorted = [...teams].sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
  const side: Record<string, number> = {}
  let group: TeamStat[] = []
  const flush = () => {
    group.forEach((tm, i) => (side[tm.id] = (i - (group.length - 1) / 2) * 22))
    group = []
  }
  sorted.forEach((tm) => {
    if (group.length && (tm.distance - group[0].distance) / finish > 0.025) flush()
    group.push(tm)
  })
  flush()

  const leader = teams.find((x) => x.rank === 1)
  const mine = teams.find((x) => x.id === '11')
  const pct = (x: TeamStat) => Math.round((x.distance / finish) * 100)

  const lanes: [string, number][] = [['#fff', 124], ['var(--color-track)', 118], ['#fff', 92], ['var(--color-track)', 86], ['#fff', 60], ['var(--color-track)', 54], ['#fff', 28], ['var(--color-track)', 22]]
  return (
    <svg viewBox="0 0 1000 680" className="w-full rounded-card bg-grass" role="img" aria-label="S자 레이스 트랙">
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
          const q = at(tm.distance / finish, side[tm.id] ?? 0)
          const picked = selected === tm.id
          const showPenguin = picked || tm.rank === 1
          return (
            <g
              key={tm.id}
              onClick={() => onSelect(tm.id)}
              style={{ transform: `translate(${q.x}px, ${q.y}px)`, transition: 'transform 0.3s linear', cursor: 'pointer' }}
            >
              {showPenguin && (
                <image
                  href={penguinFor(teamNumber(tm.team))}
                  x="-22"
                  y="-62"
                  width="44"
                  height="44"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              <circle r="18" fill={teamColor(tm.team)} stroke={picked ? '#111827' : '#fff'} strokeWidth={picked ? 5 : 3} />
              <text y="6" fontSize="17" fontWeight="800" textAnchor="middle" fill="#fff">{teamNumber(tm.team)}</text>
            </g>
          )
        })}
    </svg>
  )
}
