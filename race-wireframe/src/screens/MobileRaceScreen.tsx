import { useEffect, useState } from 'react';
import { CONFIG, type Speed } from '../config';
import { LiveFeed } from '../components/LiveFeed';
import { TeamPanel } from '../components/TeamPanel';
import { Track } from '../components/Track';
import { useRace, MULTS } from '../data/useRace';
import { hms, sortedTeams } from '../lib/format';
import { TRACK } from '../lib/track';
import { color, MEDAL, teamColor } from '../theme';

/** 휴대폰 폭(768px 미만)에서 쓰는 레이스 화면. 위에서 아래로 조작, 숫자, 트랙, 순위, 중계를 쌓는다. */
export function useIsMobile() {
  const query = '(max-width: 767px)';
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}

function useViewportWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

const TRACK_W = TRACK.width * TRACK.scale;
const TRACK_H = TRACK.height * TRACK.scale;

interface Props {
  speed?: Speed;
  onFinish?: () => void;
}

export function MobileRaceScreen({ speed = 'normal', onFinish }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { state, banner, running, toggleRunning, mult, setMult, seek, start } = useRace({ scenario: 'live', speed, selected });
  const toggleSelect = (i: number) => setSelected((cur) => (cur === i ? null : i));
  const vw = useViewportWidth();
  const trackScale = (vw - 24) / TRACK_W;
  const sorted = sortedTeams(state.scores);
  const leader = sorted[0]?.score ?? 0;
  const mine = CONFIG.myTeam - 1;

  const chip = (active: boolean) => ({
    height: 32,
    minWidth: 40,
    padding: '0 10px',
    borderRadius: 8,
    border: `1px solid ${color.line}`,
    background: active ? color.ink : color.surface,
    color: active ? '#FFFFFF' : color.text,
    fontSize: 13,
    fontWeight: 700,
  });
  const stat = (label: string, value: string | number) => (
    <div style={{ background: color.surface, borderRadius: 10, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, color: color.textMuted }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: color.bg, paddingBottom: banner ? 120 : 24 }}>
      {/* 위: 제목과 조작 */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: color.surface, borderBottom: `1px solid ${color.line}`, padding: '10px 12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>커밋 레이스</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: running ? color.liveSoft : color.lineSoft, color: running ? color.live : '#3D3D3A' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: running ? color.live : '#8A8A85' }} />
            {running ? 'LIVE' : 'PAUSED'}
          </div>
          <div style={{ flexGrow: 1 }} />
          {onFinish && (
            <button type="button" onClick={onFinish} style={{ ...chip(true), fontSize: 12 }}>
              시상식
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button type="button" onClick={toggleRunning} style={{ ...chip(false), minWidth: 72 }}>
            {running ? '일시정지' : '재생'}
          </button>
          {MULTS.map((m) => (
            <button key={m} type="button" onClick={() => setMult(m)} style={chip(mult === m)}>
              {m}배
            </button>
          ))}
        </div>
        <input type="range" aria-label="재생 위치" min={start} max={CONFIG.durationSec} step={1} value={state.elapsed} onChange={(e) => seek(Number(e.target.value))} style={{ width: '100%', marginTop: 6, accentColor: color.ink }} />
      </header>

      {/* 숫자 4개 */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 12px 0' }}>
        {stat('경과 시간', hms(state.elapsed))}
        {stat('남은 시간', hms(CONFIG.durationSec - state.elapsed))}
        {stat('전체 커밋', state.commits.toLocaleString())}
        {stat('전체 PR 머지', state.prs)}
      </section>

      {/* 트랙: 화면 폭에 맞춰 줄인다 */}
      <section style={{ padding: '12px 12px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>레이스 트랙</div>
        <div style={{ width: TRACK_W * trackScale, height: TRACK_H * trackScale, background: color.field, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, transform: `scale(${trackScale})`, transformOrigin: '0 0' }}>
            <Track scores={state.scores} finished={state.finished} boost={state.boost} slip={state.slip} selected={selected} running={running} onSelect={toggleSelect} />
          </div>
        </div>
      </section>

      {/* 선택한 조 상세 */}
      {selected !== null && (
        <section style={{ padding: '12px 12px 0' }}>
          <TeamPanel state={state} teamIndex={selected} onClose={() => setSelected(null)} />
        </section>
      )}

      {/* 순위: 2열 */}
      <section style={{ padding: '12px 12px 0' }}>
        <div style={{ background: color.ink, borderRadius: 12, padding: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFFFFF', fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
            <span>LIVE RANKING</span>
            <span style={{ color: '#B5B5AF', fontWeight: 600 }}>선두와 차이</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {sorted.map((t, k) => {
              const isMine = t.i === mine;
              const isSel = selected === t.i;
              return (
                <button
                  key={t.i}
                  type="button"
                  onClick={() => toggleSelect(t.i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 8px', borderRadius: 8, border: isSel ? '2px solid #FFFFFF' : 'none', background: isMine ? color.accent : k < 3 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)', color: '#FFFFFF', fontSize: 13, fontWeight: 700, textAlign: 'left' }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, background: k < 3 ? MEDAL[k] : 'transparent', color: k < 3 ? color.ink : '#B5B5AF' }}>{k + 1}</span>
                  <span style={{ width: 4, height: 16, borderRadius: 2, background: teamColor(t.i, mine) }} />
                  <span>{t.i + 1}팀</span>
                  <span style={{ flexGrow: 1 }} />
                  <span style={{ fontSize: 11, color: k === 0 ? '#FFD84D' : '#C9C9C3', fontVariantNumeric: 'tabular-nums' }}>{k === 0 ? '선두' : `-${Math.round(leader - t.score)}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 실시간 중계 */}
      <section style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <LiveFeed items={state.feed} />
      </section>

      {/* 중계 자막: 화면 아래 고정 */}
      {banner && (
        <div key={`${banner.kind}-${banner.team}-${banner.time}`} className="cr-lt" style={{ position: 'fixed', left: 8, right: 8, bottom: 8, zIndex: 30, display: 'flex', alignItems: 'stretch', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
          <div style={{ width: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: banner.kind === 'fire' ? color.slip : banner.kind === 'finish' ? color.lead : color.accent, color: '#FFFFFF', fontSize: 22, fontWeight: 900 }}>
            {banner.team}
          </div>
          <div style={{ flexGrow: 1, background: color.ink, color: '#FFFFFF', padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#FF8A80', fontWeight: 800 }}>LIVE 중계, {banner.time}</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{banner.title}</div>
            <div style={{ fontSize: 12, color: '#D9D9D4', marginTop: 2, lineHeight: 1.4 }}>{banner.line}</div>
          </div>
        </div>
      )}
    </div>
  );
}
