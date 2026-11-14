import { CONFIG } from '../config';
import { btnOutline, btnSolid, Header } from '../components/Header';
import { color, teamColor } from '../theme';

export interface PodiumResult {
  /** 완주 순서대로 팀 index (완주 못 한 팀은 점수 순) */
  order: { teamIndex: number; score: number; finishTime?: string }[];
  awards: { label: string; who: string; detail: string; tone: 'blue' | 'green' | 'orange' }[];
}

/** 목업 결과. 실제로는 레이스 종료 시점의 RaceState 로 만든다 */
export const MOCK_RESULT: PodiumResult = (() => {
  const final = [1600, 1180, 1600, 940, 760, 1340, 1600, 1060, 880, 1290, 1600, 820, 1120, 700, 990];
  const finishOrder = [10, 2, 6, 0];
  const times: Record<number, string> = { 10: '12:48:10 완주', 2: '12:53:42 완주', 6: '12:57:05 완주' };
  const order = final
    .map((score, teamIndex) => ({ teamIndex, score, finishTime: times[teamIndex] }))
    .sort((a, b) => {
      const fa = finishOrder.indexOf(a.teamIndex);
      const fb = finishOrder.indexOf(b.teamIndex);
      if (fa >= 0 && fb >= 0) return fa - fb;
      if (fa >= 0) return -1;
      if (fb >= 0) return 1;
      return b.score - a.score;
    });
  return {
    order,
    awards: [
      { label: '부스터왕, 최다 PR 머지', who: '7팀', detail: 'PR 19개 머지, 부스터를 가장 많이 썼어요', tone: 'blue' },
      { label: '커밋왕, 최다 커밋 파트', who: '11팀 개발 파트', detail: '61커밋으로 팀 주행 거리의 38%를 책임졌어요', tone: 'green' },
      { label: '불사조상, 최다 미끄러짐 극복', who: '3팀', detail: 'CI 실패 8번에도 2위로 완주', tone: 'orange' },
    ],
  };
})();

const TONE = {
  blue: { bg: '#E6EDFB', fg: '#1D47AB' },
  green: { bg: '#E7F4EE', fg: '#1E6B47' },
  orange: { bg: '#FDEDE4', fg: '#A63A0B' },
} as const;

const HEIGHTS: Record<number, number> = { 1: 170, 2: 125, 3: 90 };
const MEDAL_BG: Record<number, string> = { 1: '#F2C230', 2: '#C9CCD1', 3: '#C98B4E' };
const CONFETTI = ['#E8564A', '#F2C230', '#2E9D52', '#3A6FE0', '#C93BD6', '#FFFFFF'];

/** C. 포디움 시상식 */
export function PodiumScreen({ result = MOCK_RESULT, onReplay, onBackToRace, accent = color.accent }: { result?: PodiumResult; onReplay: () => void; onBackToRace: () => void; accent?: string }) {
  const mine = CONFIG.myTeam - 1;
  const goal = CONFIG.goal;

  return (
    <div style={{ position: 'relative', width: 1600, height: 900, background: color.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header title="커밋 레이스, 시상식" subtitle="해커톤 종료, 최종 결과">
        <button type="button" onClick={onBackToRace} style={btnOutline}>
          레이스 화면
        </button>
        <button type="button" onClick={onReplay} style={btnSolid}>
          출발부터 다시 보기
        </button>
      </Header>

      <div style={{ flexGrow: 1, minHeight: 0, padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ position: 'relative', height: 520, flexShrink: 0, background: color.field, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 64, background: color.stands, borderBottom: '6px solid #BDB8AA' }}>
            <div style={{ position: 'absolute', left: 24, right: 24, top: 14, height: 30, borderRadius: 6, background: `repeating-linear-gradient(to right, ${color.seat} 0 30px, ${color.stands} 30px 38px)` }} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: color.track, borderTop: '4px solid #FFFFFF' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 38, height: 3, background: '#FFFFFF', opacity: 0.8 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 78, height: 3, background: '#FFFFFF', opacity: 0.8 }} />

          <div style={{ position: 'absolute', left: 40, top: 92, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', color: '#1F5132' }}>COMMIT RACE</div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>축하합니다!</div>
          </div>

          <div style={{ position: 'absolute', left: '50%', bottom: 60, transform: 'translateX(-50%)', display: 'flex', alignItems: 'flex-end' }}>
            {[1, 0, 2].map((k) => {
              const t = result.order[k];
              const place = k + 1;
              const big = place === 1 ? 84 : 72;
              return (
                <div key={place} className="cr-rise" style={{ width: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: `${place === 1 ? 0.9 : place === 2 ? 0.5 : 0.1}s` }}>
                  <div className="cr-bounce" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, animationDelay: `${place * 0.2}s` }}>
                    {place === 1 && (
                      <svg width={56} height={36} viewBox="0 0 56 36" aria-hidden="true">
                        <path d="M4 32 L8 8 L20 20 L28 2 L36 20 L48 8 L52 32 Z" fill="#F2C230" stroke="#8A6A00" strokeWidth={2} strokeLinejoin="round" />
                        <circle cx={28} cy={2} r={3} fill="#E8564A" />
                      </svg>
                    )}
                    <div style={{ width: big, height: big, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: place === 1 ? 38 : 32, fontWeight: 900, color: '#FFFFFF', background: teamColor(t.teamIndex, mine, accent), border: `5px solid ${t.teamIndex === mine ? color.myTeamRing : '#FFFFFF'}`, boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }}>
                      {t.teamIndex + 1}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0 10px' }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{t.teamIndex + 1}팀</div>
                    <div style={{ fontSize: 13, color: '#1F3A28', fontWeight: 500 }}>{t.finishTime ?? `${t.score.toLocaleString()}점`}</div>
                  </div>
                  <div style={{ width: 230, height: HEIGHTS[place], background: '#FFFFFF', border: `3px solid ${color.ink}`, borderBottom: 'none', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', paddingTop: 18, boxShadow: 'inset 0 -12px 0 #ECEBE6' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: color.ink, border: `4px solid ${color.ink}`, background: MEDAL_BG[place] }}>{place}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {Array.from({ length: 40 }, (_, k) => (
            <div
              key={k}
              className="cr-conf"
              style={{
                position: 'absolute',
                top: -20,
                left: `${(k * 37) % 100}%`,
                width: 6 + (k % 3) * 3,
                height: 10 + (k % 4) * 3,
                borderRadius: 2,
                pointerEvents: 'none',
                background: CONFETTI[k % 6],
                animationDuration: `${3 + (k % 5) * 0.7}s`,
                animationDelay: `${((k * 0.23) % 4).toFixed(2)}s`,
              }}
            />
          ))}
        </div>

        <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', gap: 16 }}>
          <div style={{ flexGrow: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {result.awards.map((a) => (
              <div key={a.label} style={{ background: '#FFFFFF', border: `1px solid ${color.line}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ alignSelf: 'flex-start', fontSize: 12, fontWeight: 700, borderRadius: 4, padding: '2px 8px', background: TONE[a.tone].bg, color: TONE[a.tone].fg }}>{a.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{a.who}</div>
                <div style={{ fontSize: 13, color: '#3D3D3A', lineHeight: 1.5 }}>{a.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ width: 520, flexShrink: 0, background: color.ink, color: '#FFFFFF', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.08em' }}>FINAL RANKING, 4~15위</div>
            <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
              {result.order.slice(3).map((t, k) => {
                const isMine = t.teamIndex === mine;
                return (
                  <div key={t.teamIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', borderRadius: 6, background: isMine ? accent : color.inkRow }}>
                    <span style={{ width: 26, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: isMine ? '#FFFFFF' : '#B5B5AF' }}>{k + 4}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{t.teamIndex + 1}팀</span>
                    <span style={{ flexGrow: 1 }} />
                    <span style={{ fontSize: 12, color: '#C9C9C3', fontVariantNumeric: 'tabular-nums' }}>{Math.min(100, Math.round((t.score / goal) * 100))}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
