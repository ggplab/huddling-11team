import { Link } from 'react-router-dom'

export const title = '홈'
export const order = 0

const PROTOTYPES = [
  {
    to: '/skyline',
    name: '시안 A 스카이라인',
    text: '조마다 도시 하나. 네 구역에 건물이 올라가고, 충돌이 나면 건물이 낮아집니다.',
  },
  {
    to: '/blocks',
    name: '시안 B 블록 지도',
    text: '위에서 내려다본 도시. 구역마다 땅 16칸이 커밋으로 채워집니다.',
  },
  {
    to: '/board',
    name: '시안 C 관제판',
    text: '순위와 최근 속도, 충돌을 한 표로. 지금 가 볼 조를 맨 위에 알려 줍니다.',
  },
]

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-brand">허들링 11조</p>
        <h1 className="text-4xl font-bold">커밋시티</h1>
        <p className="text-lg">커밋으로 짓는 도시. 해커톤 운영진이 조별 진행 상황을 한눈에 봅니다.</p>
        <p className="text-muted">
          조가 커밋을 올릴 때마다 개발, 디자인, 기획, 문서 네 구역에 건물이 올라갑니다. 운영진은 어느 조가 멈췄는지,
          어느 조가 충돌 중인지 보고 먼저 찾아갈 조를 고릅니다.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">시안 세 개</h2>
        <p className="mb-4 text-sm text-muted">
          세 시안은 같은 예시 데이터와 같은 점수 규칙으로 돕니다. 보여 주는 방식만 다릅니다. 하나를 고르거나 섞어서
          다듬습니다.
        </p>
        <ul className="grid gap-4 sm:grid-cols-3">
          {PROTOTYPES.map((p) => (
            <li key={p.to}>
              <Link to={p.to} className="block h-full rounded-card border border-line bg-surface p-5 hover:border-brand">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand">열어 보기</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card bg-brand-soft p-5 text-sm">
        <p className="font-semibold">시연용 예시 데이터</p>
        <p className="mt-1">
          가상의 네 조(새벽시, 파도시, 숲속시, 별빛시)가 3시간 동안 올린 커밋을 재생합니다. 실제 조의 기록이 아닙니다.
          재생 속도는 1배, 2배, 5배, 10배로 바꿀 수 있습니다.
        </p>
      </div>
    </section>
  )
}
