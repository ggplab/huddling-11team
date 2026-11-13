// 메뉴에 보일 이름과 순서. 숫자가 작을수록 앞에 온다.
export const title = '홈'
export const order = 0

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">미니 해커톤</h1>
      <p className="text-muted">주제 한 문장을 여기에 적습니다.</p>
      <a
        href="#/example"
        className="inline-block rounded-card bg-brand px-5 py-3 font-medium text-white"
      >
        예시 화면 보기
      </a>
    </section>
  )
}
