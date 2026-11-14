#!/usr/bin/env node
// 조별 레포의 커밋과 PR을 GitHub API에서 읽어 원본을 저장하고, 화면이 쓰는 정리본을 만든다.
//
// 사용법
//   node scripts/collect.mjs --raw <원본 저장 폴더> --out public/data/snapshot.json
//
// 인증
//   GITHUB_TOKEN 환경 변수가 있으면 그 토큰으로 API를 부른다(서버, CI용).
//   없으면 이 컴퓨터의 gh CLI 로그인으로 부른다(로컬용).
//
// 원본에는 커밋 작성자의 이메일이 들어 있다. 원본 폴더는 레포 밖에 두고 커밋하지 않는다.
// 정리본에는 이메일을 넣지 않는다.
import { execFile } from 'node:child_process'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { classify, summarize } from './classify.mjs'

const run = promisify(execFile)
const ORG = process.env.COLLECT_ORG ?? 'huddlingclub'
const REPO_RE = /^huddling-(\d+)team$/
const TEAM_MIN = Number(process.env.COLLECT_TEAM_MIN ?? 1)
const TEAM_MAX = Number(process.env.COLLECT_TEAM_MAX ?? 15)
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (cur.startsWith('--') ? [...acc, [cur.slice(2), all[i + 1]]] : acc), []),
)
const RAW = args.raw
const OUT = args.out ?? 'public/data/snapshot.json'
let calls = 0

// 네트워크가 끊겨도 멈추지 않게 여섯 번까지 다시 부른다. 간격은 2초에서 시작해 두 배씩, 최대 20초.
// 404와 409(빈 레포)처럼 다시 불러도 같은 답이 오는 오류는 바로 던진다.
async function api(path) {
  let lastError
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await apiOnce(path)
    } catch (err) {
      lastError = err
      if (/\b(404|422|451)\b|HTTP 40[4]/.test(String(err.stderr ?? err.message ?? ''))) throw err
      await new Promise((resolve) => setTimeout(resolve, Math.min(20000, 2000 * 2 ** attempt)))
    }
  }
  throw lastError
}

async function apiOnce(path) {
  calls += 1
  if (process.env.GITHUB_TOKEN) {
    const res = await fetch(`https://api.github.com/${path}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (res.status === 409) return [] // 빈 레포
    if (!res.ok) throw new Error(`${res.status} ${path}`)
    return res.json()
  }
  try {
    const { stdout } = await run('gh', ['api', path], { maxBuffer: 64 * 1024 * 1024 })
    return JSON.parse(stdout)
  } catch (err) {
    if (String(err.stdout ?? err.stderr ?? err).includes('Git Repository is empty')) return []
    throw err
  }
}

async function paged(path) {
  const out = []
  for (let page = 1; page < 20; page += 1) {
    const sep = path.includes('?') ? '&' : '?'
    const rows = await api(`${path}${sep}per_page=100&page=${page}`)
    if (!Array.isArray(rows)) break
    out.push(...rows)
    if (rows.length < 100) break
  }
  return out
}

async function pool(items, size, fn) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next
        next += 1
        out[i] = await fn(items[i], i)
      }
    }),
  )
  return out
}

async function save(rel, data) {
  if (!RAW) return
  const file = join(RAW, rel)
  await mkdir(dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  await writeFile(tmp, JSON.stringify(data, null, 1))
  await rename(tmp, file) // 도중에 죽어도 반쪽 파일이 남지 않게 한다
}

// 원본 폴더에 이미 받아 둔 파일이면 읽어 오고, 없거나 깨졌으면 null.
async function cached(rel) {
  if (!RAW) return null
  try {
    return JSON.parse(await readFile(join(RAW, rel), 'utf8'))
  } catch {
    return null
  }
}

async function collectRepo(repo) {
  const base = `repos/${ORG}/${repo.name}`
  const branches = await paged(`${base}/branches`)
  await save(`${repo.name}/branches.json`, branches)

  const bySha = new Map()
  for (const branch of branches) {
    const rows = await paged(`${base}/commits?sha=${encodeURIComponent(branch.name)}`)
    for (const row of rows) {
      const hit = bySha.get(row.sha) ?? { ...row, branches: [] }
      hit.branches.push(branch.name)
      bySha.set(row.sha, hit)
    }
  }
  const commits = [...bySha.values()]
  await save(`${repo.name}/commits.json`, commits)

  const details = await pool(commits, 3, async (c) => {
    const rel = `${repo.name}/commit/${c.sha}.json`
    const hit = await cached(rel)
    if (hit) return hit
    const detail = await api(`${base}/commits/${c.sha}`)
    await save(rel, detail)
    return detail
  })

  const pullList = await paged(`${base}/pulls?state=all`)
  const pulls = await pool(pullList, 2, async (p) => {
    const rel = `${repo.name}/pull/${p.number}.json`
    const hit = await cached(rel)
    if (hit?.detail && hit.detail.state !== 'open') return hit // 열린 PR은 상태가 바뀌므로 다시 받는다
    const detail = await api(`${base}/pulls/${p.number}`)
    const files = await paged(`${base}/pulls/${p.number}/files`)
    await save(rel, { detail, files })
    return { detail, files }
  })
  await save(`${repo.name}/pulls.json`, pullList)

  return { repo, branches, commits, details, pulls }
}

function toEvents(team, { commits, details, pulls }) {
  const events = []
  commits.forEach((c, i) => {
    const d = details[i]
    const message = (c.commit?.message ?? '').split('\n')[0].slice(0, 80)
    const author = c.author?.login ?? c.commit?.author?.name ?? '알 수 없음'
    const at = c.commit?.author?.date
    const isMerge = (c.parents?.length ?? 0) > 1
    const conflict = /conflict|충돌/i.test(c.commit?.message ?? '')
    const sum = summarize(d?.files ?? [])
    if (conflict) {
      events.push({ at, team, type: 'conflict', kind: sum.top ?? 'dev', weight: 1, lines: sum.total, author, message, ref: c.sha.slice(0, 7) })
      return
    }
    if (isMerge) return // PR 머지는 아래 PR 이벤트로 센다
    for (const [kind, lines] of Object.entries(sum.byKind)) {
      if (lines === 0 && sum.total > 0) continue
      events.push({
        at,
        team,
        type: 'commit',
        kind,
        weight: lines <= 20 ? 1 : lines <= 150 ? 2 : 3,
        lines,
        author,
        message,
        ref: c.sha.slice(0, 7),
      })
    }
  })
  pulls.forEach(({ detail, files }) => {
    const sum = summarize(files)
    const common = {
      team,
      kind: sum.top ?? 'dev',
      weight: sum.total <= 20 ? 1 : sum.total <= 150 ? 2 : 3,
      lines: sum.total,
      author: detail.user?.login ?? '알 수 없음',
      message: (detail.title ?? '').slice(0, 80),
      ref: `PR #${detail.number}`,
    }
    if (detail.merged_at) events.push({ at: detail.merged_at, type: 'merge', ...common })
    if (detail.state === 'open' && detail.mergeable_state === 'dirty')
      events.push({ at: detail.updated_at, type: 'conflict', ...common })
  })
  return events.filter((e) => e.at)
}

function teamSummary(id, repo, data, events) {
  const mine = events.filter((e) => e.team === id)
  const lines = { dev: 0, design: 0, plan: 0, docs: 0 }
  mine.filter((e) => e.type === 'commit').forEach((e) => {
    lines[e.kind] += e.lines
  })
  const times = mine.map((e) => e.at).sort()
  return {
    id,
    repo: repo.name,
    commits: data.commits.filter((c) => (c.parents?.length ?? 0) <= 1).length,
    branches: data.branches.length,
    prs: {
      total: data.pulls.length,
      merged: data.pulls.filter((p) => p.detail.merged_at).length,
      open: data.pulls.filter((p) => p.detail.state === 'open').length,
      conflicting: data.pulls.filter((p) => p.detail.state === 'open' && p.detail.mergeable_state === 'dirty').length,
    },
    authors: [...new Set(mine.map((e) => e.author))].length,
    lines,
    firstAt: times[0] ?? null,
    lastAt: times[times.length - 1] ?? null,
  }
}

// 대체 경로: 레포를 bare clone해서 git log로 커밋과 파일별 줄 수를 읽는다. PR은 받을 수 없다.
async function collectViaGit(repo) {
  const dir = join(RAW ?? process.cwd(), 'git', `${repo.name}.git`)
  await mkdir(dirname(dir), { recursive: true })
  let fresh = true
  try {
    await readFile(join(dir, 'HEAD'))
    fresh = false
  } catch {}
  if (fresh) await run('git', ['clone', '--bare', '--quiet', `https://github.com/${ORG}/${repo.name}.git`, dir], { timeout: 300000 })
  else await run('git', ['--git-dir', dir, 'fetch', '--quiet', 'origin', '+refs/heads/*:refs/heads/*'], { timeout: 300000 }).catch(() => {})
  const { stdout } = await run(
    'git',
    ['--git-dir', dir, 'log', '--all', '--numstat', '--no-renames', '--format=%x1e%H%x1f%P%x1f%an%x1f%aI%x1f%B%x1f'],
    { maxBuffer: 256 * 1024 * 1024 },
  ).catch((err) => {
    if (/does not have any commits|bad default revision/.test(String(err.stderr))) return { stdout: '' }
    throw err
  })
  const commits = []
  const details = []
  for (const block of stdout.split('\x1e').slice(1)) {
    const [sha, parents, name, date, message, stat = ''] = block.split('\x1f')
    const files = []
    for (const line of stat.split('\n')) {
      const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/)
      if (m) files.push({ filename: m[3], additions: m[1] === '-' ? 0 : Number(m[1]), deletions: m[2] === '-' ? 0 : Number(m[2]) })
    }
    commits.push({
      sha,
      parents: parents.split(' ').filter(Boolean).map((p) => ({ sha: p })),
      commit: { message: message.trim(), author: { name, date: new Date(date).toISOString().replace('.000Z', 'Z') } },
      branches: [],
    })
    details.push({ files })
  }
  const { stdout: br } = await run('git', ['--git-dir', dir, 'for-each-ref', '--format=%(refname:short)', 'refs/heads'])
  const branches = br.split('\n').filter(Boolean).map((name) => ({ name }))
  return { repo, branches, commits, details, pulls: [], source: 'git' }
}

const repos = (await paged(`orgs/${ORG}/repos`))
  .filter((r) => {
    const m = r.name.match(REPO_RE)
    return m && Number(m[1]) >= TEAM_MIN && Number(m[1]) <= TEAM_MAX
  })
  .sort((a, b) => Number(a.name.match(REPO_RE)[1]) - Number(b.name.match(REPO_RE)[1]))
await save('repos.json', repos)

// 레포 하나가 실패해도 나머지를 계속한다. 실패한 레포는 한 번 더 돈다(이미 받은 것은 건너뛰므로 싸다).
const results = new Map()
const failures = new Map()
const FORCE_GIT = new Set((process.env.COLLECT_FORCE_GIT ?? '').split(',').filter(Boolean)) // 대체 경로 시험용
for (let pass = 1; pass <= 2; pass += 1) {
  const todo = repos.filter((r) => !results.has(r.name) && !FORCE_GIT.has(r.name))
  if (!todo.length) break
  await pool(todo, 2, async (repo) => {
    try {
      results.set(repo.name, await collectRepo(repo))
      failures.delete(repo.name)
    } catch (err) {
      failures.set(repo.name, String(err.stderr ?? err.message ?? err).trim().split('\n')[0].slice(0, 200))
      console.error(`[${pass}차] ${repo.name} 실패: ${failures.get(repo.name)}`)
    }
  })
}
for (const repo of repos.filter((r) => !results.has(r.name))) {
  if (FORCE_GIT.has(repo.name)) failures.set(repo.name, '강제 시험')
  try {
    console.error(`${repo.name}: git clone 대체 경로`)
    results.set(repo.name, await collectViaGit(repo))
  } catch (err) {
    failures.set(repo.name, `${failures.get(repo.name)} / git: ${String(err.stderr ?? err.message ?? err).trim().split('\n')[0].slice(0, 120)}`)
  }
}

const events = []
const teams = []
// 조 번호 범위 안인데 조직에 레포가 없는 조는 빈 칸으로 남기지 않고 incomplete로 표시한다.
for (let n = TEAM_MIN; n <= TEAM_MAX; n += 1) {
  if (repos.some((r) => Number(r.name.match(REPO_RE)[1]) === n)) continue
  teams.push({ id: String(n), repo: `huddling-${n}team`, incomplete: true, reason: '조직에 이 이름의 레포가 없다', commits: 0, branches: 0, prs: { total: 0, merged: 0, open: 0, conflicting: 0 }, authors: 0, lines: { dev: 0, design: 0, plan: 0, docs: 0 }, firstAt: null, lastAt: null })
}
repos.forEach((repo) => {
  const id = repo.name.match(REPO_RE)[1]
  const data = results.get(repo.name)
  if (!data) {
    teams.push({ id, repo: repo.name, incomplete: true, reason: failures.get(repo.name) ?? '수집 실패', commits: 0, branches: 0, prs: { total: 0, merged: 0, open: 0, conflicting: 0 }, authors: 0, lines: { dev: 0, design: 0, plan: 0, docs: 0 }, firstAt: null, lastAt: null })
    return
  }
  const mine = toEvents(id, data)
  events.push(...mine)
  const t = teamSummary(id, data.repo, data, mine)
  if (data.source === 'git') Object.assign(t, { incomplete: false, source: 'git', note: 'API 실패로 git clone에서 읽었다. PR 정보는 없다.', prsUnavailable: true })
  else t.incomplete = false
  teams.push(t)
})
teams.sort((a, b) => Number(a.id) - Number(b.id))
events.sort((a, b) => a.at.localeCompare(b.at))

const snapshot = {
  meta: {
    collectedAt: new Date().toISOString(),
    org: ORG,
    source: 'GitHub REST API (공개 레포의 커밋과 PR)',
    eventDay: '2026-11-14',
    notes: [
      '작성자는 GitHub 아이디 또는 커밋에 적힌 이름이다. 이메일은 넣지 않았다.',
      '구역(kind)은 바뀐 파일의 경로와 확장자로 나눴다. 규칙은 scripts/classify.mjs에 있다.',
      '충돌은 두 가지만 잡는다: 커밋 메시지에 conflict 또는 충돌이 있는 커밋, 지금 열려 있고 병합할 수 없는 PR. 이미 풀린 충돌의 전부를 알 수는 없다.',
      '`source: git`인 조는 GitHub API가 막혀 git clone으로 읽었다. 이 조의 PR 수는 비어 있다(prsUnavailable).',
      '`incomplete: true`인 조는 수집에 실패해 이벤트가 없다. 사유는 reason에 있다.',
      '병합 커밋(부모가 둘)은 커밋 이벤트에서 빼고, 머지된 PR을 merge 이벤트로 센다.',
    ],
  },
  teams,
  events: events.map((e, i) => ({ id: i + 1, ...e })),
}
await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(snapshot, null, 1))
console.log(`레포 ${repos.length}개, 이벤트 ${events.length}건, API 호출 ${calls}번, 저장 ${OUT}`)
teams.forEach((t) => console.log(`${t.id.padStart(2)}조${t.incomplete ? ' [incomplete]' : t.source ? ' [git]' : ''} 커밋 ${t.commits} PR ${t.prs.total}(머지 ${t.prs.merged}, 충돌 ${t.prs.conflicting}) 작성자 ${t.authors} 줄수 ${JSON.stringify(t.lines)}`))
