import { PENGUINS } from '../assets';
import { color } from '../theme';

/**
 * 첫 화면: 이 프로젝트가 왜 필요한지와 화면을 읽는 법을 설명한다.
 * 버튼을 눌러야 출발 화면으로 넘어간다. 고정 무대(Stage)를 쓰지 않아 휴대폰에서도 그대로 읽힌다.
 */
const PROBLEM: [string, string][] = [
  ['누가', '해커톤 주최자가'],
  ['언제', '해커톤 참여 시간에'],
  ['무엇을 하려고', '진행 상황의 진척을 확인해서 사전 인터뷰할 조를 고르려고'],
  ['서비스 이름', '커밋시티'],
  ['핵심 기능 (버튼을 누르면 무엇이 나온다)', '대시보드가 나온다. 조별 진척 사항이 나온다.'],
  ['첫 화면에 보이는 것 3가지', '전체 진척, 개별 진척(개발, 디자인, 문서, 기획), 조별 이름'],
];

export function IntroScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const card = (title: string, body: string, tone: string) => (
    <div style={{ background: '#FFFFFF', border: `1.5px solid ${color.line}`, borderTop: `6px solid ${tone}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.6, color: '#3D3D3A' }}>{body}</div>
    </div>
  );
  const term = (dot: string, name: string, tag: string, desc: string) => (
    <div style={{ background: '#FFFFFF', border: `1.5px solid ${color.line}`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: dot, flexShrink: 0 }} />
        <span style={{ fontSize: 16, fontWeight: 900 }}>{name}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', background: dot, borderRadius: 5, padding: '1px 7px' }}>{tag}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, color: '#3D3D3A' }}>{desc}</div>
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

        {/* 왜 만들었나: 해커톤 현장 사진과 문제 정의 */}
        <section style={{ marginTop: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>왜 만들었나</div>
          <figure style={{ margin: '8px 0 0', borderRadius: 14, overflow: 'hidden', background: '#000' }}>
            <img src="/images/intro/google-hackathon.jpg" alt="Google DeepMind AI 해커톤 발표 현장" style={{ display: 'block', width: '100%', height: 'auto' }} />
            <figcaption style={{ padding: '8px 12px', fontSize: 12, color: '#D9D9D4', background: color.ink }}>Google DeepMind AI 해커톤 발표 현장 (2026.10.16, Google for Startups Campus Seoul)</figcaption>
          </figure>
          <p style={{ margin: '14px 0 0', fontSize: 'clamp(17px, 2.6vw, 22px)', fontWeight: 800, lineHeight: 1.55 }}>
            해커톤은 작업이 실시간으로 일어납니다. 평가위원은 중간에 각 조가 어디까지 왔는지 보기 어렵고, 그래서 평가 시간이 뒤로 밀립니다.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 'clamp(15px, 2.2vw, 18px)', lineHeight: 1.6 }}>
            평가가 늦어지는 것을 막고, 운영진과 참여자가 &ldquo;우리가 잘하고 있나&rdquo;를 보며 서로 독려하도록 대시보드를 만듭니다.
          </p>
        </section>

        {/* 문제 정의 표 */}
        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>문제 정의</div>
          <div style={{ marginTop: 8, background: '#FFFFFF', border: `1.5px solid ${color.line}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: color.ink, color: '#FFFFFF' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', width: '34%' }}>빈칸</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px' }}>우리 조의 답</th>
                </tr>
              </thead>
              <tbody>
                {PROBLEM.map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 ? '#FAFAF8' : '#FFFFFF', borderTop: `1px solid ${color.lineSoft}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 800, verticalAlign: 'top' }}>{k}</th>
                    <td style={{ padding: '10px 14px', lineHeight: 1.55 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 무엇을 하나 */}
        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>그래서 이 화면은</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {card('운영진 대시보드', '어느 조가 앞서는지, 어느 조가 멈춰 있는지 한눈에 봅니다. 사전 인터뷰할 조를 고르는 근거가 됩니다.', color.accent)}
            {card('참여자 현황판', '우리 조와 다른 조의 진행을 레이스로 보며 서로 자극을 받습니다. 큰 화면에 띄워 두면 행사장 전체가 같이 봅니다.', '#2E7D4F')}
          </div>
        </section>

        {/* 용어 정의 */}
        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>용어 정의</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {term('#2E7D4F', '커밋', '전진', '조의 GitHub 저장소에 올라간 커밋 1건. 기본 10점에 바뀐 줄 수 × 0.1점을 더합니다(보너스는 최대 20점). 3줄 미만 커밋은 0점입니다.')}
            {term(color.accent, 'PR 머지', '부스터', '풀 리퀘스트(PR)가 main에 합쳐진 1건. 한 번에 +30점을 얻습니다.')}
            {term(color.slip, 'CI 실패', '미끄러짐', '자동 검사(CI)가 실패한 1건. 5점을 잃습니다. 지금 수집본에는 CI 기록이 없어, 충돌난 PR과 충돌 해결 커밋으로 대신 셉니다.')}
            {term(color.lead, '결승선', '1,600점', '점수가 1,600점에 닿으면 완주입니다. 먼저 닿은 순서로 시상합니다.')}
          </div>
        </section>

        {/* 트랙 지표를 만든 방법 */}
        <section style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: color.textMuted }}>트랙 지표를 만든 방법</div>
          <ol style={{ margin: '8px 0 0', padding: '16px 20px 16px 38px', background: '#FFFFFF', border: `1.5px solid ${color.line}`, borderRadius: 14, fontSize: 15, lineHeight: 1.7 }}>
            <li><b>점수가 곧 거리입니다.</b> 조의 점수를 결승선 1,600점으로 나눈 비율만큼 S자 트랙을 나아갑니다. 50%면 트랙 한가운데입니다.</li>
            <li><b>점수 = 커밋 점수 + PR 머지 × 30 - CI 실패 × 5.</b> 기획서의 점수 표를 그대로 옮긴 규칙입니다.</li>
            <li><b>도배 방지 규칙도 정해 두었습니다.</b> 한 사람이 10분 안에 올린 커밋은 3개까지만 세고, 잠금 파일(package-lock 등), 빌드 결과물, 이미지 파일은 줄 수에서 뺍니다. GitHub 실시간 연동을 붙일 때 적용하며, 지금 화면에는 아직 적용 전입니다.</li>
            <li><b>파트별 기록.</b> 커밋이 바꾼 파일의 경로와 확장자로 기획, 디자인, 개발, 문서 파트를 나눕니다. 파트 커밋이 쌓이면 펭귄 레벨이 오릅니다(2건, 5건, 10건, 20건에서 한 단계씩).</li>
            <li><b>실제 기록을 출발점으로.</b> GitHub에서 모은 기록으로 조마다 커밋 × 10 + PR 머지 × 30 - 충돌 × 10을 계산합니다. 실제 1위를 1,250점 자리에 두고 나머지 조는 1위 대비 비율로 놓습니다. 이 값이 출발 위치의 70%이고, 30%는 시뮬레이션 값입니다. 그 뒤의 진행은 시연용 시뮬레이션이 이어 갑니다.</li>
          </ol>
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
