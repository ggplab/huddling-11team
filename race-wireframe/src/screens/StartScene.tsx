import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { btnOutline, btnSolid, Header } from '../components/Header';
import { color, TILE_BG, TILE_FG, teamColor } from '../theme';

type Phase = 'pre' | 'marks' | 'set' | 'go';

interface Props {
  /** 출발 후 CONFIG.startToRaceMs 가 지나면 호출 → 레이스 중계 화면으로 */
  onDone: () => void;
  accent?: string;
}

/** 팀별 출발 후 이동 거리(px). 동시에 출발하지만 살짝씩 다르게 */
const DASH = [430, 470, 410, 450, 400, 480, 460, 440, 415, 455, 500, 425, 445, 395, 435];
const START_X = 276;

/**
 * A. 출발 장면
 * Ready(스타팅 블록에 자리) → Set(엉덩이를 들고 대기) → 랜덤 정적 → GO!(동시 출발) → 레이스 화면
 */
const PENGUINS = ['/images/race/penguin-classic.png', '/images/race/penguin-baby.png', '/images/race/penguin-sporty.png', '/images/race/penguin-developer.png'];

export function StartScene({ onDone, accent = color.accent }: Props) {
  const [phase, setPhase] = useState<Phase>('pre');
  const [cta, setCta] = useState(false);
  const [shake, setShake] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const run = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    setPhase('pre');
    setCta(false);
    setShake(false);
    setLeaving(false);
    later(120, () => setPhase('marks'));
    const setAt = 2600;
    later(setAt, () => setPhase('set'));
    // 실제 육상처럼 Set 이후 정적 시간은 매번 다르게 (1.5~2.4초)
    const goAt = setAt + 1500 + Math.round(Math.random() * 900);
    later(goAt, () => {
      setPhase('go');
      setShake(true);
    });
    later(goAt + 450, () => setShake(false));
    later(goAt + 600, () => setCta(true));
    later(goAt + CONFIG.startToRaceMs - 500, () => setLeaving(true));
    later(goAt + CONFIG.startToRaceMs, () => onDoneRef.current());
  }, []);

  useEffect(() => {
    run();
    const t = timers;
    return () => t.current.forEach((id) => window.clearTimeout(id));
  }, [run]);

  const go = phase === 'go';
  const set = phase === 'set';
  const marks = phase === 'marks';
  const pre = phase === 'pre';
  const mine = CONFIG.myTeam - 1;
  const caption = go ? 'GO! 15팀이 동시에 출발했어요' : set ? 'Set, 모두 숨죽이고 출발 신호를 기다리는 중' : 'Ready, 15팀이 스타팅 블록에 자리 잡는 중';

  return (
    <div style={{ position: 'relative', width: 1600, height: 900, background: color.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header title="커밋 레이스, 출발" subtitle="15팀이 출발선에 섰어요, 해커톤 시작">
        <button type="button" onClick={run} style={btnOutline}>
          출발 다시 보기
        </button>
        <button type="button" onClick={onDone} style={btnSolid}>
          레이스 중계로 건너뛰기
        </button>
      </Header>

      <div style={{ flexGrow: 1, minHeight: 0, padding: '20px 24px 24px', display: 'flex' }}>
        <div className={shake ? 'cr-shake' : ''} style={{ position: 'relative', flexGrow: 1, background: color.field, borderRadius: 12, overflow: 'hidden' }}>
          {/* 관중석 */}
          <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 64, background: color.stands, borderBottom: '6px solid #BDB8AA' }}>
            <div className={go ? 'cr-scroll' : ''} style={{ position: 'absolute', left: 24, right: 24, top: 14, height: 30, borderRadius: 6, background: `repeating-linear-gradient(to right, ${color.seat} 0 30px, ${color.stands} 30px 40px)` }} />
          </div>

          {/* 15레인 직선 트랙 */}
          <div style={{ position: 'absolute', left: 48, right: 48, top: 104, height: 563, borderTop: '4px solid #FFFFFF', borderBottom: '4px solid #FFFFFF', background: `repeating-linear-gradient(to bottom, ${color.track} 0 35px, #FFFFFF 35px 37px)` }} />
          <div className={go ? 'cr-scroll' : ''} style={{ position: 'absolute', left: 48, right: 48, top: 108, height: 555, background: 'repeating-linear-gradient(to right, transparent 0 236px, rgba(255,255,255,0.55) 236px 240px)' }} />
          <div style={{ position: 'absolute', left: 236, top: 104, width: 10, height: 563, background: '#FFFFFF', transition: 'opacity 0.4s', opacity: go ? 0.5 : 1 }} />

          {Array.from({ length: CONFIG.teamCount }, (_, i) => {
            const isMine = i === mine;
            const cy = 104 + 4 + i * 37 + 17;
            const size = isMine ? 56 : 48;
            const x = go ? DASH[i] : pre ? -70 : set ? -4 : 0;
            const bodyCls = go ? 'cr-run' : set ? 'cr-set' : marks ? 'cr-marks' : '';
            return (
              <div key={i}>
                <div style={{ position: 'absolute', left: 172, top: cy - 12, width: 52, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, background: TILE_BG[i % 6], color: TILE_FG[i % 6] }}>{i + 1}</div>
                {go && <div className="cr-dust" style={{ position: 'absolute', left: START_X - 14, top: cy, width: 30, height: 22, borderRadius: '50%', background: 'rgba(240,232,214,0.9)', pointerEvents: 'none', animationDelay: `${(i % 3) * 0.02}s` }} />}
                <div
                  style={{
                    position: 'absolute',
                    left: START_X,
                    top: cy,
                    width: 0,
                    height: 0,
                    transform: `translateX(${x}px)`,
                    transition: `transform ${go ? '1.7s cubic-bezier(.5,0,.3,1)' : pre ? '0s' : '0.9s ease-out'}`,
                  }}
                >
                  <div style={{ position: 'absolute', right: 6, top: -4, height: 8, borderRadius: 4, background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.9))', transition: 'width 0.5s ease 0.15s', width: go ? 140 : 0 }} />
                  <div
                    className={bodyCls}
                    style={{
                      position: 'absolute',
                      left: -size / 2,
                      top: -size / 2,
                      width: size,
                      height: size,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      color: '#FFFFFF',
                      zIndex: 2,
                      transformOrigin: '50% 100%',
                      transition: 'transform 0.4s ease-out',
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
                      animationDelay: go ? `${(i % 4) * 0.05}s` : undefined,
                    }}
                  >
                    <img src={PENGUINS[i % PENGUINS.length]} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <span style={{ position: 'absolute', right: -6, bottom: -4, minWidth: 20, height: 20, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#FFFFFF', background: teamColor(i, mine, accent), border: isMine ? `3px solid ${color.myTeamRing}` : '2px solid #FFFFFF' }}>
                      {i + 1}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {(pre || marks) && <Callout key="ready" size={44} height={96} border={5}>Ready</Callout>}
          {set && <Callout key="set" size={64} height={120} border={6}>Set</Callout>}
          {go && (
            <>
              <div className="cr-flash" style={{ position: 'absolute', inset: 0, background: '#FFFFFF', pointerEvents: 'none', zIndex: 8 }} />
              <div className="cr-bang" style={{ position: 'absolute', left: '50%', top: '20%', width: 300, height: 120, borderRadius: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 900, fontStyle: 'italic', background: accent, color: '#FFFFFF', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', zIndex: 9, pointerEvents: 'none' }}>
                GO!
              </div>
            </>
          )}

          {leaving && (
            <div className="cr-leave" style={{ position: 'absolute', inset: 0, zIndex: 20, background: color.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 28, fontWeight: 900, letterSpacing: '0.08em' }}>
              LIVE, 레이스 중계
            </div>
          )}

          <div style={{ position: 'absolute', left: '50%', bottom: 22, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: color.text, background: '#FFFFFF', borderRadius: 999, padding: '8px 18px', whiteSpace: 'nowrap' }}>{caption}</div>
            {cta && (
              <button type="button" onClick={onDone} style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 48, padding: '0 22px', border: 'none', borderRadius: 999, background: accent, color: '#FFFFFF', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer' }}>
                <span className="cr-fill" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.22)' }} />
                <span style={{ position: 'relative' }}>곧 레이스 중계로 넘어가요</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Callout({ children, size, height, border }: { children: string; size: number; height: number; border: number }) {
  return (
    <div
      className="cr-pop"
      style={{
        position: 'absolute',
        left: '50%',
        top: '52%',
        height,
        padding: `0 ${height / 2 - 4}px`,
        borderRadius: height / 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size,
        fontWeight: 900,
        background: '#FFFFFF',
        color: color.text,
        border: `${border}px solid ${color.ink}`,
        whiteSpace: 'nowrap',
        boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        zIndex: 7,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}
