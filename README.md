# 허들링 11조

허들링 클럽 2회 오프라인 밋업 조별 실험 레포입니다.

뼈대(빈 화면 두 개, 공용 색)와 규칙 문서는 행사 전에 조장이 준비했습니다. 서비스 화면과 기능은 현장에서 트랙을 보고 만듭니다.

## 기획서

**[11조 기획서 열기 (구글 문서)](https://docs.google.com/document/d/1UQZkKSWryCxSvNgF70BIAl1eAhRrEilyXJA-WDCxDKk/edit)**

트랙, 한 줄 기획, 역할, 시연 순서, 1분 스피치를 이 문서 하나에 적습니다. 링크가 있으면 누구나 볼 수 있고, 고치는 것은 조장이 합니다. 같은 화면을 보면서 함께 정합니다.

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
| `src/data/` | 가짜 데이터 | 조장 |
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
