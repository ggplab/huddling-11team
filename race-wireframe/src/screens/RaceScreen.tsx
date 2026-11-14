import { useEffect, useRef, useState } from 'react';
import type { Speed } from '../config';
import { CONFIG } from '../config';
import { BroadcastBanner } from '../components/BroadcastBanner';
import { btnOutline, btnSolid, Header } from '../components/Header';
import { RankingTower } from '../components/RankingTower';
import { TeamPanel } from '../components/TeamPanel';
import { Track } from '../components/Track';
import type { Scenario } from '../data/types';
import { MULTS, useRace } from '../data/useRace';
import { hms } from '../lib/format';
import { color } from '../theme';

interface Props {
  scenario?: Scenario;
  speed?: Speed;
  onFinish?: () => void;
}

/** B. 레이스 중계 화면 (순위 타워, 트랙, 파트별 주행 기록, 중계 팝오버) */
export function RaceScreen({ scenario = 'live', speed = 'normal', onFinish }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { state, banner, running, toggleRunning, isLive, mult, setMult, seek, start } = useRace({ scenario, speed, selected });
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closePanel = (restoreFocus = true) => {
    setSelected(null);
    if (restoreFocus) triggerRef.current?.focus();
  };
  const toggleSelect = (i: number) => {
    if (selected === i) {
      closePanel();
      return;
    }
    if (document.activeElement instanceof HTMLElement) triggerRef.current = document.activeElement;
    setSelected(i);
  };

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || panelRef.current?.contains(target)) return;
      // Team controls handle selection themselves, including toggling the current team.
      if (target.closest('button[aria-pressed]')) return;
      closePanel(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [selected]);

  const stat = (label: string, value: string | number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 11, color: color.textMuted }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );

  return (
    <div className="cr-in" style={{ position: 'relative', width: 1600, height: 900, background: color.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header title="커밋 레이스" subtitle="커밋할수록 앞으로, 해커톤 실시간 현황">
        {isLive && (
          <div style={{ display: 'flex', gap: 4 }}>
            {MULTS.map((m) => (
              <button key={m} type="button" onClick={() => setMult(m)} style={{ ...btnOutline, height: 36, padding: '0 10px', background: mult === m ? color.ink : color.surface, color: mult === m ? '#FFFFFF' : color.text }}>
                {m}배
              </button>
            ))}
          </div>
        )}
        {isLive && (
          <button type="button" onClick={toggleRunning} style={btnOutline}>
            {running ? '일시정지' : '재생'}
          </button>
        )}
        {onFinish && (
          <button type="button" onClick={onFinish} style={btnSolid}>
            종료, 시상식
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: running ? color.liveSoft : color.lineSoft, color: running ? color.live : '#3D3D3A' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? color.live : '#8A8A85' }} />
          {running ? 'LIVE' : 'PAUSED'}
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {stat('경과 시간', hms(state.elapsed))}
          {stat('남은 시간', hms(CONFIG.durationSec - state.elapsed))}
          {stat('전체 커밋', state.commits.toLocaleString())}
          {stat('전체 PR 머지', state.prs)}
        </div>
      </Header>
      {isLive && (
        <div style={{ padding: '8px 32px 0' }}>
          <input type="range" aria-label="재생 위치" min={start} max={CONFIG.durationSec} step={1} value={state.elapsed} onChange={(e) => seek(Number(e.target.value))} style={{ width: '100%', accentColor: color.ink }} />
        </div>
      )}

      <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', gap: 20, padding: '20px 24px 24px' }}>
        <RankingTower scores={state.scores} finished={state.finished} moves={state.moves} selected={selected} onSelect={toggleSelect} />

        <section style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>레이스 트랙</h2>
            <div style={{ fontSize: 12, color: color.textMuted }}>결승선 {CONFIG.goal.toLocaleString()}점</div>
            <div style={{ flexGrow: 1 }} />
            <Legend />
          </div>
          <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color.field, borderRadius: 12, overflow: 'hidden' }}>
            <Track scores={state.scores} finished={state.finished} boost={state.boost} slip={state.slip} selected={selected} running={running} onSelect={toggleSelect} />
          </div>
        </section>

        {selected !== null && (
          <div ref={panelRef} style={{ position: 'absolute', zIndex: 100, top: 150, right: 36, bottom: 36, width: 390, maxHeight: 680 }}>
            <TeamPanel state={state} teamIndex={selected} onClose={() => closePanel()} />
          </div>
        )}
      </div>

      {banner && <BroadcastBanner key={`${banner.kind}-${banner.team}-${banner.time}`} banner={banner} live={isLive} />}
    </div>
  );
}

function Legend() {
  const item = (dot: string, label: string) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} />
      {label}
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: color.textMuted, alignItems: 'center' }}>
      {item('#2E7D4F', '커밋 = 전진')}
      {item(color.accent, 'PR 머지 = 부스터')}
      {item(color.slip, 'CI 실패 = 미끄러짐')}
    </div>
  );
}
