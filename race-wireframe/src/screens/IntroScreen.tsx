import { PENGUINS } from '../assets';
import { color } from '../theme';

/**
 * 첫 화면: 이 프로젝트가 왜 필요한지와 화면을 읽는 법을 설명한다.
 * 버튼을 눌러야 출발 화면으로 넘어간다. 고정 무대(Stage)를 쓰지 않아 휴대폰에서도 그대로 읽힌다.
 */
export function IntroScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const card = (title: string, body: string, tone: string) => (
    <div style={{ background: '#FFFFFF', border: `1.5px solid ${color.line}`, borderTop: `6px solid ${tone}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.6, color: '#3D3D3A' }}>{body}</div>
    </div>
  );
  const rule = (dot: string, name: string, desc: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '10px 12px' }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ fontSize: 14, color: '#3D3D3A' }}>{desc}</span>
    </div>
  );

  return (
    <div className="cr-in" style={{ minHeight: '100vh', background: color.bg, overflowX: 'hidden' }}>
      {/* 위: 출발 깃발 띠 */}
      <div style={{ height: 18, background: 'repeating-linear-gradient(90deg, #5B5FD6 0 22px, transparent 22px 34px)', opacity: 0.9 }} />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 40px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: '#1F4D2E' }}>허들링 클럽 해커톤 11조</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.05 }}>커밋 레이스</h1>
        <p style={{ margin: '12px 0 0', fontSize: 'clamp(16px, 2.4vw, 20px)', lineHeight: 1.6, maxWidth: 720 }}>
          커밋하면 펭귄이 달립니다. 15개 조의 GitHub 활동을 레이스 한 판으로 중계합니다.
        </p>

        {/* 트랙 위 펭귄 */}
        <div style={{ position: 'relative', marginTop: 22, borderRadius: 16, overflow: 'hidden', background: color.field }}>
          <div style={{ height: 'clamp(150px, 26vw, 220px)', background: 'repeating-linear-gradient(180deg, #C9604A 0 42px, #E9A08F 42px 45px)', marginTop: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 4% 10px' }}>
            {PENGUINS.map((src, k) => (
              <img key={src} src={src} alt="" draggable={false} className="cr-run" style={{ width: 'clamp(64px, 14vw, 140px)', height: 'auto', animationDelay: `${k * 0.07}s`, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.25))' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', left: 14, top: 10, fontSize: 12, fontWeight: 900, color: '#FFFFFF', background: color.ink, padding: '2px 10px', borderRadius: 4 }}>START</div>
        </div>

        {/* 왜 만들었나 */}
        <section style={{ marginTop: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>왜 만들었나</div>
          <p style={{ margin: '6px 0 0', fontSize: 'clamp(17px, 2.6vw, 22px)', fontWeight: 800, lineHeight: 1.55 }}>
            해커톤은 작업이 실시간으로 일어납니다. 그래서 평가위원이 중간에 각 조가 어디까지 왔는지 점검하기 어렵습니다.
          </p>
        </section>

        {/* 무엇을 하나 */}
        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>그래서 이 화면은</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {card('운영진 대시보드', '어느 조가 앞서는지, 어느 조가 멈춰 있는지 한눈에 봅니다. 조를 누르면 기획, 디자인, 개발, 문서 파트별 기록이 열립니다.', color.accent)}
            {card('참여자 현황판', '우리 조와 다른 조의 진행을 레이스로 보며 서로 자극을 받습니다. 큰 화면에 띄워 두면 행사장 전체가 같이 봅니다.', '#2E7D4F')}
          </div>
        </section>

        {/* 읽는 법 */}
        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>화면 읽는 법</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
            {rule('#2E7D4F', '커밋', '펭귄이 앞으로 달립니다')}
            {rule(color.accent, 'PR 머지', '부스터로 단숨에 치고 나갑니다')}
            {rule(color.slip, 'CI 실패', '바나나를 밟고 잠깐 미끄러집니다')}
            {rule(color.lead, '결승선', '먼저 도착한 순서로 시상합니다')}
          </div>
        </section>

        {/* 진행 버튼 */}
        <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button type="button" onClick={onStart} style={{ height: 56, padding: '0 28px', border: 'none', borderRadius: 12, background: color.ink, color: '#FFFFFF', fontSize: 18, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 0 #000' }}>
            레이스 시작하기
          </button>
          <button type="button" onClick={onSkip} style={{ height: 56, padding: '0 18px', border: `1px solid ${color.line}`, borderRadius: 12, background: '#FFFFFF', color: color.text, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            출발 건너뛰고 바로 중계 보기
          </button>
        </div>
      </main>
    </div>
  );
}
