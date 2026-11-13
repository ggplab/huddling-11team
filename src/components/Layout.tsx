// 공용 파일: 개발 담당만 고친다.
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type Props = {
  pages: { path: string; title: string }[]
  children: ReactNode
}

export default function Layout({ pages, children }: Props) {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <header className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          {pages.map((p) => (
            <NavLink
              key={p.path}
              to={p.path}
              end
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft'
                }`
              }
            >
              {p.title}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
