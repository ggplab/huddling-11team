// 위 띠: 제목, 조작 버튼, 숫자 네 개, 재생 위치 막대
import { clock, sim, useSim } from '../../lib/sim'

function hms(min: number) {
  const s = Math.max(0, Math.round(min * 60))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`
}

export default function TopBar({ commits, merges }: { commits: number; merges: number }) {
  const { t, playing, speed, source, activeSource, fallback, duration } = useSim()
  const stats = [
    ['경과 시간', hms(t)],
    ['남은 시간', hms(duration - t)],
    ['전체 커밋', commits.toLocaleString('ko-KR')],
    ['전체 PR 머지', merges.toLocaleString('ko-KR')],
  ]
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">커밋 레이스</h1>
            <span className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
              {activeSource === 'example' ? '시뮬레이션 데이터' : 'GitHub 수집 데이터'}
            </span>
          </div>
          <p className="text-xs text-muted">
            커밋할수록 앞으로, 해커톤 실시간 현황
            {activeSource === 'example' && ' (시연용 예시 데이터입니다. 실제 조의 기록이 아닙니다.)'}
            {fallback && ' 실제 데이터를 불러오지 못해 예시 데이터로 보여 줍니다.'}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex gap-1" role="group" aria-label="배속">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sim.setSpeed(s)}
                className={`rounded-full px-2 py-1 text-xs font-medium ${speed === s ? 'bg-ink text-white' : 'bg-bg text-muted'}`}
              >
                {s}배
              </button>
            ))}
          </div>
          <div className="flex gap-1" role="group" aria-label="데이터 원천">
            {(['example', 'real'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void sim.setSource(s)}
                className={`rounded-full px-2 py-1 text-xs font-medium ${source === s ? 'bg-brand text-white' : 'bg-bg text-muted'}`}
              >
                {s === 'example' ? '예시' : '실제'}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => sim.toggle()} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold">
            {playing ? '일시정지' : '재생'}
          </button>
          <button
            type="button"
            onClick={() => {
              sim.pause()
              sim.seek(duration)
            }}
            className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white"
          >
            종료, 시상식
          </button>
          {playing && (
            <span className="flex items-center gap-1 text-xs font-bold text-danger">
              <span className="h-2 w-2 rounded-full bg-danger" />
              LIVE
            </span>
          )}
          {stats.map(([label, value]) => (
            <div key={label} className="text-right">
              <p className="text-[10px] text-muted">{label}</p>
              <p className="text-sm font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={duration}
        step={1}
        value={Math.floor(t)}
        onChange={(e) => sim.seek(Number(e.target.value))}
        className="mt-2 block h-1 w-full accent-brand"
        aria-label={`경과 시간 ${clock(t)}`}
      />
    </div>
  )
}
