# [Frontend PRD] Architecture & Client-Side Specifications

## 1. 기술 스택 (Tech Stack)
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, CSS Modules (3D 버튼 및 애니메이션용)
- **State Management**: Zustand (세션 진행 상태, 하트, 오디오 설정 등 글로벌/에피메럴 상태 분리)
- **Animation**: Framer Motion (노드 진입, 문제 전환, 바텀시트 슬라이드)
- **Audio Engine**: Howler.js 또는 Web Audio API (사운드 이펙트 버퍼링)
- **Icons & Graphics**: Lucide React, Custom 2D Flat Vector SVGs

## 2. 화면 단위 구조 및 컴포넌트 계층도
```text
/learn (Layout)
 ├── Sidebar (Nav: Learn, Quests, Leaderboard, Shop, Profile)
 ├── LearningPath (Main)
 │    ├── UnitHeader (단원 제목, 가이드북 버튼)
 │    └── PathCanvas (SVG 패스 + 레슨 노드 노출)
 │         └── LessonNode (Active / Locked / Completed 상태)
 └── RightStickyPanel (Status: Hearts, Gems, Streak, Daily Goal)

/lesson/[lessonId] (Modal-like Fullscreen Layout)
 ├── LessonHeader (Quit Button, ProgressBar, HeartsCounter)
 ├── QuestionContainer (Dynamic Component Switcher)
 │    ├── QuestionPrompt (캐릭터 말풍선 + 지문)
 │    ├── WordBankBoard (조합된 칩 영역 + 선택 대기 칩 그리드)
 │    └── ChoiceGrid / MatchBoard
 └── LessonFooter (Static Sticky Bottom)
      ├── CheckButton (비활성/활성 3D 팝 버튼)
      └── FeedbackSheet (Success/Error 바텀 시트)
```

## 3. 프론트엔드 상태 머신 (Lesson Session FSM)
- `IDLE`: 레슨 로드 및 리소스 캐싱 (사운드, 에셋)
- `QUESTION_ACTIVE`: 입력 대기 (선택/조립 진행 중)
- `VALIDATING`: 답안 판정 및 시각/청각 피드백 대기
- `FEEDBACK_SUCCESS`: 녹색 시트 노출, 경쾌한 챠임 재생, '계속' 활성화
- `FEEDBACK_ERROR`: 적색 시트 노출, 오답음, 진동/흔들림(Shake) 모션, 하트 차감
- `OUT_OF_HEARTS`: 하트 소진 모달 노출 (학습 중단/리필 유도)
- `SESSION_COMPLETE`: 결과 리캡 화면 (XP 롤링 카운터, 스트릭 애니메이션)

## 4. UI 인터랙션 세부 규격
- **Duolingo 3D Button Interaction**:
  - `box-shadow`: 하단에 두꺼운 솔리드 보더 효과 (`border-b-4`)
  - `:active`: `transform: translateY(2px)`, `border-b-0` 또는 두께 절반 축소로 물리적 눌림감 구현
- **Word Bank Drag & Drop / Tap-to-Place**:
  - 칩 클릭 시 즉시 상단 슬롯으로 이동 (레이아웃 애니메이션 `layoutId` 처리)