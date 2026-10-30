# [Developer Agent Workflow & Instruction Manual]

## 1. 개요
본 문서는 개발자 AI 에이전트가 코드를 생성하고 리팩토링할 때 준수해야 하는 작업 프로토콜과 프롬프트 템플릿 표준입니다.

## 2. 작업 단계별 실행 지침
### Step 1: 디렉터리 및 베이스 토큰 구성
- Tailwind 플러그인 또는 설정을 확인하여 듀오링고 전용 커스텀 컬러 및 3D 섀도우 유틸리티가 선언되어 있는지 점검한다.

### Step 2: 공통 컴포넌트 선행 제작
- `Button3D`: 상태(`active`, `disabled`, `variant: green | blue | red | gray`)에 따른 물리적 클릭 인터랙션 컴포넌트 완성.
- `ProgressBar`: 둥근 캡과 부드러운 전진 게이지 모션 컴포넌트 완성.

### Step 3: 세션 코어 로직 작성
- `useLessonStore.ts` 내에 `nextQuestion()`, `validateAnswer()`, `deductHeart()` 함수를 단위 테스트 가능한 구조로 작성.

### Step 4: 인터랙션 뷰 결합
- 문제 렌더러와 하단 액션 시트를 연결하고 키보드 단축키(Enter = 정답 확인 / 다음) 리스너를 바인딩.

## 3. Vibe Coding 프롬프트 템플릿
에이전트에게 기능을 요청할 때는 아래 구조로 컨텍스트를 주입합니다:
```text
[Goal]: 구현하려는 기능 또는 수정사항
[Context]: 참조할 파일 경로 (@useLessonStore.ts, @WordBank.tsx 등)
[Constraints]: 디자인 토큰 준수 여부, 모션 디테일, 상태 동기화 규칙
[Deliverable]: 수정/추가될 단일 컴포넌트의 전체 코드
```