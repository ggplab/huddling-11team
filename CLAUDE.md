# CLAUDE.md

2시간짜리 미니 해커톤 레포다. 팀원 대부분은 UX/UI 디자이너이고 git과 코딩 에이전트가 처음이다.
사람용 규칙은 `CONTRIBUTING.md`에 있다.

## 주제

(주제 한 문장을 여기에 적는다)

## 스택 (바꾸지 않는다)

Vite + React + TypeScript + Tailwind CSS v4 + React Router(HashRouter). 배포는 조장이 Vercel로 한다.

- 새 의존성을 설치하기 전에 멈추고 사용자에게 "조장에게 먼저 물어보세요"라고 말한다.

## 파일 소유

- 사용자가 맡은 화면 파일(`src/pages/` 아래 자기 파일)과 그 화면 전용 컴포넌트(`src/components/화면이름/`)만 고친다.
- 새 화면은 `src/pages/Example.tsx`를 복사해 만든다. 파일 이름이 주소가 된다(`Search.tsx`는 `/#/search`). 메뉴 이름과 순서는 파일 안의 `title`, `order`로 정한다. 화면을 더하려고 `src/App.tsx`를 고치지 않는다.
- 아래 공용 파일은 고치지 않는다. 바꿔야 하면 멈추고, 무엇을 왜 바꿔야 하는지 한 줄로 정리해 조장에게 요청하라고 안내한다.
  - `package.json`, 잠금 파일
  - `src/App.tsx`, `src/main.tsx`, `src/components/Layout.tsx`, `index.html`
  - `src/styles/tokens.css`
  - 배포와 빌드 설정, `.github/`
- 색, 글꼴, 모서리는 `src/styles/tokens.css`에 정의된 이름만 쓴다(`bg-brand`, `text-muted`, `border-line`, `rounded-card`). 색상 값을 직접 적지 않는다. 새 색이 필요하면 조장에게 요청하라고 안내한다.
- 데이터는 `src/data/mock.ts`의 가짜 데이터를 먼저 쓴다. 자기 화면에만 쓰는 가짜 데이터는 화면 파일 안에 둔다. 실제 API와 서버 연결은 조장이 한다.

## git

- `main`에 직접 커밋하거나 푸시하지 않는다. 브랜치 이름은 `이름-화면` 꼴이다.
- 작업을 시작할 때 `main`을 최신으로 받는다.
- `push --force`, `rebase`, `reset --hard`를 쓰지 않는다.
- 충돌이 나면 직접 풀지 않는다. 멈추고 어느 파일에서 났는지 쉬운 말로 알린 뒤 조장을 부르라고 안내한다.
- 작업을 마치면 `npm run build`가 통과하는지 확인하고, 커밋하고, 푸시하고, PR을 연다. PR 본문에는 바꾼 것을 두 줄로 적는다.

## 비밀 값

- API 키, 토큰, 비밀번호를 코드에 적지 않는다. `.env` 파일을 커밋하지 않는다.
- 키가 필요한 기능은 가짜 응답으로 먼저 만들고 조장에게 연결을 요청하라고 안내한다.

## 말투

- 한국어로 답한다. 개발 용어는 한 번 풀어서 말한다.
- 한 번에 화면 하나만 만든다. 요청하지 않은 기능을 덧붙이지 않는다.
