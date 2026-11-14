// 차 한 대. 그림이 없으면 이모지 임시 모양을 조 색 블록 위에 그린다.
import { raceAssets } from '../../lib/raceAssets'

type Props = { teamId: string; color: string; running: boolean; stopped: boolean; crashed: boolean; size: number }

export default function Car({ teamId, color, running, stopped, crashed, size }: Props) {
  const src = raceAssets.carByTeam?.[teamId] ?? raceAssets.car
  return (
    <span
      className={`relative inline-flex items-center justify-center ${crashed ? 'race-shake' : ''}`}
      style={{ width: size * 1.6, height: size, filter: stopped ? 'grayscale(1)' : undefined, opacity: stopped ? 0.6 : 1 }}
    >
      {running && (
        <span className="absolute right-full mr-0.5 flex flex-col gap-0.5" aria-hidden>
          <span className="block h-0.5 w-4 rounded bg-muted/60" />
          <span className="block h-0.5 w-6 rounded bg-muted/40" />
          <span className="block h-0.5 w-3 rounded bg-muted/60" />
        </span>
      )}
      {src ? (
        <img src={src} alt="" className="h-full w-full object-contain" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-md"
          style={{ backgroundColor: color, fontSize: size * 0.7, lineHeight: 1 }}
        >
          🏎️
        </span>
      )}
      {crashed && (
        <span className="absolute -top-1 -right-1" style={{ fontSize: size * 0.7 }} aria-label="충돌">
          💥
        </span>
      )}
      {stopped && (
        <span className="absolute -top-1 -right-1 text-xs" aria-label="멈춤">
          ⏸
        </span>
      )}
    </span>
  )
}
