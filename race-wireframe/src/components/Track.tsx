import { prop } from '../assets';
import { penguinFor } from '../assets';
import { CONFIG } from '../config';
import { rankMap, sortedTeams } from '../lib/format';
import { pointAt, runnerPosition, TRACK, TRACK_PATH } from '../lib/track';
import { color, TILE_BG, TILE_FG, teamColor } from '../theme';

interface Props {
  scores: number[];
  finished: number[];
  boost: Record<number, boolean>;
  slip: Record<number, boolean>;
  selected: number | null;
  running: boolean;
  onSelect: (teamIndex: number) => void;
  accent?: string;
}

const FLAGS: [number, number][] = [
  [380, 12], [620, 12], [840, 12], [330, 180], [700, 180], [300, 254], [840, 254],
  [760, 419], [880, 419], [400, 494], [720, 494], [380, 660], [620, 660],
];

/** S자 트랙 + 무빙워크 효과 + 팀 말(토큰) */
export function Track({ scores, finished, boost, slip, selected, running, onSelect, accent = color.accent }: Props) {
  const goal = CONFIG.goal;
  const mine = CONFIG.myTeam - 1;
  const rank = rankMap(scores);
  const sorted = sortedTeams(scores);
  const lead = sorted[0];
  const pct = (s: number) => Math.min(100, Math.round((s / goal) * 100));
  const flowCls = running ? '' : ' cr-paused';

  const checkpoints = [0.25, 0.5, 0.75].map((t, i) => {
    const p = pointAt(t);
    const nx = -p.dy;
    const ny = p.dx;
    return { x1: p.x + nx * 65, y1: p.y + ny * 65, x2: p.x - nx * 65, y2: p.y - ny * 65, label: `${(i + 1) * 25}%`, lx: p.x - 20, ly: p.y - (p.dy === 0 ? 92 : 10) };
  });

  return (
    <div style={{ position: 'relative', width: TRACK.width * TRACK.scale, height: TRACK.height * TRACK.scale, flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: TRACK.width, height: TRACK.height, transform: `scale(${TRACK.scale})`, transformOrigin: '0 0' }}>
        <svg width={TRACK.width} height={TRACK.height} viewBox={`0 0 ${TRACK.width} ${TRACK.height}`} style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
          <defs>
            <pattern id="crChk" width={16} height={16} patternUnits="userSpaceOnUse">
              <rect width={16} height={16} fill="#1B1B1A" />
              <rect width={8} height={8} fill="#FFFFFF" />
              <rect x={8} y={8} width={8} height={8} fill="#FFFFFF" />
            </pattern>
          </defs>
          {/* 레인 라인: 굵기를 줄여가며 흰/빨강을 겹쳐 그려 5개 레인을 만든다 */}
          <path d={TRACK_PATH} fill="none" stroke="#FFFFFF" strokeWidth={136} />
          <path d={TRACK_PATH} fill="none" stroke={color.track} strokeWidth={130} />
          <path d={TRACK_PATH} fill="none" stroke="#FFFFFF" strokeWidth={80} />
          <path d={TRACK_PATH} fill="none" stroke={color.track} strokeWidth={76} />
          <path d={TRACK_PATH} fill="none" stroke="#FFFFFF" strokeWidth={28} />
          <path d={TRACK_PATH} fill="none" stroke={color.track} strokeWidth={24} />
          {/* 무빙워크: 대시를 진행 방향으로 흘려보낸다 */}
          <path className={'cr-belt' + flowCls} d={TRACK_PATH} fill="none" stroke="#FFFFFF" strokeOpacity={0.16} strokeWidth={128} strokeDasharray="12 36" />
          <path className={'cr-lane' + flowCls} d={TRACK_PATH} fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="14 46" />

          {FLAGS.map(([x, y], k) => (
            <image key={k} href={prop('github-flag-stand-small')} x={x - 6} y={y - 8} width={26} height={36} />
          ))}

          {[0, 1, 2, 3, 4].map((k) => {
            const n = 5 - k;
            const x = 211 + k * 20;
            const cy = 110 + (k - 2) * 26;
            return (
              <g key={k}>
                <rect x={x} y={cy - 10} width={34} height={20} fill={TILE_BG[n - 1]} />
                <text x={x + 17} y={cy + 5} fontSize={13} fontWeight={900} textAnchor="middle" fill={TILE_FG[n - 1]}>
                  {n}
                </text>
              </g>
            );
          })}

          {checkpoints.map((c, k) => (
            <line key={k} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#FFFFFF" strokeWidth={4} strokeDasharray="6 6" />
          ))}
          <rect x={187} y={45} width={16} height={130} fill="#FFFFFF" />
          <rect x={897} y={525} width={16} height={130} fill="url(#crChk)" />
        </svg>

        <img src={prop('start-sign-purple')} alt="START" draggable={false} style={{ position: 'absolute', left: 200, top: 2, width: 96, pointerEvents: 'none' }} />
        <img src={prop('checkered-flag')} alt="" draggable={false} style={{ position: 'absolute', left: 918, top: 470, width: 52, pointerEvents: 'none' }} />
        <img src={prop('race-announcer-speakers')} alt="" draggable={false} style={{ position: 'absolute', left: 250, top: 196, width: 54, pointerEvents: 'none' }} />
        <img src={prop('race-barrier-long')} alt="" draggable={false} style={{ position: 'absolute', left: 720, top: 436, width: 96, pointerEvents: 'none' }} />
        <img src={prop('traffic-cone-orange')} alt="" draggable={false} style={{ position: 'absolute', left: 832, top: 446, width: 24, pointerEvents: 'none' }} />
        <img src={prop('traffic-cone-purple')} alt="" draggable={false} style={{ position: 'absolute', left: 860, top: 452, width: 20, pointerEvents: 'none' }} />
        <img src={prop('race-barrier-short')} alt="" draggable={false} style={{ position: 'absolute', left: 120, top: 672, width: 60, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 760, top: 660, fontSize: 22, fontWeight: 900, letterSpacing: '0.06em', color: '#3B3FBF', background: '#FFFFFF', border: '3px solid #3B3FBF', padding: '2px 18px', borderRadius: '10px 10px 4px 4px', boxShadow: '0 3px 0 #2A2D8F' }}>FINISH</div>
        {checkpoints.map((c, k) => (
          <div key={k} style={{ position: 'absolute', left: Math.round(c.lx), top: Math.round(c.ly), width: 40, textAlign: 'center', fontSize: 12, fontWeight: 700, color: color.text, background: '#FFFFFF', borderRadius: 4 }}>
            {c.label}
          </div>
        ))}

        <Sign left={730} top={210} bg="#C93BD6" label="COMMIT!" checkerSide="left" />
        <Sign left={230} top={448} bg="#1F8A55" label="PUSH!" checkerSide="right" />

        <div style={{ position: 'absolute', left: 420, top: 202, width: 260, height: 56, background: '#FFFFFF', border: `3px solid ${color.ink}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: color.textMuted }}>현재 선두</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            {lead.i + 1}팀, {pct(lead.score)}%
          </div>
        </div>
        <div style={{ position: 'absolute', left: 420, top: 440, width: 260, height: 56, background: accent, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>우리 팀</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            {CONFIG.myTeam}팀, {rank[mine]}위, {pct(scores[mine])}%
          </div>
        </div>

        {scores.map((score, i) => {
          const { x, y } = runnerPosition(score / goal, i);
          const isMine = i === mine;
          const isSel = selected === i;
          const dim = selected !== null && !isSel;
          const done = finished.includes(i);
          const size = isSel ? 64 : isMine ? 56 : 46;
          const faceLeft = pointAt(Math.min(1, score / goal)).dx < 0;
          let tag = '';
          let tagBg = '';
          if (done) [tag, tagBg] = ['완주', color.ink];
          else if (boost[i]) [tag, tagBg] = ['부스터', accent];
          else if (slip[i]) [tag, tagBg] = ['미끄러짐', color.slip];
          else if (isSel) [tag, tagBg] = [`${rank[i]}위`, color.ink];
          else if (rank[i] === 1) [tag, tagBg] = ['선두', '#8A6A00'];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 0,
                height: 0,
                transition: 'left 0.9s ease, top 0.9s ease, opacity 0.3s',
                opacity: dim ? 0.45 : 1,
                zIndex: isSel ? 40 : isMine ? 30 : 10 + (rank[i] % 10),
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`${i + 1}팀, ${rank[i]}위, 파트별 주행 기록 보기`}
                aria-pressed={isSel}
                style={{
                  position: 'absolute',
                  left: -size * 0.75,
                  top: -size * 1.2,
                  width: size * 1.5,
                  height: size * 1.5,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  filter: isSel ? 'drop-shadow(0 0 6px #FFFFFF) drop-shadow(0 4px 8px rgba(0,0,0,0.45))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
                }}
              >
                <img src={penguinFor(i)} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', transform: faceLeft ? 'scaleX(-1)' : undefined, transition: 'transform 0.3s' }} />
                <span
                  style={{
                    position: 'absolute',
                    right: -4,
                    bottom: -2,
                    minWidth: isSel ? 26 : isMine ? 24 : 20,
                    height: isSel ? 26 : isMine ? 24 : 20,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSel ? 14 : isMine ? 13 : 11,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    background: teamColor(i, mine, accent),
                    border: isSel ? `3px solid ${color.ink}` : isMine ? `3px solid ${color.myTeamRing}` : '2px solid #FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  {i + 1}
                </span>
              </button>
              {tag && (
                <div style={{ position: 'absolute', left: -30, top: -size * 1.2 - 20, width: 60, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#FFFFFF', background: tagBg, borderRadius: 4, padding: '1px 0', pointerEvents: 'none' }}>
                  {tag}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sign({ left, top, bg, label, checkerSide }: { left: number; top: number; bg: string; label: string; checkerSide: 'left' | 'right' }) {
  const checker = <div style={{ width: 22, height: '100%', flexShrink: 0, background: 'repeating-conic-gradient(#1B1B1A 0% 25%, #FFFFFF 0% 50%) 0 0 / 11px 11px' }} />;
  return (
    <div style={{ position: 'absolute', left, top, width: 150, height: 40, display: 'flex', alignItems: 'center', border: '3px solid #1B1B1A', borderRadius: 4, overflow: 'hidden', background: bg }}>
      {checkerSide === 'left' && checker}
      <div style={{ flexGrow: 1, textAlign: 'center', fontSize: 17, fontWeight: 900, color: '#FFFFFF', fontStyle: 'italic' }}>{label}</div>
      {checkerSide === 'right' && checker}
    </div>
  );
}
