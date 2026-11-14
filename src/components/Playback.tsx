// 공용 파일: 조장만 고친다. 세 시안이 함께 쓰는 재생 막대.
import { DURATION } from '../data/events'
import { clock, sim, useSim } from '../lib/sim'

const SPEEDS = [1, 2, 5, 10]

export default function Playback() {
  const { t, playing, speed } = useSim()
  return (
    <div className="mb-6 rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => sim.toggle()}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
        >
          {playing ? '멈춤' : t >= DURATION ? '다시 보기' : '진행 상황 보기'}
        </button>
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sim.setSpeed(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                speed === s ? 'bg-ink text-white' : 'bg-bg text-muted'
              }`}
            >
              {s}배
            </button>
          ))}
        </div>
        <button type="button" onClick={() => sim.reset()} className="text-sm text-muted underline">
          처음으로
        </button>
        <span className="ml-auto text-sm font-medium tabular-nums">
          시작 후 {clock(t)} / {clock(DURATION)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={DURATION}
        step={1}
        value={Math.floor(t)}
        onChange={(e) => sim.seek(Number(e.target.value))}
        className="mt-3 w-full accent-brand"
        aria-label="경과 시간"
      />
      <p className="mt-1 text-xs text-muted">시연용 예시 데이터입니다. 실제 조의 기록이 아닙니다.</p>
    </div>
  )
}
