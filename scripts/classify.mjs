// 바뀐 파일을 네 구역(개발, 디자인, 기획, 문서)으로 나누는 규칙. 수집기와 서버 함수가 함께 쓴다.
const IGNORE = /(^|\/)(node_modules|dist|build|\.next|\.vercel)\/|(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$|\.map$|\.DS_Store$/
const PLAN = /(^|\/)[^/]*(plan|prd|spec|brief|기획|요구사항)[^/]*\.(md|mdx|txt)$/i
const DOCS = /\.(md|mdx|txt)$|^docs\/|(^|\/)LICENSE$/i
const DESIGN = /\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|fig)$|(^|\/)(design|assets|images|img|fonts)\/|tailwind\.config/i

export function classify(filename) {
  if (IGNORE.test(filename)) return null
  if (PLAN.test(filename)) return 'plan'
  if (DOCS.test(filename)) return 'docs'
  if (DESIGN.test(filename)) return 'design'
  return 'dev'
}

// 파일 목록을 받아 구역별 바뀐 줄 수와 가장 큰 구역을 돌려준다.
export function summarize(files) {
  const byKind = {}
  let total = 0
  for (const f of files) {
    const kind = classify(f.filename)
    if (!kind) continue
    const lines = (f.additions ?? 0) + (f.deletions ?? 0) || 1 // 이미지처럼 줄 수가 없는 파일은 1로 센다
    byKind[kind] = (byKind[kind] ?? 0) + lines
    total += lines
  }
  const top = Object.entries(byKind).sort((a, b) => b[1] - a[1])[0]?.[0]
  return { byKind, total, top }
}
