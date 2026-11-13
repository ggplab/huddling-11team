// 예시 화면. 이 파일을 복사해 자기 화면 파일을 만든다. (파일 이름이 주소가 된다)
import { items } from '../data/mock'

export const title = '예시'
export const order = 1

export default function Example() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">예시 화면</h1>
      <ul className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-card border border-line bg-surface p-5">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
