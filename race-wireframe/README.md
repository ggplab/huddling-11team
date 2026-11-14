# 커밋 레이스 (Commit Race)

해커톤 중 15개 팀의 GitHub 활동(커밋, PR, CI)을 레이스로 중계하는 대형 스크린용 웹 화면입니다.
디자인 캔버스(Claude 아티팩트)의 프로토타입을 React + TypeScript + Vite로 옮겼습니다.

- 현재는 **목업 시뮬레이션**으로 동작합니다. 실제 GitHub 연동은 `src/data/github.ts` 초안을 붙이면 됩니다.
- 화면은 1600×900 고정 레이아웃이고, `Stage`가 창 크기에 맞게 비율을 유지하며 확대/축소합니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 정적 파일 생성
```

### URL 파라미터 (QA, 발표용)

| 파라미터 | 값 | 설명 |
|---|---|---|
| `screen` | `start`, `race`, `podium` | 시작 화면 지정 (기본 `start`) |
| `scenario` | `pr`, `fire`, `rank`, `finish` | 중계 팝오버 케이스를 고정해서 보기 (자동으로 `race`) |
| `speed` | `slow`, `normal`, `fast` | 시뮬레이션 속도 (이벤트 간격 4초, 2초, 1초) |

예: `/?scenario=rank`, `/?screen=race&speed=fast`

## 화면 흐름

```
A 출발 (StartScene)
  Ready → Set → (1.5~2.4초 랜덤 정적) → GO! 15팀 동시 출발
  출발 3.5초 뒤 자동으로 ↓
B 레이스 중계 (RaceScreen)
  왼쪽 순위 타워, 가운데 S자 트랙, 오른쪽 실시간 중계 / 파트별 주행 기록
  [종료, 시상식] ↓
C 시상식 (PodiumScreen)
  포디움 1, 2, 3위, 특별상 3종, 4~15위
  [출발부터 다시 보기] → A
```

## 폴더 구조

```
src/
├─ App.tsx                 화면 전환(start/race/podium) + URL 파라미터
├─ config.ts               팀 수, 우리 팀, 결승 점수, 진행 시간, 배너 노출 시간, 파트 이름
├─ theme.ts                색상 토큰, 메달/타일 색, 팀 색 함수
├─ styles/global.css       모든 애니메이션 keyframes (cr-*)
├─ lib/
│  ├─ score.ts             점수 규칙 + 어뷰징 방지(rate limit)
│  ├─ track.ts             S자 트랙 지오메트리, 진행률 → 좌표
│  └─ format.ts            시간 포맷, 순위 계산
├─ data/
│  ├─ types.ts             RaceState, Banner, FeedItem 등 타입
│  ├─ simulation.ts        목업 시뮬레이션 + 팝오버 케이스 고정 상태
│  ├─ useRace.ts           레이스 상태 훅 (틱, 배너 자동 숨김, 일시정지)
│  └─ github.ts            GitHub 연동 어댑터 초안
├─ components/
│  ├─ Stage.tsx            1600×900 스케일링 컨테이너
│  ├─ Header.tsx
│  ├─ RankingTower.tsx     왼쪽 순위 (1~3위 트로피)
│  ├─ Track.tsx            트랙 + 무빙워크 + 팀 말
│  ├─ TeamPanel.tsx        파트별 주행 기록 패널
│  ├─ LiveFeed.tsx         실시간 중계 목록
│  ├─ BroadcastBanner.tsx  중계 팝오버(로워서드) 4종
│  └─ Trophy.tsx
└─ screens/
   ├─ StartScene.tsx
   ├─ RaceScreen.tsx
   └─ PodiumScreen.tsx
```

## 점수 규칙 (`src/lib/score.ts`)

| 깃 활동 | 트랙 | 점수 |
|---|---|---|
| 커밋 | 전진 | +10 (+ 변경 줄 수 × 0.1, 최대 +20) |
| PR 머지 | 부스터 | +30 |
| CI 실패 | 미끄러짐 | −5 |

어뷰징 방지
- 1인당 10분에 커밋 3개까지만 인정
- 변경 3줄 미만 커밋은 0점
- lock 파일, 빌드 결과물, 이미지 변경은 제외
- 머지 커밋은 커밋 점수에서 제외 (PR 점수로만)

결승선은 `CONFIG.goal`(기본 1,600점). 트랙 위치 = 점수 ÷ 결승 점수.

## 중계 팝오버 4종 (`BroadcastBanner`)

| kind | 트리거 | 배지 | 오른쪽 수치 |
|---|---|---|---|
| `pr` | PR 머지 | BOOST (accent) | +30 |
| `fire` | CI 실패 | SLIP (#D9622B) | −5 |
| `rank` | 1위 교체 | LEAD (#E8B931) | 이전 선두 → 새 선두 |
| `finish` | 결승 통과 | 체크무늬 FINISH | FINISH |

- 화면 하단(트랙 영역)에서 왼쪽으로 슬라이드 인, `CONFIG.bannerMs`(4초) 뒤 사라짐. 하단 게이지가 남은 시간 표시.
- 같은 틱에 여러 이벤트가 겹치면 우선순위: 완주 > 선두 교체 > PR/CI.
- 문구는 `simulation.ts`의 `bannerCopy()`에서 관리.

## 주요 타이밍

| 항목 | 값 |
|---|---|
| Ready 유지 | 약 2.5초 |
| Set → GO | 1.5~2.4초 랜덤 |
| 출발 대시 | 1.7초 `cubic-bezier(.5,0,.3,1)` |
| 출발 → 레이스 화면 | 3.5초 (`CONFIG.startToRaceMs`), 마지막 0.5초 페이드 |
| 말 이동 | `left/top 0.9s ease` |
| 배너 노출 | 4초 |

## 실제 GitHub 연동하기

1. `.env.example`을 `.env`로 복사하고 `VITE_TEAM_REPOS`, `VITE_GITHUB_TOKEN`, `VITE_RACE_START` 입력
2. `src/data/github.ts`
   - `fetchTeamEvents(team, since, token)` → 팀별 커밋/PR/CI 실패 이벤트
   - `scoreEvents(events)` → 점수 규칙 적용한 팀 점수
3. `src/data/useRace.ts`에서 `simulateEvent` 대신 1~2분 간격 폴링 결과로 `RaceState`를 갱신
   - 새로 생긴 이벤트로 `feed`, `banner`, `boost/slip`, `moves`를 만들면 화면은 그대로 동작합니다.

주의
- 토큰 없이 호출하면 **시간당 60회 제한** → 15팀 추적 불가. 토큰 사용 시 시간당 5,000회.
- 프론트엔드에 토큰을 넣는 건 데모 한정입니다. 운영에서는 서버(또는 서버리스 함수)에서 호출하고 결과만 내려주세요.
- 커밋별 변경 줄 수는 커밋 상세 API를 추가로 불러야 해서 호출량이 늘어납니다. 여유가 없으면 `withLineStats=false`로 두고 기본 점수만 쓰세요.
- 커밋 작성자 → 파트(기획/디자인/개발/문서) 매핑 데이터가 필요합니다 (운영자 설정에서 받는 걸 전제).

## 미구현 / 다음 단계

- 운영자 설정 화면 (팀, 저장소 등록, 작성자-파트 매핑)
- 서버 측 폴링 프록시
- 시상식 결과를 실제 레이스 종료 상태에서 계산 (`PodiumScreen`의 `result` prop, 지금은 `MOCK_RESULT`)
- 사운드 (출발 총성, 부스터 효과음)
