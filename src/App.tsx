// 공용 파일: 개발 담당만 고친다.
// src/pages/ 에 파일을 넣으면 주소가 자동으로 생긴다. (Home.tsx 는 "/", Search.tsx 는 "/search")
import type { ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

type PageModule = { default: ComponentType; title?: string; order?: number }

const modules = import.meta.glob<PageModule>('./pages/*.tsx', { eager: true })

export const pages = Object.entries(modules)
  .map(([file, mod]) => {
    const name = file.match(/\/([^/]+)\.tsx$/)![1]
    return {
      name,
      path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
      title: mod.title ?? name,
      order: mod.order ?? 99,
      Component: mod.default,
    }
  })
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

export default function App() {
  return (
    <Layout pages={pages}>
      <Routes>
        {pages.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<p className="text-muted">없는 화면입니다.</p>} />
      </Routes>
    </Layout>
  )
}
