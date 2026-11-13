# 디자이너가 Claude Code에 붙여 쓰는 도구

확인일 2026-11-14. 명령과 한도는 각 도구의 공식 문서에서 읽었다. 출처는 맨 아래에 있다.

## 한눈에

| 도구 | 하는 일 | 비용 | 설치 |
|---|---|---|---|
| Figma MCP(공식) | 피그마 프레임 링크를 주면 디자인 값을 읽어 코드로 옮긴다. 만든 웹 화면을 피그마 레이어로 되돌려 보낸다. FigJam 도식을 그린다 | 무료 좌석은 월 20회. 유료 좌석은 아래 표 | `claude plugin install figma@claude-plugins-official` |
| Playwright MCP | Claude가 브라우저를 열어 만든 화면을 직접 눌러 보고 확인한다 | 무료(Apache-2.0) | `claude mcp add playwright npx @playwright/mcp@latest` |
| Chrome DevTools MCP | 열려 있는 크롬에서 콘솔 오류, 네트워크, 성능을 본다 | 무료(Apache-2.0) | Claude Code 안에서 `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp` 다음 `/plugin install chrome-devtools-mcp@chrome-devtools-plugins` |
| shadcn MCP | 버튼, 카드, 표 같은 완성 부품을 찾아 레포에 설치한다 | 문서에 요금 언급 없음(오픈소스) | `npx shadcn@latest mcp init --client claude` |
| frontend-design 플러그인 | 흔한 AI 느낌을 피한 화면을 만들도록 Claude에 디자인 지침을 싣는다 | 무료 | 설치 명령 미확인. Figma와 같은 꼴이면 `claude plugin install frontend-design@claude-plugins-official` |

## Figma MCP 자세히

플러그인 설치가 안 되면 서버만 붙인다.

```
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

그다음 Claude Code에서 `/mcp` 를 치고 figma 를 골라 Authenticate 를 누른다. 브라우저에서 Allow access 를 누르면 끝난다.

### 읽기 한도 (피그마에서 값을 읽는 도구에 적용)

| 좌석 | Starter(무료) | Professional | Organization |
|---|---|---|---|
| View, Collab | 월 20회 | 월 20회 | 월 20회 |
| Full, Dev | (Starter는 월 20회) | 하루 200회, 분당 10회 | 하루 200회, 분당 15회 |

- 교육 요금제는 Professional의 Full, Dev 좌석과 같은 한도다.
- 한도에서 빠지는 도구가 있다: `generate_figma_design`(웹 화면을 피그마로), `create_new_file`, `whoami`, `add_code_connect_map`.
- 어느 팀의 좌석이 기준이 되는지(파일이 있는 팀인지, 내 계정인지)는 미확인이다. `whoami` 도구로 내 요금제와 좌석을 먼저 본다.

### 자주 쓰는 도구

| 도구 | 하는 일 |
|---|---|
| `get_design_context` | 프레임 링크의 디자인 값과 코드를 가져온다 |
| `get_screenshot` | 선택한 프레임을 그림으로 가져온다 |
| `get_variable_defs` | 색, 글꼴 같은 변수와 스타일을 가져온다 |
| `generate_figma_design` | 돌아가는 웹 화면을 피그마 레이어로 만든다 |
| `generate_diagram` | 설명이나 Mermaid 문법으로 FigJam 도식을 그린다 |
| `use_figma` | 피그마 파일 안의 내용을 만들고 고친다 |

### 좌석 가격 (figma.com/pricing 표기)

| 요금제 | Full | Dev | Collab |
|---|---|---|---|
| Professional | 월 16달러 | 월 12달러 | 월 3달러 |
| Organization(연 결제) | 월 55달러 | 월 25달러 | 월 5달러 |

Professional 가격이 월 결제 기준인지 연 결제 기준인지는 미확인이다. 포럼 글에는 Full 좌석이 월 결제 20달러라는 답이 있다.

## 결제 판단

| 상황 | 판단 |
|---|---|
| 디자이너가 이미 유료 Full 좌석을 쓴다 | 결제할 것이 없다. 하루 200회면 2시간에 충분하다 |
| 디자이너가 무료 Starter다 | 월 20회다. 화면 3~4개를 읽으면 금방 닳는다. 프레임을 통째로 한 번에 읽게 하고, 모자라면 그때 Professional Full 좌석 1개를 결제한다 |
| 개발 담당이 피그마를 직접 읽어야 한다 | 무료 20회로 시작한다. 모자라면 Dev 좌석(월 12달러)을 결제한다 |
| 나머지 도구 | 결제할 것이 없다 |

## 개발 담당이 맡는 비용

| 항목 | 메모 |
|---|---|
| 배포(Cloudflare Pages) | 정적 화면만 올린다 |
| 서버와 DB | 주제가 요구할 때만 붙인다 |
| AI 호출 키 | 결과물이 AI를 부를 때만 필요하다. 개발 담당 계정의 키를 서버 환경 변수에 넣고 월 한도를 건다 |

## 출처

- Figma MCP 설치: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Figma MCP 한도: https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
- Figma MCP 도구 목록: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- Figma 가격: https://www.figma.com/pricing/
- Figma 월 결제 가격 포럼 답변: https://forum.figma.com/report-a-problem-6/full-seat-offers-at-16-but-i-am-being-charged-20-57530
- Playwright MCP: https://github.com/microsoft/playwright-mcp
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- shadcn MCP: https://ui.shadcn.com/docs/mcp
- frontend-design 플러그인: https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design
