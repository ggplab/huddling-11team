import { CONFIG } from '../config';
import { sortedTeams } from '../lib/format';
import { color, MEDAL_RGB, teamColor } from '../theme';
import { Trophy } from './Trophy';

interface Props {
  scores: number[];
  finished: number[];
  moves: Record<number, number>;
  selected: number | null;
  onSelect: (teamIndex: number) => void;
  accent?: string;
}

/** 왼쪽 순위 타워. 1~3위만 트로피 + 메달색 하이라이트, 나머지는 일반 숫자 */
export function RankingTower({ scores, finished, moves, selected, onSelect, accent = color.accent }: Props) {
  const sorted = sortedTeams(scores);
  const leader = sorted[0].score;
  const mine = CONFIG.myTeam - 1;

  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        background: color.ink,
        borderRadius: 12,
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        color: '#FFFFFF',
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 8px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5A4E' }} />
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 900, letterSpacing: '0.08em' }}>LIVE RANKING</h2>
        <div style={{ flexGrow: 1 }} />
        <div style={{ fontSize: 11, color: '#B5B5AF' }}>선두와 차이</div>
      </div>

      {sorted.map((t, k) => {
        const i = t.i;
        const isMine = i === mine;
        const isSel = selected === i;
        const top3 = k < 3;
        const mv = moves[i] ?? 0;
        const done = finished.includes(i);
        const fg = isSel ? color.text : '#FFFFFF';
        const bg = isSel
          ? '#FFFFFF'
          : isMine
            ? accent
            : top3
              ? `linear-gradient(to right, rgba(${MEDAL_RGB[k]},0.32), ${color.inkRow} 75%)`
              : color.inkRow;
        const gap = done ? 'FINISH' : k === 0 ? 'LEADER' : `-${(leader - t.score).toLocaleString()}`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`${k + 1}위 ${i + 1}팀, 파트별 주행 기록 보기`}
            aria-pressed={isSel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              height: 40,
              flexShrink: 0,
              padding: '0 10px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.3s',
              color: fg,
              background: bg,
              boxShadow: isSel ? `inset 0 0 0 2px ${accent}` : undefined,
            }}
          >
            {top3 ? (
              <Trophy rank={(k + 1) as 1 | 2 | 3} />
            ) : (
              <span style={{ width: 30, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: isSel ? color.textMuted : isMine ? '#FFFFFF' : '#B5B5AF' }}>
                {k + 1}
              </span>
            )}
            <span style={{ width: 4, height: 22, borderRadius: 2, flexShrink: 0, background: isMine && !isSel ? color.myTeamRing : teamColor(i, mine, accent) }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{i + 1}팀</span>
            <span style={{ flexGrow: 1 }} />
            <span style={{ width: 26, textAlign: 'right', fontSize: 11, fontWeight: 700, color: mv > 0 ? (isSel ? '#1E6B47' : color.up) : isSel ? '#A63A0B' : color.down }}>
              {mv > 0 ? `▲${mv}` : mv < 0 ? `▼${-mv}` : ''}
            </span>
            <span style={{ width: 58, textAlign: 'right', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isSel ? '#3D3D3A' : isMine ? '#FFFFFF' : '#C9C9C3' }}>{gap}</span>
          </button>
        );
      })}
    </aside>
  );
}
