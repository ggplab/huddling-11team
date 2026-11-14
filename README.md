# 커밋 레이스 (허들링 11조)

**커밋할수록 앞으로.** 해커톤 운영진이 조별 진행 상황을 한눈에 보는 레이스 중계 화면입니다. 조가 커밋을 올릴 때마다 트랙 위 표식이 앞으로 나가고, PR이 머지되면 더 나가고, 충돌이 나면 뒤로 밀립니다.

허들링 클럽 2회 오프라인 밋업 조별 실험 레포입니다. 예시 데이터(가상의 네 조)와 실제 데이터(조별 공개 레포에서 수집한 커밋과 PR)를 바꿔 볼 수 있습니다.

## 화면

첫 화면이 레이스 화면입니다. 배포 주소: https://huddling-11team.vercel.app

| 영역 | 내용 |
|---|---|
| 위 띠 | 재생과 일시정지, 배속, 예시 데이터와 실제 데이터 전환, 경과 시간, 전체 커밋과 PR 머지 |
| 왼쪽 | 순위 타워. 선두와의 차이, 순위 변동 |
| 가운데 | S자 트랙. 조 번호 표식이 점수만큼 나아갑니다 |
| 오른쪽 | 실시간 중계. 조를 누르면 파트별(기획, 디자인, 개발, 문서) 주행 기록 |

화면 구성의 기준은 조원이 만든 와이어프레임입니다. 예시 데이터는 `src/data/events.ts`, 실제 데이터 정리본은 `public/data/snapshot.json`, 점수 규칙은 `src/lib/core.ts`에 있습니다.

## 기획서

**[11조 기획서 열기 (구글 문서)](https://docs.google.com/document/d/1UQZkKSWryCxSvNgF70BIAl1eAhRrEilyXJA-WDCxDKk/edit)**

트랙, 한 줄 기획, 역할, 시연 순서, 1분 스피치를 이 문서 하나에 적습니다. 조원 누구나 직접 적을 수 있습니다. 남이 적은 칸을 지우지 말고, 의견이 다르면 옆에 이름과 함께 덧붙입니다. 같은 화면을 보면서 함께 정합니다.

## 처음 왔다면

1. [CONTRIBUTING.md](CONTRIBUTING.md)를 읽습니다. Claude Code에 그대로 말할 문장이 있습니다.
2. [기획서](https://docs.google.com/document/d/1UQZkKSWryCxSvNgF70BIAl1eAhRrEilyXJA-WDCxDKk/edit)에서 주제와 내 역할을 확인하고, [docs/plan.md](docs/plan.md)에서 내 화면 파일을 확인합니다.
3. 자기 브랜치를 만들고 `src/pages/`에 내 화면 파일을 만듭니다.

## 폴더 지도

| 폴더 | 넣는 것 | 고치는 사람 |
|---|---|---|
| `docs/` | 화면별 파일과 담당, 행사 규칙, 진행 절차 | 조장 (바꿀 것은 말로 요청합니다) |
| `design/` | 피그마 링크, 화면 캡처, 참고 이미지 | 모두 (자기 이름으로 시작하는 파일만) |
| `public/images/` | 화면에 실제로 쓰는 이미지와 로고. 코드에서는 `/images/파일이름`으로 부릅니다 | 모두 (영어 소문자와 하이픈 이름, 한 장 1MB 이하) |
| `src/pages/` | 화면. 한 사람이 파일 하나를 맡습니다 | 그 화면 담당 |
| `src/components/화면이름/` | 그 화면에서만 쓰는 부품 | 그 화면 담당 |
| `src/data/` | 시연용 예시 데이터 (가상의 네 조와 커밋) | 조장 |
| `src/lib/` | 점수 규칙과 재생 | 조장 |
| `src/styles/` | 공용 색, 글꼴, 모서리 | 조장 |

화면 파일을 `src/pages/`에 넣으면 메뉴와 주소가 자동으로 생깁니다.
여러 사람이 같은 파일을 고치면 충돌이 납니다. 그래서 함께 보는 파일(`docs/plan.md`, 공용 파일)은 조장 한 사람만 고칩니다.

## 실행

```
npm install
npm run dev
```

## 규칙과 도구

- 오늘 실험 규칙(목표, 트랙, 제출 14:20, 발표, 자주 막히는 곳): [docs/event-rules.md](docs/event-rules.md)
- 진행 절차와 지난 해커톤 복기: [docs/hackathon-playbook.md](docs/hackathon-playbook.md)
- 사람용 규칙: [CONTRIBUTING.md](CONTRIBUTING.md)
- 에이전트용 규칙: [CLAUDE.md](CLAUDE.md) (Codex는 [AGENTS.md](AGENTS.md)를 거쳐 같은 규칙을 읽습니다)
- 디자이너용 도구 목록: [TOOLS.md](TOOLS.md)
