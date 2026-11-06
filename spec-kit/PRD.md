# [PRD] Duolingo 웹 클론 제품 요구사항 명세서 (Product Requirements Document)

> **문서 출처**: [`spec-kit/AGENTS.md`](./AGENTS.md) 기반 추출 및 정제  
> **구현 타깃**: 듀오링고 한국어 사이트(https://ko.duolingo.com) 디자인 동일 구현, 내부 레이아웃은 고유 규약 준수  
> **대상 스택**: **HTML5 / CSS3 / Vanilla JavaScript (ES2022+)** (프레임워크·번들러 없음)

---

## 1. 프로젝트 개요 (Overview)

### 1.1 서비스 목표 및 비전
- 듀오링고의 게이미피케이션 기반 마이크로러닝 웹 경험을 현대적 웹 표준과 접근성에 맞춰 정밀하게 재현합니다.
- 프레임워크나 외부 번들러 없이 순수 웹 표준(Vanilla HTML/CSS/ES Modules)만으로 최상의 렌더링 성능과 일관된 디자인 시스템을 제공합니다.

### 1.2 타깃 디바이스 및 지원 브라우저
- **모바일-퍼스트(Mobile-First)** 반응형 웹
- **최소 너비**: 320px(가로 스크롤 없이 모든 콘텐츠 정상 노출)
- **지원 브라우저**: 최신 2개 메이저 버전의 Chrome, Edge, Safari, Firefox 및 iOS Safari, Android Chrome (IE 지원 안 함)
- **Viewport**: 사용자 핀치 줌(확대)을 차단하지 않음 (`user-scalable=no` 금지)

---

## 2. 레이아웃 구조 규약 (Layout Architecture)

> 원칙: **겉박스 > 속박스 > 파티션** 3단 구조로 단순화하고, 전 페이지에서 동일한 구조를 반복합니다.

### 2.1 박스 계층 정의
| 박스 구분 | 클래스 / 요소 | 역할 및 스타일 규칙 |
| :--- | :--- | :--- |
| **겉박스 (Outer)** | `header.site-header`<br>`main > section.section`<br>`footer.site-footer` | • 가로 너비 100% (화면 끝까지 배경 확장)<br>• `max-width` 및 `margin` 금지<br>• 상·하단 섹션 간격은 `padding-block`으로만 제어 |
| **속박스 (Inner)** | `.inner-box` (직계 자식 1개) | • 영역별 최대 너비(`max-width`) 제한 및 좌우 중앙 정렬 (`margin-inline: auto`)<br>• 좌우 거터(`padding-inline`) 담당, 세로 패딩은 0 |
| **파티션 (Part)** | `.part` (속박스 직계 자식) | • 기본 `display: flex`<br>• 줄바꿈 필요 시에만 `flex-wrap: wrap`<br>• 요소 간 간격은 `gap`으로만 처리 (자식 `margin` 금지) |
| **내용박스 (Content)**| 파티션 내부 콘텐츠 단위 | • 실제 컴포넌트(카드, 타일, 목록 등)<br>• 2차원 열 맞춤이 필요한 경우에 한하여 예외적으로 `display: grid` 허용 |

### 2.2 Grid 사용 제한 원칙
- **[MUST NOT]** 겉박스, 속박스(`.inner-box`), 파티션(`.part`) 레벨에는 `display: grid`를 사용하지 않습니다.
- **[MAY]** 오직 내용박스에 한해 동일 규격 2차원 정렬 시 클래스명 `--grid` 접미사와 함께 제한적으로 허용합니다.

### 2.3 영역별 컨테이너 폭 (`--inner-max`) 및 여백 실측 규격
- **본문 섹션 및 푸터**:
  - 모바일 (0 ~ 767px): `max-width: 375px`, 좌우 패딩 `32px`
  - 태블릿 (768px ~): `max-width: 768px`, 좌우 패딩 `40px`
  - 데스크톱 (1080px ~): `max-width: 988px` (실측 기준 확정: 1024px), 좌우 패딩 `0`
- **상단바 (`.site-header`)**: `max-width: 1036px` (실측 기준 확정: 1024px), 높이 `72px`
- **섹션 상하 패딩**: 기본 `96px` (실측 기준)
- **미지정 영역 기본 폴백**: `1920px`

---

## 3. 디자인 시스템 및 토큰 스펙 (Design System & Tokens)

> 모든 시각 값(색, 폰트, 크기, 간격, 반경, 그림자, z-index)은 `tokens.css`의 CSS 변수로 관리합니다.

### 3.1 컬러 팔레트 (Palette)

#### Primitive Colors
| 토큰명 | HEX | 역할 |
| :--- | :--- | :--- |
| `--color-feather-green` | `#58CC02` | 브랜드 메인 컬러, 주요 CTA, 정답 상태 |
| `--color-tree-green` | `#58A700` | 초록 버튼 하단 립, 눌림(active) 상태 |
| `--color-mask-green` | `#89E219` | 밝은 보조 초록, 성공 하이라이트 |
| `--color-macaw` | `#1CB0F6` | 보조 CTA, 링크, 선택 상태 |
| `--color-whale` | `#1899D6` | 파란 버튼 립 |
| `--color-cardinal` | `#FF4B4B` | 오류, 오답, 삭제(Danger) 액션 |
| `--color-cardinal-dark` | `#EA2B2B` | 빨간 버튼 기본 립 |
| `--color-bee` | `#FFC800` | XP, 보상, 리워드 |
| `--color-fox` | `#FF9600` | 연속 학습(Streak), 경고 |
| `--color-beetle` | `#CE82FF` | 특별 이벤트, 보라색 하이라이트 |
| `--color-eel` | `#4B4B4B` | **기본 텍스트** (순수 검정 `#000` 사용 금지) |
| `--color-wolf` | `#777777` | 보조 텍스트 (AA 보정 시 `#757575`) |
| `--color-hare` | `#AFAFAF` | 플레이스홀더, 비활성 텍스트 |
| `--color-swan` | `#E5E5E5` | 카드/입력창 기본 보더, 구분선 |
| `--color-polar` | `#F7F7F7` | 서브 배경색 |
| `--color-snow` | `#FFFFFF` | 기본 배경색 |

#### Semantic Mapping
- 배경: `--color-bg: #FFFFFF`, `--color-bg-subtle: #F7F7F7`
- 텍스트: 기본 `--color-text: #4B4B4B`, 보조 `--color-text-secondary: #757575`
- Primary CTA: 배경 `#58CC02` / 립 `#58A700`
- Accent CTA: 배경 `#1CB0F6` / 립 `#1899D6`
- Danger: 배경 `#FF4B4B` / 립 `#EA2B2B`

---

### 3.2 타이포그래피 (Typography)

#### 폰트 패밀리
- **영문/기본 서체**: `Nunito` (또는 공식 `Duolingo Sans` 가변 폰트 셀프 호스팅)
- **디스플레이/제목 서체**: `Feather` (듀오링고 볼드 디스플레이)
- **한글 폴백**: `Pretendard`, `Noto Sans KR`
- **허용 굵기**: `400`(Regular), `700`(Bold) 2종 집중 사용

#### 타입 스케일 (Type Scale)
| 토큰명 | 크기 / 줄높이 | 굵기 | 주요 용도 |
| :--- | :--- | :--- | :--- |
| `--text-page-title-lg` | 40px (2.5rem) / 44px | 700 | 대화면 메인 제목 |
| `--text-page-title-sm` | 32px (2rem) / 36px | 700 | 모바일 메인 제목 |
| `--text-heading-lg` | 28px (1.75rem) / 32px | 700 | 대제목 (H2) |
| `--text-heading-md` | 24px (1.5rem) / 32px | 700 | 중제목 (H3) |
| `--text-heading-sm` | 20px (1.25rem) / 24px | 700 | 소제목 (H4) |
| `--text-heading-xs` | 16px (1rem) / 20px | 700 | 카드 소제목 |
| `--text-body` | 17px (실측 확정) / 28px | 400 | 일반 본문 텍스트 |
| `--text-caption` | 14px~16px / 24px | 400 / 700 | 캡션, 보조 메타 정보 |
| `--text-label-md` | 16px (1rem) / 16px | 700 | 버튼 및 UI 라벨 (대문자, 영문 자간 0.04em) |

- **한글 줄바꿈 규칙**: `word-break: keep-all; overflow-wrap: break-word;` 필수 적용

---

### 3.3 간격, 반경, 입체감 (Spatial System & Elevation)

#### 간격 스케일 (4px 그리드)
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px (가장 빈번한 요소 간격)
- `--space-4`: 16px (기본 패딩)
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
- `--space-16`: 64px
- `--space-24`: 96px (섹션 상하 패딩)

#### 모서리 반경 (Radius)
- `--radius-sm`: `8px` (작은 칩, 서브 버튼)
- `--radius-md`: `12px` (**카드**, 리스트, 입력창, 답안 타일, 실측 확정 버튼 반경)
- `--radius-lg`: `16px` (웹 기본 버튼)
- `--radius-full`: `9999px` (알약형 배지, 토글, 프로그레스 바)
- `--radius-circle`: `50%` (원형 아바타)

#### 입체감 (3D Lip & Border)
- **블러 없는 단색 하단 오프셋(Lip)**:
  - 버튼 립: `box-shadow: 0 4px 0 <더 어두운 단색 립 컬러>`
  - 카드/타일 립: `box-shadow: 0 2px 0 var(--color-border)`
- **테두리(Border)**: 기본 카드 및 인풋 `2px solid #E5E5E5` (`--border-card`)
- **블러 드롭섀도 금지**: 팝오버/드롭다운을 제외한 카드 및 버튼에 블러 그림자 사용 불가

#### Z-Index 레이어
- `--z-behind`: `-1` (버튼 립 의사요소)
- `--z-raised`: `1` (카드 겹침)
- `--z-sticky`: `100` (상단 고정 헤더)
- `--z-overlay`: `300` (모바일 드로어, 드롭다운, 스크림)
- `--z-modal`: `320` (모달 팝업, 알림 토스트)

---

## 4. UI 컴포넌트별 상세 스펙 (Component Specifications)

### 4.1 버튼 (Buttons)
- **구조**: `height` 고정, 가로 패딩만 적용, 4px 단색 립(`::before` 의사요소 활용)
- **크기**:
  - 대형 (`.btn--lg`): 높이 `50px`, 패딩 `0 20px` (주요 CTA)
  - 기본 (`.btn`): 높이 `48px`, 패딩 `0 20px` (실측 기준 확정)
  - 소형 (`.btn--sm`): 높이 `32px`, 패딩 `0 11px`
- **인터랙션 피드백**:
  - Hover: `filter: brightness(1.08)`
  - Active (클릭 시): `transform: translateY(4px);` 및 립 그림자 제거 (`box-shadow: none;`) → 실제 물리 버튼이 눌리는 시각 효과
  - Focus-visible: `outline: 2px solid var(--color-whale); outline-offset: 2px;`

### 4.2 카드 (Cards)
- 배경: 흰색 (`#FFFFFF`)
- 테두리: `2px solid #E5E5E5`
- 반경: `12px` (`--radius-md`)
- 하단 라인: `box-shadow: 0 2px 0 #E5E5E5`

### 4.3 폼 인풋 (Inputs)
- 높이: 패딩 `9.5px 14px`, 글자 `17px / 줄높이 25px`
- 테두리: `2px solid #E5E5E5` (포커스 시 `#1CB0F6` + 외곽 링)
- 오류 상태: 테두리 `#FF4B4B`, 배경 연한 붉은 틴트 (`#FFF0F0`)

### 4.4 프로그레스 바 (Progress Bar)
- 높이: `16px`, 트랙 `#E5E5E5`, 채움 `#58CC02`, 반경 `9999px`
- 애니메이션: `transform: scaleX()` + `transform-origin: left` (너비 직접 애니메이션 금지)

---

## 5. 반응형 브레이크포인트 규격 (Responsive Breakpoints)

| 단계 | 브레이크포인트 (min-width) | 주요 레이아웃 변화 |
| :--- | :--- | :--- |
| **Mobile (Base)** | `0px ~ 767px` | • 단일 컬럼 수직 배치<br>• 모바일 햄버거 메뉴 및 풀스크린 드로어<br>• 버튼 풀폭(Full-width) 확장 |
| **Tablet** | `768px ~ 1023px` | • 2단 컬럼 그리드 배치 전환<br>• 헤더 로고 중앙 / 좌측 햄버거 메뉴 유지 |
| **Desktop** | `1024px 이상` | • 데스크톱 풀 내비게이션 및 드롭다운 활성화<br>• 다열(3~5열) 카드 및 푸터 레이아웃 확장 |

---

## 6. 콘텐츠 톤앤매너 (Tone & Voice)

- **어조**: 친절하고 격려하며 유쾌한 톤
- **문체**: **해요체** 통일 (예: "~해요", "~해보세요", "~확인하세요")
- **버튼 문구**: 명확하고 직관적인 동사형 표현 ("시작하기", "문의하기", "로그인")
- **오답 및 오류 피드백**: 사용자를 비난하지 않고 해결 방법을 친절히 제시

---

## 7. 비기능적 요구사항 (Non-Functional Requirements)

### 7.1 성능 (Performance)
- **Lighthouse 점수**: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- **Core Web Vitals 목표**:
  - LCP (최대 콘텐츠풀 페인트) ≤ 2.5초
  - INP (다음 페인트에 대한 상호작용) ≤ 200ms
  - CLS (누적 레이아웃 이동) ≤ 0.1
- **리소스 최적화**: 폰트 WOFF2 가변 폰트 단일화, 이미지 SVG 우선 및 비율 사전 확보(`aspect-ratio`)

### 7.2 웹 접근성 (Accessibility - WCAG 2.2 AA)
- 모든 기능을 마우스 없이 키보드(`Tab`, `Enter`, `Space`)만으로 조작 가능
- 명확한 시각적 포커스 링(`:focus-visible`) 보장
- 최소 터치 타깃 크기 44×44px 이상 확보
- 색상 외에 텍스트, 아이콘, 패턴 등 다중 단서 제공

### 7.3 보안 (Security)
- 클라이언트 저장소(LocalStorage)에 평문 비밀번호 저장 금지 (PBKDF2 등 암호화 해시 적용)
- 사용자 입력값 렌더링 시 XSS 방지를 위한 엄격한 HTML 이스케이프 처리

---

## 8. 의도적 차이점 및 실측 확정치 (Customizations & Confirmed Specs)

### 8.1 원본 듀오링고 대비 의도적 개선/차이점
1. **Viewport 확대 허용**: 원본의 `user-scalable=no`를 제거하고 모바일 접근성을 위해 줌 허용.
2. **레이아웃 아키텍처**: 원본의 임의 구조 대신 고유의 3단 박스(`겉박스 > .inner-box > .part`) 엄격 준수.
3. **보조 텍스트 명도 보정**: 원본의 `#777777` 대신 WCAG AA 4.5:1을 충족하는 `#757575` 적용.
4. **글꼴 라이선스 보호**: 원본 상용 전용 폰트 대신 공개 가변 폰트(DuolingoSansVF.woff2) 및 표준 웹폰트 스택 적용.

### 8.2 실측 확정치 요약 (F10)
- **컨테이너 최대 너비 (`max-width`)**: 섹션 1024px / 헤더 1024px / 푸터 375px
- **헤더 높이**: 72px
- **섹션 상하 패딩**: 96px
- **버튼 규격**: 반경 12px, 가로 패딩 20px, 하단 립 4px
- **본문 텍스트**: 17px / 400 (Regular)
- **한국어 기본 문체**: 해요체

---

## 9. 제품 완료 정의 (Definition of Done)

- [ ] **디자인**: 모든 색상, 폰트, 여백이 토큰 변수를 사용하고 하드코딩 값이 없을 것
- [ ] **레이아웃**: 겉박스 > `.inner-box` > `.part` 3단 계층 준수 및 불필요한 Grid 남발이 없을 것
- [ ] **반응형**: 320px, 768px, 1024px, 1280px 전 해상도에서 가로 스크롤 없이 유려하게 동작할 것
- [ ] **인터랙션**: 버튼 3D 립 눌림 효과 및 hover/active/focus-visible 상태가 완비될 것
- [ ] **접근성**: 키보드 내비게이션, 스크린 리더 대체 텍스트(alt), 텍스트 명도 대비 기준 충족
- [ ] **무결성**: 콘솔 오류 없음, HTML 시맨틱 태그 구조 및 CSS 문법 일치

