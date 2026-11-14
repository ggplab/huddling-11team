// 조별 레포 15개의 가벼운 현재 상태를 돌려주는 Vercel 서버 함수.
// 레포마다 GitHub 호출 2번(커밋 목록, PR 목록)만 쓴다. 커밋 상세는 부르지 않는다(실행 시간 제한).
// 토큰은 GITHUB_TOKEN 환경 변수에서만 읽는다. 없거나 GitHub가 막히면 정적 정리본으로 물러나라고 알린다.

const ORG = 'huddlingclub'
const TEAM_COUNT = 15
const repoName = (n) => `huddling-${n}team`
const FALLBACK = '/data/snapshot.json'
const RETRIES = 2
const TIMEOUT_MS = 8000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function gh(path, token) {
  let last
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const res = await fetch(`https://api.github.com/${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'commitcity-live',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (res.status === 409) return [] // 빈 레포
      if (res.status >= 500 || res.status === 429) throw new Error(`github ${res.status}`)
      if (!res.ok) {
        const err = new Error(`github ${res.status}`)
        err.fatal = true // 401, 403, 404는 다시 해도 같다
        throw err
      }
      return await res.json()
    } catch (err) {
      last = err
      if (err.fatal) break
      if (attempt < RETRIES) await sleep(400 * (attempt + 1))
    }
  }
  throw last
}

async function oneTeam(n, token) {
  const repo = repoName(n)
  const base = `repos/${ORG}/${repo}`
  try {
    const [commits, pulls] = await Promise.all([
      gh(`${base}/commits?per_page=100`, token),
      gh(`${base}/pulls?state=all&per_page=100`, token),
    ])
    const last = commits[0]
    return {
      id: String(n),
      repo,
      commits: commits.length,
      lastCommitAt: last?.commit?.author?.date ?? null,
      lastCommitMessage: (last?.commit?.message ?? '').split('\n')[0].slice(0, 80),
      prs: {
        total: pulls.length,
        merged: pulls.filter((p) => p.merged_at).length,
        open: pulls.filter((p) => p.state === 'open').length,
      },
    }
  } catch {
    return { id: String(n), repo, error: true }
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  const send = (body) => res.status(200).send(JSON.stringify(body))

  const token = process.env.GITHUB_TOKEN
  if (!token) return send({ ok: false, reason: 'no-token', fallback: FALLBACK })

  const ids = Array.from({ length: TEAM_COUNT }, (_, i) => i + 1)
  const teams = await Promise.all(ids.map((n) => oneTeam(n, token)))
  if (teams.every((t) => t.error)) return send({ ok: false, reason: 'github-error', fallback: FALLBACK })
  return send({ ok: true, at: new Date().toISOString(), teams })
}
