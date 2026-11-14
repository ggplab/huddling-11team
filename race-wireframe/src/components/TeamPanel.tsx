import { partLevel, partPenguin } from '../assets';
import { CONFIG } from '../config';
import type { RaceState } from '../data/types';
import { rankMap } from '../lib/format';
import { color, PART_COLORS, teamColor } from '../theme';
import { FeedList } from './LiveFeed';

interface Props {
  state: RaceState;
  teamIndex: number;
  onClose: () => void;
  accent?: string;
}

/** 오른쪽 사이드 패널: 선택한 팀의 파트별 주행 기록 */
export function TeamPanel({ state, teamIndex, onClose, accent = color.accent }: Props) {
  const goal = CONFIG.goal;
  const mine = CONFIG.myTeam - 1;
  const st = state.stats[teamIndex];
  const score = state.scores[teamIndex];
  const rank = rankMap(state.scores)[teamIndex];
  const total = st.parts.reduce((a, b) => a + b, 0) || 1;
  const top = Math.max(...st.parts) || 1;
  const pct = Math.min(100, Math.round((score / goal) * 100));
  const toGo = Math.max(0, goal - score);
  const tc = teamColor(teamIndex, mine, accent);
  const done = state.finished.includes(teamIndex);

  const stat = (label: string, value: string | number) => (
    <div style={{ background: '#F6F6F3', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 11, color: color.textMuted }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700 }}>{value}</div>
    </div>
  );

  return (
    <section style={{ flexGrow: 1, minHeight: 0, background: '#FFFFFF', border: `1px solid ${color.line}`, borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#FFFFFF', flexShrink: 0, background: tc }}>{teamIndex + 1}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{teamIndex + 1}팀</h2>
            {teamIndex === mine && <div style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', background: accent, borderRadius: 4, padding: '1px 6px' }}>우리 팀</div>}
          </div>
          <div style={{ fontSize: 12, color: color.textMuted }}>
            {rank}위, {done ? '완주' : '레이스 중'}
          </div>
        </div>
        <div style={{ flexGrow: 1 }} />
        <button type="button" onClick={onClose} aria-label="팀 패널 닫기" style={{ width: 44, height: 44, border: `1px solid ${color.line}`, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.text }}>
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path d="M3 3l10 10M13 3 3 13" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{pct}%</div>
          <div style={{ fontSize: 13, color: color.textMuted }}>{toGo === 0 ? '결승선 통과!' : `결승선까지 ${toGo.toLocaleString()}점`}</div>
        </div>
        <div style={{ height: 10, background: color.lineSoft, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: 10, borderRadius: 5, transition: 'width 0.5s', width: `${pct}%`, background: tc }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
        {stat('점수', score.toLocaleString())}
        {stat('커밋', st.commits)}
        {stat('PR 머지', st.prs)}
        {stat('CI 실패', st.fails)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>파트별 주행 기록</h3>
          <div style={{ fontSize: 12, color: color.textMuted }}>파트가 커밋으로 밀어 준 거리</div>
        </div>
        <div style={{ height: 14, borderRadius: 7, overflow: 'hidden', display: 'flex' }}>
          {st.parts.map((c, k) => (
            <div key={k} style={{ height: 14, transition: 'width 0.5s', width: `${(c / total) * 100}%`, background: PART_COLORS[k] }} />
          ))}
        </div>
        {st.parts.map((c, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 52, height: 40, flexShrink: 0, borderRadius: 8, background: '#F6F6F3', overflow: 'hidden' }}>
              <img key={partLevel(c)} src={partPenguin(k, partLevel(c))} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ width: 56, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13 }}>{CONFIG.parts[k]}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: PART_COLORS[k] }}>Lv.{partLevel(c)}</span>
            </div>
            <div style={{ flexGrow: 1, height: 8, background: color.lineSoft, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: 8, borderRadius: 4, transition: 'width 0.5s', width: `${Math.round((c / top) * 100)}%`, background: PART_COLORS[k] }} />
            </div>
            <div style={{ width: 52, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{c}커밋</div>
            <div style={{ width: 38, textAlign: 'right', fontSize: 12, color: color.textMuted }}>{Math.round((c / total) * 100)}%</div>
          </div>
        ))}
      </div>

      <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>최근 활동</h3>
        <FeedList items={st.recent} />
      </div>
    </section>
  );
}
