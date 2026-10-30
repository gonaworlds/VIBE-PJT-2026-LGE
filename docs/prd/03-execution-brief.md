# [Execution Brief] Vibe Coding Sprint Guide

## 1. 구현 범위 (MVP Phase 1)
- **스코프**: 
  1. `/learn` 메인 로드맵 뷰 (상단 상태바 + 3~5개 더미 노드)
  2. `/lesson` 퀴즈 세션 (Word Bank 1종 + Multi-Choice 1종 구현)
  3. 사운드 피드백 및 하트 차감 로직
  4. 로컬 스토리지 기반 상태 저장 (Hearts, Streak, Completed Nodes)

## 2. 데이터 스키마 (TypeScript Types)
```typescript
export type QuestionType = 'WORD_BANK' | 'MULTIPLE_CHOICE' | 'MATCHING';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  characterExpression?: 'neutral' | 'happy' | 'thinking' | 'crying';
  options: { id: string; text: string; audioSrc?: string }[];
  correctAnswer: string[] | string;
}

export interface LessonSessionState {
  currentQuestionIndex: number;
  totalQuestions: number;
  hearts: number;
  streak: number;
  isCompleted: boolean;
  userAnswers: Record<string, any>;
}
```

## 3. API 및 데이터 스키마 (Supabase)
### 데이터베이스 스키마 설계
- **`users` 테이블**: `id` (UUID), `username`, `created_at`, `total_xp`, `streak`, `hearts`
- **`lessons` 테이블**: `id`, `unit_id`, `title`, `order`
- **`questions` 테이블**: `id`, `lesson_id`, `type`, `prompt`, `correct_answer`, `options` (JSONB)
- **`user_progress` 테이블**: `user_id`, `lesson_id`, `completed_at`, `score`

### API 라우트 규격 (Next.js App Router)
- `GET /api/lessons/[id]`: 특정 레슨의 질문 목록 가져오기
- `POST /api/progress/complete`: 레슨 완료 상태 저장 및 XP 업데이트
- `POST /api/hearts/deduct`: 오답 시 생명력 차감 로직 처리

## 4. 개발 체크리스트
- [ ] Tailwind 테마에 Duo 컬러 팔레트 구성 (Feather Green, Macaw Blue, Fox Red 등)
- [ ] 3D 누름 버튼 컴포넌트(`Button3D`) 베이스 제작
- [ ] Zustand 기반 `useLessonStore` 인터페이스 및 액션 구현
- [ ] 단어 조립(Word Bank) 양방향 탭 인터랙션 작성
- [ ] 성공/실패 인터랙티브 바텀 피드백 시트 완성