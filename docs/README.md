# Vibe Coding Project Starter

이 패키지는 웹 핵심 경험을 역추적(Reverse-Engineering)하여 프론트엔드로 구현하기 위한 표준 가이드 마크다운(MD) 문서 및 커서 규칙 파일 모음입니다.

## 디렉터리 구조
```text
├── README.md
├── .cursorrules                 # AI 에디터 전용 글로벌 규칙 파일
├── docs/
│   └── prd/
│       ├── 01-full-prd.md           # 1. 전체 역추적 PRD
│       ├── 02-frontend-prd.md       # 2. 프론트엔드 전용 상세 PRD
│       └── 03-execution-brief.md    # 3. 개발 실행용 요약 브리프 (DB 스키마 포함)
└── agents/
    ├── designer-agent.md            # 4. 디자이너 AI 에이전트 페르소나 및 토큰 (2D 플랫 벡터 고정)
    ├── developer-agent.md           # 5. 개발자 AI 에이전트 페르소나 및 코딩 표준 (Next.js + Supabase 기본)
    └── developer-workflow.md        # 6. 개발자 에이전트 작업 지침서 및 프롬프트 규격
```