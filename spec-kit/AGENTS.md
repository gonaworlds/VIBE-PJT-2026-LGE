# AGENTS.md — 프로젝트 구현 규약

> 대상 스택: **HTML5 / CSS3 / Vanilla JavaScript (ES2022+)**, 프레임워크·번들러 없음
> 작성 기준: 웹디자이너 15년차, 웹개발자 15년차가 프로젝트 전반에 적용할 규칙
> 적용 대상: 이 저장소에서 작업하는 모든 AI 에이전트와 사람 기여자
> 구현 타겟: **듀오링고 한국어 사이트(https://ko.duolingo.com)와 디자인 동일, 내부 레이아웃은 별도 규칙**
> 문서 구성: PART A·B(일반 규칙) → PART C·D(에이전트 규칙·완료 정의) → **PART E(레이아웃 규약)** → **PART F(듀오링고 전용 스펙)**
> 정보 신뢰도 표기: **사실**(복수 출처 일치) / **추론**(일부 근거) / **추측**(근거 약함) / **정확하지 않음**(출처 간 불일치)

---

## 0. 문서 사용 규칙

### 0.1 규범 표기
| 표기 | 의미 |
|---|---|
| **[MUST]** | 예외 없이 지킵니다. 위반 시 작업은 미완료입니다. |
| **[MUST NOT]** | 예외 없이 금지합니다. |
| **[SHOULD]** | 기본적으로 따릅니다. 벗어날 경우 사유를 PR/커밋 메시지에 남깁니다. |
| **[MAY]** | 선택 사항입니다. |

### 0.2 우선순위
충돌 시 다음 순서로 판단합니다.

1. 접근성·보안 (사람과 데이터의 안전)
2. 사용자의 명시적 지시
3. **PART E(레이아웃)·PART F(듀오링고 전용)의 [MUST] / [MUST NOT]** — PART A·B의 일반 규칙과 충돌하면 PART E·F가 우선합니다.
4. 이 문서의 나머지 [MUST] / [MUST NOT]
5. 기존 코드의 관례 (일관성)
6. 이 문서의 [SHOULD]
7. 에이전트의 개인적 선호

> PART F의 일부 색상 대비는 1순위(접근성)와 충돌합니다. 해당 항목은 PART F §F8에 "임시 예외"로 기록하고, 사용자 결정 전까지 그 범위 안에서만 허용합니다.

### 0.3 에이전트 작업 프로토콜
- **[MUST]** 작업 시작 전 관련 파일(`tokens.css`, 기존 컴포넌트, 해당 페이지)을 먼저 읽고, 이미 존재하는 토큰·컴포넌트·유틸을 재사용합니다.
- **[MUST]** 요청 범위 밖의 파일을 수정하지 않습니다. 필요하다고 판단되면 수정 전에 사유를 먼저 보고합니다.
- **[MUST]** 새 토큰, 새 컴포넌트, 새 의존성을 만들기 전에 기존 것으로 해결 가능한지 확인합니다.
- **[MUST]** 요구사항이 모호하면 추측으로 구현하지 않고 질문하거나, 선택한 가정을 결과 보고에 명시합니다.
- **[MUST NOT]** 동작하지 않는 코드, 생략된 코드(`// ...나머지 동일`), 임시 placeholder 로직을 완료 상태로 제출하지 않습니다.
- **[MUST NOT]** 사용자 승인 없이 외부 라이브러리·CDN·폰트·웹 서비스를 추가하지 않습니다.
- **[MUST]** 작업 종료 시 PART D 완료 정의를 스스로 점검하고 결과를 보고합니다.

---

## 1. 공통 프로젝트 구조

### 1.1 디렉터리
```
/
├─ index.html
├─ pages/                  # 하위 페이지 (kebab-case.html)
├─ assets/
│  ├─ css/
│  │  ├─ main.css          # 진입점: @layer 순서 선언 + import
│  │  ├─ base/             # reset.css, tokens.css, typography.css, base.css
│  │  ├─ layout/           # outer-box(section), inner-box, part, header, footer (grid 금지, PART E)
│  │  ├─ components/       # button.css, card.css, modal.css ...
│  │  ├─ pages/            # 페이지 전용 스타일 (최소화)
│  │  └─ utilities/        # 소수의 유틸 클래스
│  ├─ js/
│  │  ├─ main.js           # 진입점 (type="module")
│  │  ├─ components/       # 컴포넌트별 모듈 (modal.js, tabs.js ...)
│  │  ├─ modules/          # 도메인 로직 (api.js, storage.js ...)
│  │  └─ utils/            # 순수 함수 (dom.js, format.js ...)
│  ├─ img/
│  ├─ icons/               # SVG
│  └─ fonts/               # 셀프 호스팅 폰트 (woff2)
├─ AGENTS.md
└─ README.md
```
- **[MUST]** 파일·폴더명은 영문 소문자 kebab-case입니다. 공백, 한글, 대문자를 쓰지 않습니다.
- **[MUST]** 한 파일은 한 책임만 가집니다. CSS 파일 1개 = 컴포넌트 1개, JS 파일 1개 = 모듈 1개입니다.
- **[SHOULD]** 한 파일이 300줄을 넘으면 분리를 검토합니다.

### 1.2 브라우저 지원
- **[MUST]** 지원 기준은 최신 2개 메이저 버전의 Chrome, Edge, Safari, Firefox 및 iOS Safari, Android Chrome입니다. (프로젝트에서 변경 시 README에 명시)
- **[MUST]** IE는 지원하지 않습니다.
- **[MUST]** 최신 CSS/JS 기능을 쓸 때는 지원 현황을 확인하고, 미지원 환경에서도 레이아웃이 깨지지 않는 점진적 향상(progressive enhancement)을 적용합니다.

### 1.3 언어·인코딩·포맷
- **[MUST]** 모든 파일은 UTF-8, LF 줄바꿈, 파일 끝 개행 1개입니다.
- **[MUST]** 들여쓰기는 스페이스 2칸입니다. 탭을 쓰지 않습니다.
- **[MUST]** 사용자 노출 텍스트의 기본 언어는 `<html lang>` 값과 일치시킵니다.
- **[SHOULD]** `.editorconfig`, Prettier, ESLint, Stylelint 설정을 저장소 루트에 둡니다.

---

# PART A. DESIGNER 규약 (15년차 웹디자이너 기준)

> 원칙: **일관성 > 개성**, **위계 > 장식**, **접근성은 기본값**, **토큰 밖의 값은 없다.**

## A1. 디자인 토큰 (Single Source of Truth)

- **[MUST]** 모든 시각 값(색, 글꼴, 크기, 간격, 반경, 그림자, 모션, z-index)은 `assets/css/base/tokens.css`의 CSS Custom Property로만 정의합니다.
- **[MUST NOT]** 컴포넌트·페이지 CSS에 hex, rgb, px 등 하드코딩 값을 직접 쓰지 않습니다. (예외: `0`, `1px` 보더, `100%`, `50%`, `auto`)
- **[MUST]** 토큰은 2계층으로 구성합니다.
  1. **Primitive**: 값 자체 (`--color-blue-500`)
  2. **Semantic**: 역할 (`--color-primary`, `--color-text`, `--color-bg-surface`)
- **[MUST]** 컴포넌트는 Semantic 토큰만 참조합니다. Primitive를 직접 참조하지 않습니다.
- **[MUST]** 다크모드·테마 전환은 Semantic 토큰의 재할당으로만 처리합니다.

```css
/* tokens.css 구조 예시 */
:root {
  /* Primitive */
  --color-blue-500: #2563eb;
  --color-gray-900: #111827;
  /* Semantic */
  --color-primary: var(--color-blue-500);
  --color-text: var(--color-gray-900);
}
```

## A2. 컬러

- **[MUST]** 이 프로젝트의 팔레트는 **PART F §F2에 정의된 듀오링고 팔레트만** 사용합니다. (일반 규칙의 "Primary 1색 + Accent 1색" 제한은 적용하지 않습니다. 듀오링고는 게이미피케이션 색을 의미별로 분리해 씁니다.)
- **[MUST]** 색 사용 비율: 흰색(Snow)·Polar 표면이 지배적이며, Feather Green은 **주요 CTA와 정답/완료 상태에만** 씁니다. 장식용으로 초록을 칠하지 않습니다.
- **[MUST]** 명도 대비는 WCAG 2.2 AA 이상입니다.
  - 일반 텍스트 4.5:1 이상
  - 큰 텍스트(24px 이상, 또는 굵은 18.66px 이상) 3:1 이상
  - UI 컴포넌트 경계·아이콘·포커스 링 3:1 이상
- **[MUST]** 색만으로 정보를 전달하지 않습니다. 오류·성공·선택 상태에는 아이콘, 텍스트, 패턴 중 하나를 함께 씁니다.
- **[MUST NOT]** 순수 `#000` 텍스트 + 순수 `#fff` 배경의 조합을 기본값으로 쓰지 않습니다. (눈부심 완화를 위해 `--color-text`는 약간 부드러운 어두운 색)
- **[MUST]** 다크모드를 지원할 경우 단순 색 반전이 아니라, 표면 단계(elevation)별 명도를 별도로 설계합니다. 지원하지 않을 경우 `color-scheme: light`를 명시합니다.
- **[SHOULD]** 그라디언트는 브랜드 요소 1~2곳에만 사용하고, 텍스트 뒤에서는 대비를 재검증합니다.

## A3. 타이포그래피

- **[MUST]** 폰트 패밀리는 **디스플레이(제목·버튼) 1종 + 본문(UI) 1종**, 총 2종 슬롯입니다. 실제 서체와 스택은 **PART F §F3**을 따릅니다.
- **[MUST NOT]** 라이선스가 없는 상용 서체(Feather Bold, DIN Next Rounded)를 파일로 포함하거나 CDN으로 불러오지 않습니다. 대체 서체는 PART F §F3을 따릅니다.
- **[MUST]** 폰트 파일은 `woff2`로 셀프 호스팅하고 `font-display: swap`을 지정합니다. 필요한 굵기만 로드합니다. (보통 400/500/700)
- **[MUST]** 타입 스케일은 토큰으로 고정하며, 임의 크기를 쓰지 않습니다. 스케일 값은 **PART F §F3 표**를 따릅니다. (일반 기본값 표는 삭제했습니다.)
- **[MUST]** 제목·히어로는 `clamp()`로 유동 크기를 적용하되, 상·하한은 PART F §F3 값 안에서만 잡습니다.
- **[MUST]** 본문 기본 크기는 17px(`--font-size-body-lg`), UI·카드 설명은 15px까지 허용합니다. 14px 미만은 캡션·메타 정보에만 씁니다. (일반 규칙의 "본문 최소 16px"은 PART F 기준으로 대체)
- **[MUST]** 줄 높이: 본문 1.6~1.8(한글), 제목 1.2~1.4입니다.
- **[MUST]** 한 줄 길이(measure)는 한글 기준 약 35~45자, 영문 기준 45~75자를 넘지 않습니다. (`max-width: 65ch` 계열)
- **[MUST]** 한글 줄바꿈은 `word-break: keep-all; overflow-wrap: break-word;`를 기본으로 합니다.
- **[MUST]** 굵기는 `400`(본문) / `700`(강조·UI) / `800`(디스플레이 대체 서체 전용) 3종만 씁니다. 300 이하의 얇은 굵기는 쓰지 않습니다. (듀오링고는 얇은 본문을 쓰지 않는 것이 특징입니다.)
- **[MUST NOT]** 장식 목적의 italic, 전체 대문자, 과도한 자간 조정을 한글 텍스트에 쓰지 않습니다. 단, **영문 버튼 라벨의 대문자 + 0.8px 자간**(PART F §F3)은 예외이며, 한글 라벨에는 자간을 주지 않습니다.
- **[SHOULD]** 숫자 비교가 필요한 표·가격에는 `font-variant-numeric: tabular-nums`를 적용합니다.

## A4. 간격·레이아웃·그리드

- **[MUST]** 간격은 **4px 기반 스케일**을 따릅니다: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. 값과 토큰명은 **PART F §F4**를 따릅니다.
- **[MUST]** 관련 요소는 가깝게, 무관한 요소는 멀게 둡니다. (근접성 원칙) 같은 위계 내 간격은 동일 토큰을 씁니다.
- **[MUST]** 브레이크포인트는 **3단계**로 고정합니다. (mobile-first, `min-width` 기준) 미디어쿼리에는 CSS 변수를 쓸 수 없으므로 아래 숫자를 그대로 씁니다.

| 이름 | 최소 너비 | 비고 |
|---|---|---|
| base (mobile) | 0 | 단일 컬럼 중심, 파티션은 세로 쌓임 |
| tablet | 768px | 파티션 가로 배치 시작 |
| desktop | 1024px | 최대 폭 레이아웃 |

- **[MUST]** 12컬럼 그리드 체계는 사용하지 않습니다. (PART E: Grid 금지, Flex 기반) 폭 제한은 `.inner-box`의 `max-width`로만 처리합니다.
- **[MUST]** 모든 페이지는 320px 너비에서 가로 스크롤 없이 사용 가능해야 합니다.
- **[MUST]** 섹션(겉박스) 상하 여백은 `padding-block`으로만 주고, 값은 PART F §F4의 `--section-y-*` 토큰을 사이트 전체에서 동일하게 반복합니다. `margin`으로 섹션 간격을 만들지 않습니다.
- **[MUST]** 정렬 기준선을 지킵니다. 한 화면에서 좌측 정렬 기준선은 가능한 1~2개로 유지합니다.
- **[SHOULD]** 중앙 정렬은 히어로·짧은 제목·CTA에 한정하고, 긴 본문은 좌측 정렬합니다.

## A5. 컴포넌트 디자인 원칙

- **[MUST]** 모든 인터랙티브 컴포넌트는 다음 상태를 디자인하고 구현합니다.
  `default / hover / focus-visible / active / disabled` + 해당되는 경우 `loading / error / selected / empty`
- **[MUST]** 터치 타깃은 최소 **44×44px**(WCAG 2.2 AAA 권장, Apple HIG)이며, 인접 타깃 간 간격은 8px 이상입니다. 시각 크기가 작아도 클릭 영역은 확보합니다.
- **[MUST]** 포커스 링은 항상 보이게 합니다. 두께 2px 이상, 배경 대비 3:1 이상, `outline-offset` 2px입니다. `outline: none`만 단독으로 쓰지 않습니다.
- **[MUST]** 버튼 변형은 **PART F §F5**의 5종(Primary green / Accent blue / Outline / Danger / Disabled)으로 제한합니다. 한 화면(뷰포트)에 Primary는 1개 원칙입니다. ("Green means go": 초록은 항상 "지금 할 일"을 뜻합니다.)
- **[MUST]** 버튼 라벨은 동사 중심의 구체적 문구입니다. ("확인" 대신 "주문 완료하기")
- **[MUST]** 폼은 라벨을 항상 노출합니다(placeholder로 대체 금지). 오류 메시지는 필드 근처에 원인과 해결 방법을 함께 씁니다.
- **[MUST]** 반경(radius)은 `--radius-sm/md/lg/full` 4단계만 쓰고, 한 사이트 내에서 같은 위계의 요소는 같은 반경을 씁니다.
- **[MUST]** 깊이 표현은 **블러 없는 단색 오프셋**(버튼의 4px 하단 "립") + **2px 윤곽선**(카드)으로만 합니다. 블러 드롭섀도를 쓰지 않습니다. 값은 PART F §F4를 따릅니다.
- **[MUST]** 빈 상태(empty), 로딩 상태, 오류 상태 화면을 정상 상태와 함께 설계합니다.
- **[SHOULD]** 새 컴포넌트를 만들기 전에 기존 컴포넌트의 변형(variant)으로 해결 가능한지 먼저 검토합니다.

## A6. 이미지·아이콘·미디어

- **[MUST]** 아이콘은 SVG만 사용하며, 하나의 아이콘 세트(선 굵기, 모서리 스타일 동일)로 통일합니다. 기본 크기는 16/20/24px 중에서 선택하고 `currentColor`를 상속합니다.
- **[MUST]** 이미지는 가로세로 비율(aspect-ratio)을 사전에 정하고, 레이아웃 이동(CLS)이 없도록 `width`/`height` 속성 또는 `aspect-ratio`를 지정합니다.
- **[MUST]** 이미지 포맷 우선순위는 AVIF/WebP → JPEG/PNG(폴백)이며, 일러스트·로고는 SVG입니다.
- **[MUST]** 의미 있는 이미지는 대체 텍스트를 쓰고, 장식 이미지는 `alt=""`입니다.
- **[MUST]** 이미지 위 텍스트는 오버레이(스크림) 등으로 대비 기준을 충족시킵니다.
- **[MUST NOT]** 저작권이 확인되지 않은 이미지·폰트·아이콘을 사용하지 않습니다.
- **[SHOULD]** 사진 톤(채도, 색온도, 구도)을 사이트 전체에서 통일합니다.

## A7. 모션·인터랙션

- **[MUST]** 모션은 상태 변화를 설명하는 용도에만 씁니다. (등장, 전환, 피드백)
- **[MUST]** 지속 시간·이징 토큰은 **PART F §F6**을 따릅니다. 일반 UI 전환은 250ms 이하, 축하 연출(정답·완료)만 400ms 이상을 허용합니다. `linear`는 로딩 스피너 외에는 쓰지 않습니다.
- **[MUST]** `@media (prefers-reduced-motion: reduce)`에서 전환·애니메이션을 제거하거나 최소화합니다. 바운스(오버슈트) 이징과 컨페티는 반드시 제거합니다.
- **[MUST]** 애니메이션은 `transform`과 `opacity`만 사용합니다. `width`, `height`, `top`, `left`, `margin` 애니메이션을 금지합니다. (프로그레스 바 채움은 `transform: scaleX()`로 구현, 버튼 립은 PART F §F5의 예외를 따릅니다.)
- **[MUST NOT]** 자동 재생 캐러셀, 무한 반복 애니메이션, 깜빡임(초당 3회 초과)을 쓰지 않습니다.
- **[MUST]** 모든 hover 효과는 키보드 포커스와 터치 환경에서도 동등한 경험을 제공합니다.

## A8. 접근성 디자인

- **[MUST]** WCAG 2.2 AA를 최소 기준으로 설계합니다.
- **[MUST]** 정보 구조는 시각 순서와 DOM 순서가 일치하도록 설계합니다.
- **[MUST]** 텍스트는 200%까지 확대해도 내용 손실이나 가로 스크롤이 없어야 합니다.
- **[MUST]** 링크는 본문 안에서 색 외에 밑줄 등 비색상 단서를 둡니다.
- **[MUST]** 오류·알림 메시지는 화면 낭독기로도 전달될 수 있게 위치와 문구를 설계합니다.
- **[SHOULD]** 모든 시안은 흑백 변환 상태에서도 위계가 구분되는지 확인합니다.

## A9. 콘텐츠·카피·톤

- **[MUST]** 용어를 통일합니다. 같은 개념을 다른 단어로 부르지 않습니다. (예: 로그인/로그온 혼용 금지)
- **[MUST]** 사이트 전체에서 문체를 하나로 고정합니다. (기본: 해요체 또는 합쇼체 중 프로젝트 시작 시 택1)
- **[MUST]** 제목은 내용을 요약하는 명사구/문장으로, 한 화면에 H1은 1개입니다.
- **[MUST]** 날짜·숫자·단위 표기 형식을 통일합니다. (예: `2026.11.02`, `12,000원`)
- **[MUST NOT]** 실제 서비스에 `Lorem ipsum`, 임의 문구, 의미 없는 더미 이미지를 남기지 않습니다.

## A10. 디자인 QA 체크리스트

작업 완료 전 모두 확인합니다.

- [ ] 모든 색·크기·간격이 토큰에서 왔는가
- [ ] 320 / 768 / 1024 / 1280px에서 레이아웃이 정상인가
- [ ] 텍스트 대비 4.5:1, UI 대비 3:1을 충족하는가
- [ ] 모든 인터랙티브 요소에 hover/focus/active/disabled가 있는가
- [ ] 터치 타깃이 44px 이상인가
- [ ] 로딩·빈 상태·오류 상태가 있는가
- [ ] 이미지에 비율 확보와 alt가 있는가
- [ ] 위계(H1~H3, 본문, 캡션)가 한눈에 구분되는가
- [ ] 같은 역할의 요소가 페이지마다 동일하게 보이는가

---

# PART B. DEVELOPER 규약 (15년차 웹개발자 기준)

> 원칙: **시맨틱 우선**, **의존성 최소**, **단순함 > 영리함**, **측정 가능한 품질**

## B1. HTML

### 문서 기본
- **[MUST]** 모든 페이지는 다음 골격을 따릅니다.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>페이지명 | 사이트명</title>
  <meta name="description" content="120~160자 이내 설명">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script type="module" src="/assets/js/main.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">본문 바로가기</a>
  <!-- 겉박스: header + (main > section) + footer / 각 겉박스 안에 .inner-box 1개 (PART E) -->
  <header class="site-header">
    <div class="inner-box">
      <div class="part">...</div>
    </div>
  </header>
  <main id="main">
    <section class="section" aria-labelledby="sec-title">
      <div class="inner-box">
        <div class="part">...</div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="inner-box">
      <div class="part">...</div>
    </div>
  </footer>
</body>
</html>
```

- **[MUST NOT]** `user-scalable=no`, `maximum-scale=1`로 확대를 막지 않습니다.
- **[MUST]** `<title>`은 페이지마다 고유해야 합니다.

### 시맨틱
- **[MUST]** 의미에 맞는 요소를 씁니다: `header, nav, main, section, article, aside, footer, figure, figcaption, time, address, button, a, ul/ol, table`.
- **[MUST]** `<main>`은 페이지당 1개, `<h1>`은 페이지당 1개입니다. 제목 레벨을 건너뛰지 않습니다. (스타일 때문에 레벨을 고르지 않습니다.)
- **[MUST]** `section`에는 반드시 제목(h2~h6)을 둡니다. 제목이 없으면 `div`입니다.
- **[MUST]** 동작은 `<button>`, 이동은 `<a href>`입니다. `div`/`span`에 클릭 이벤트를 붙여 버튼처럼 쓰지 않습니다.
- **[MUST]** `<a>`는 유효한 `href`를 가집니다. `href="#"`, `javascript:void(0)`을 쓰지 않습니다.
- **[MUST]** 목록은 `ul/ol/li`, 표 데이터는 `table`(+`caption`, `th scope`)을 씁니다. 레이아웃에 table을 쓰지 않습니다.
- **[MUST]** 인라인 스타일(`style=""`)과 인라인 이벤트 핸들러(`onclick=""`)를 쓰지 않습니다.
- **[MUST]** 순수 스타일 목적의 빈 요소·`<br>` 반복·`&nbsp;` 간격 조정을 쓰지 않습니다.

### 폼
- **[MUST]** 모든 입력에는 `<label for>` 또는 감싸는 label이 있습니다.
- **[MUST]** 적절한 `type`, `name`, `autocomplete`, `inputmode`, `required`, `pattern`을 지정합니다.
- **[MUST]** 오류는 `aria-invalid`, `aria-describedby`로 연결하고, 제출 실패 시 첫 오류 필드로 포커스를 이동합니다.
- **[MUST]** 클라이언트 검증은 UX용이며, 신뢰 경계는 서버 검증입니다. (백엔드가 있는 경우)

### 네이밍
- **[MUST]** `id`는 JS 앵커·라벨 연결·ARIA 참조 용도로만 쓰고, 스타일링에는 쓰지 않습니다.
- **[MUST]** JS 훅은 `data-js-*` 속성을 사용하고, CSS 클래스와 분리합니다. (예: `data-js="modal-open"`)

## B2. CSS

### 아키텍처
- **[MUST]** `@layer`로 우선순위를 관리합니다. 진입점에서 순서를 선언합니다.

```css
@layer reset, tokens, base, layout, components, pages, utilities;
```

- **[MUST]** 선택자는 **클래스 중심**입니다. 요소 선택자는 `reset/base` 레이어에만, ID 선택자는 쓰지 않습니다.
- **[MUST]** 명명 규칙은 **BEM** 변형을 따릅니다.
  - Block: `.card`
  - Element: `.card__title`
  - Modifier: `.card--featured`
  - 상태: `.is-open`, `.is-active`, `.is-loading`, `.has-error` (JS가 토글)
- **[MUST]** 중첩 깊이는 최대 3단계, 선택자 구체성은 `(0,2,0)`을 넘기지 않습니다.
- **[MUST NOT]** `!important`를 쓰지 않습니다. (예외: 유틸리티 레이어, `prefers-reduced-motion`/`hidden` 오버라이드 — 사유 주석 필수)
- **[MUST]** 컴포넌트 CSS는 해당 컴포넌트 외부 요소에 영향을 주지 않습니다. (전역 누수 금지)
- **[MUST]** 유틸리티 클래스는 소수만 둡니다: `.visually-hidden`, `.sr-only`, `.container`, `.stack`, `.cluster`, `.text-center` 등. 유틸 남발로 마크업이 스타일 덩어리가 되지 않게 합니다.

### 작성 규칙
- **[MUST]** Reset은 최소 reset(현대식)을 사용하고 `box-sizing: border-box`를 전역 적용합니다.
- **[MUST]** **모바일 우선**(`min-width` 미디어쿼리)으로 작성합니다. `max-width` 쿼리는 예외적으로만 씁니다.
- **[MUST]** 레이아웃은 **`Flexbox`** 로 만듭니다. `Grid`는 **내용박스(파티션 안의 콘텐츠 단위)에만, 필요할 때** 허용합니다. (PART E §E6) `float`·`position`으로 레이아웃을 만들지 않습니다.
- **[MUST]** 박스 구조(겉박스 > `.inner-box` > 파티션)와 간격 규칙(겉박스는 padding, 파티션은 gap)은 **PART E**를 따릅니다.
- **[MUST]** 방향 의존 속성 대신 **논리 속성**을 우선합니다. (`margin-inline`, `padding-block`, `inset-inline-start`)
- **[MUST]** 단위 규칙
  - 폰트: `rem` (px 금지, 단 토큰 정의 시 root 기준만 허용)
  - 간격·크기: 토큰(`var(--space-*)`) 우선, 필요 시 `rem`
  - 보더: `1px`
  - 뷰포트 높이: `dvh`/`svh` 사용(모바일 주소창 대응), `100vh` 단독 사용 금지
  - 라인하이트: 단위 없는 숫자
- **[MUST]** `z-index`는 토큰 레이어(`--z-dropdown`, `--z-sticky`, `--z-overlay`, `--z-modal`, `--z-toast`)로만 지정합니다. 임의 숫자(9999 등)를 금지합니다.
- **[MUST]** 속성 순서: 위치 → 박스모델 → 타이포 → 시각(배경/보더) → 기타(전환 등). Stylelint로 강제합니다.
- **[MUST]** 가능한 곳에 `gap`, `aspect-ratio`, `clamp()`, `min()/max()`, `:where()`, `:is()`, `:focus-visible`을 사용합니다.
- **[SHOULD]** 컴포넌트가 부모 너비에 반응해야 하면 **Container Queries**를 씁니다. 뷰포트 쿼리는 페이지 레이아웃에 씁니다.
- **[SHOULD]** `:has()`, CSS Nesting 등 신기능은 지원 범위를 확인한 후 도입합니다.
- **[MUST NOT]** 매직 넘버(`margin-top: 13px`)를 쓰지 않습니다. 필요하면 토큰을 확장하고 근거를 주석으로 남깁니다.
- **[MUST NOT]** `:hover`에만 의존하는 기능을 만들지 않습니다. 항상 `:focus-visible`을 함께 정의합니다.
- **[MUST NOT]** 벤더 프리픽스를 수동으로 작성하지 않습니다. (Autoprefixer 사용 또는 불필요 판단)

### 인쇄·특수 미디어 (SHOULD)
- 주요 콘텐츠 페이지는 `@media print` 최소 스타일(내비·광고 숨김, 링크 URL 표기)을 제공합니다.
- `@media (prefers-color-scheme)`, `(prefers-reduced-motion)`, `(forced-colors)`를 존중합니다.

## B3. JavaScript (Vanilla)

### 언어·모듈
- **[MUST]** ES Modules(`type="module"`)를 사용합니다. 전역 변수·전역 함수를 만들지 않습니다.
- **[MUST]** `const` 기본, 재할당이 필요할 때만 `let`입니다. `var` 금지.
- **[MUST]** 엄격 비교(`===`, `!==`)만 씁니다.
- **[MUST]** 모든 모듈은 단일 책임이며, 부수효과(side effect)는 진입점 `init()`에서만 일으킵니다. import 시점에 DOM을 조작하지 않습니다.
- **[MUST]** 함수는 가능한 한 순수 함수로 작성하고, 한 함수는 한 가지 일을 합니다. (권장 40줄 이하)
- **[MUST]** 이름은 의도를 드러냅니다.
  - 변수·함수: `camelCase` / 상수: `UPPER_SNAKE_CASE` / 클래스: `PascalCase`
  - Boolean: `is`, `has`, `can`, `should` 접두사
  - 이벤트 핸들러: `handle` 접두사 (`handleSubmit`)
  - DOM 참조: 접미사 (`modalEl`, `buttonEls`)
- **[MUST]** 매직 넘버·문자열은 상수로 분리합니다.
- **[MUST]** JSDoc으로 공개 함수의 파라미터·반환값을 문서화합니다.

### DOM·이벤트
- **[MUST]** 선택은 `data-js-*` 속성을 기준으로 합니다. 스타일 클래스로 선택하지 않습니다.
- **[MUST]** 동적 목록에는 **이벤트 위임**을 씁니다.
- **[MUST]** 이벤트 리스너를 추가하는 모듈은 해제 방법(`destroy()` 또는 `AbortController`)을 제공합니다.
- **[MUST]** 스타일 변경은 클래스 토글(`classList`)로 하고, `element.style`로 값을 직접 쓰지 않습니다. (동적 계산값은 CSS 변수 `style.setProperty('--x', v)`로 전달)
- **[MUST]** 스크롤·리사이즈 핸들러는 `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame`, throttle/debounce로 최적화합니다. passive 리스너를 적극 사용합니다.
- **[MUST]** 레이아웃 읽기와 쓰기를 한 프레임 안에서 섞지 않습니다. (layout thrashing 방지)
- **[MUST NOT]** `document.write`, `eval`, `new Function`, 동기 XHR을 쓰지 않습니다.

### 비동기·에러·상태
- **[MUST]** `fetch`는 `api.js` 같은 단일 래퍼를 거치며, 래퍼에서 타임아웃, 상태코드 검사, JSON 파싱 실패, 네트워크 오류를 처리합니다.
- **[MUST]** `async/await` + `try/catch`를 쓰고, 에러를 삼키지 않습니다. 사용자에게 보이는 오류 UI와 개발자용 로그를 분리합니다.
- **[MUST]** 로딩·성공·실패·빈 결과 4개 상태를 모두 구현합니다.
- **[MUST]** `localStorage`/`sessionStorage` 접근은 래퍼를 통하고 `try/catch`로 감쌉니다. 민감정보는 저장하지 않습니다.
- **[SHOULD]** 상태가 복잡해지면 단순한 상태 객체 + 렌더 함수 패턴을 쓰고, 상태는 한 곳에서만 변경합니다.
- **[SHOULD]** 컴포넌트는 `class` 또는 팩토리 함수로 `init(root)` 패턴을 따릅니다. 한 컴포넌트가 여러 인스턴스로 동작해야 합니다.

### 금지 사항
- **[MUST NOT]** 불필요한 라이브러리(jQuery, lodash 등)를 추가하지 않습니다. 네이티브 API로 해결합니다.
- **[MUST NOT]** `console.log`를 커밋하지 않습니다. (`console.warn/error`는 의도적 경우만)
- **[MUST NOT]** `setTimeout`으로 타이밍 버그를 덮지 않습니다. 원인을 해결합니다.
- **[MUST NOT]** 주석 처리된 죽은 코드를 남기지 않습니다.

## B4. 접근성 구현 (WCAG 2.2 AA)

- **[MUST]** 키보드만으로 모든 기능을 사용할 수 있어야 합니다. 탭 순서는 DOM 순서와 일치하며, `tabindex`는 `0` 또는 `-1`만 씁니다. 양수 값 금지.
- **[MUST]** 스킵 링크, 랜드마크(`header/nav/main/footer`), 적절한 제목 구조를 제공합니다.
- **[MUST]** 네이티브 요소로 해결 가능하면 ARIA를 쓰지 않습니다. ARIA를 쓸 때는 역할·상태·속성을 모두 올바르게 구현합니다. (ARIA 첫 번째 규칙)
- **[MUST]** 모달/다이얼로그: `<dialog>` 우선, 열릴 때 포커스 이동, 포커스 트랩, `Esc` 닫기, 닫힐 때 트리거로 포커스 복귀, 배경 스크롤 잠금을 구현합니다.
- **[MUST]** 탭, 아코디언, 드롭다운, 메뉴는 WAI-ARIA Authoring Practices의 키보드 패턴(방향키, Home/End 등)을 따릅니다.
- **[MUST]** 동적 변경 알림은 `aria-live`(polite/assertive)로 전달합니다.
- **[MUST]** 아이콘 전용 버튼은 `aria-label`이 있고, 장식 아이콘은 `aria-hidden="true"`입니다.
- **[MUST]** `:focus-visible` 스타일을 제거하지 않습니다. 모달 등에서 포커스가 가려지지 않도록 `scroll-margin`을 지정합니다.
- **[MUST]** 자동 갱신·시간 제한이 있는 UI는 사용자가 제어(정지, 연장)할 수 있어야 합니다.
- **[SHOULD]** 정기적으로 axe, Lighthouse 접근성 점검과 키보드/화면 낭독기 수동 점검을 병행합니다.

## B5. 성능

목표(모바일, 4G 시뮬레이션 기준): **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**, Lighthouse Performance ≥ 90

- **[MUST]** 이미지: `loading="lazy"`(뷰포트 하단), `decoding="async"`, `srcset`/`sizes`로 반응형 제공, LCP 이미지는 lazy 금지 + `fetchpriority="high"`를 지정합니다.
- **[MUST]** 폰트: 셀프 호스팅 woff2, 핵심 폰트만 `<link rel="preload" as="font" crossorigin>`, `font-display: swap`을 지정합니다.
- **[MUST]** JS는 `type="module"`(기본 defer)로 로드합니다. 렌더 차단 스크립트를 쓰지 않습니다.
- **[MUST]** CSS는 크리티컬 부분이 과도하지 않게 유지하고, 페이지 전용 CSS는 해당 페이지에서만 로드합니다.
- **[MUST]** 레이아웃 이동 방지: 이미지·iframe·광고 영역의 크기를 사전 확보합니다.
- **[MUST]** 3rd party 스크립트는 사용자 승인 후에만 도입하며, 지연 로드합니다.
- **[MUST]** 애니메이션은 compositor 속성(`transform`, `opacity`)만 씁니다. `will-change`는 필요한 요소에 일시적으로만 지정합니다.
- **[SHOULD]** 파일 크기 예산: 페이지당 JS 합계 100KB(gzip) 이하, CSS 50KB(gzip) 이하, 초기 이미지 합계 500KB 이하를 권장합니다. 초과 시 사유를 기록합니다.
- **[SHOULD]** 정적 자산에는 장기 캐시 + 파일명 해시(또는 쿼리 버전) 전략을 씁니다.

## B6. SEO·메타

- **[MUST]** 페이지마다 고유한 `title`, `meta description`, `canonical`을 지정합니다.
- **[MUST]** Open Graph / Twitter Card 기본 메타(`og:title`, `og:description`, `og:image`, `og:url`)를 제공합니다.
- **[MUST]** `robots.txt`, `sitemap.xml`, favicon(SVG + PNG 폴백), `manifest`(필요 시)를 둡니다.
- **[MUST]** 의미 있는 URL(kebab-case, 소문자)과 링크 텍스트("여기 클릭" 금지)를 사용합니다.
- **[SHOULD]** 구조화 데이터(JSON-LD)를 적합한 페이지(Organization, Article, Product, BreadcrumbList 등)에 추가합니다.

## B7. 보안

- **[MUST]** 사용자 입력·외부 데이터를 `innerHTML`, `outerHTML`, `insertAdjacentHTML`로 삽입하지 않습니다. `textContent` 또는 `createElement`를 씁니다. HTML 삽입이 불가피하면 검증된 sanitizer를 거칩니다.
- **[MUST]** 외부 링크(`target="_blank"`)에는 `rel="noopener noreferrer"`를 붙입니다.
- **[MUST]** 비밀키, 토큰, 개인정보를 클라이언트 코드·저장소에 넣지 않습니다.
- **[MUST]** 외부 리소스 로드 시 HTTPS만 쓰고, 가능한 경우 SRI(`integrity`)를 적용합니다.
- **[MUST]** iframe 임베드는 `sandbox`와 `allow` 속성을 최소 권한으로 지정합니다.
- **[SHOULD]** 배포 시 CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` 헤더를 적용합니다. (인라인 스크립트 금지 규칙은 CSP 적용을 쉽게 합니다.)
- **[SHOULD]** 개인정보를 수집하는 폼은 목적·보관기간·동의 UI를 법적 요건에 맞춰 제공합니다. (관련 법규는 서비스 지역 기준으로 별도 확인)

## B8. 코드 품질·도구·협업

- **[MUST]** Prettier(포맷), ESLint(JS), Stylelint(CSS), HTMLHint 또는 동급 검사를 통과해야 합니다. 경고를 무시하려면 사유 주석이 필요합니다.
- **[MUST]** 주석은 "무엇"이 아니라 **"왜"**를 설명합니다. 비직관적 결정, 브라우저 버그 우회, 접근성 의도는 반드시 주석을 남깁니다.
- **[MUST]** 복붙 코드 금지: 동일 로직이 2곳에 반복되면 공통화를 검토하고, 3곳이면 반드시 공통화합니다. (Rule of Three)
- **[MUST]** Git 커밋은 Conventional Commits를 따릅니다: `feat: ... / fix: ... / style: ... / refactor: ... / docs: ... / chore: ...`. 한 커밋은 한 의도입니다.
- **[MUST]** 브랜치명: `feature/...`, `fix/...`, `chore/...` (kebab-case)
- **[SHOULD]** 크로스브라우저/디바이스 수동 점검 목록을 README에 유지합니다.
- **[SHOULD]** 순수 함수 유틸(`utils/`)은 단위 테스트 대상으로 합니다. (Node 내장 test runner 등 최소 도구)
- **[SHOULD]** 중요한 사용자 흐름(주문, 가입, 문의)은 E2E 점검 시나리오를 문서화합니다.

---

# PART C. 에이전트 전용 하드 룰

AI 에이전트가 특히 자주 위반하는 항목을 별도로 못박습니다.

1. **[MUST NOT]** 디자인 토큰에 없는 색·간격·폰트 크기를 임의로 만들지 않습니다. 필요하면 토큰 추가를 먼저 제안합니다.
2. **[MUST NOT]** 사용자가 요청하지 않은 기능·애니메이션·섹션·페이지를 추가하지 않습니다.
3. **[MUST NOT]** 동일한 컴포넌트를 페이지마다 다시 만들지 않습니다. 기존 컴포넌트를 import/재사용합니다.
4. **[MUST NOT]** 인라인 스타일, 인라인 스크립트, `!important`, `var`, `innerHTML`(사용자 데이터), `console.log`를 남기지 않습니다.
5. **[MUST NOT]** 그럴듯한 가짜 데이터(연락처, 사업자번호, 후기, 통계)를 실제 값처럼 채우지 않습니다. 필요하면 `TODO:` 표기와 함께 사용자에게 알립니다.
6. **[MUST]** 구현 후 모바일(375px)과 데스크톱(1280px) 두 해상도를 기준으로 레이아웃·오버플로·포커스 이동을 자체 점검합니다.
7. **[MUST]** 변경한 파일 목록, 추가한 토큰/컴포넌트, 적용한 가정, 미해결 이슈를 결과 보고에 포함합니다.
8. **[MUST]** 확신이 없는 브라우저 지원·표준 동작은 단정하지 않고 "확인 필요"로 표시합니다.
9. **[MUST]** 한 번에 한 가지 작업 단위로 구현합니다. (예: 헤더 → 푸터 → 히어로 순으로 나누어 진행)
10. **[MUST]** 기존 코드 스타일이 이 문서와 충돌하면 임의로 대규모 리팩터링하지 않고, 충돌 지점을 보고한 뒤 지시를 따릅니다.
11. **[MUST NOT]** `.inner-box` 외의 이름(`container`, `wrapper`, `wrap`, `inner` 등)으로 폭 제한 박스를 만들지 않습니다.
12. **[MUST NOT]** 겉박스·속박스·파티션 레벨에 `display: grid`를 쓰지 않습니다.
13. **[MUST NOT]** 듀오링고 로고, 마스코트(Duo), 캐릭터 일러스트, 공식 이미지 파일을 복제·임베드하지 않습니다. 대체 자리표시 영역만 만들고 사용자에게 에셋 제공을 요청합니다.
14. **[MUST NOT]** PART F의 토큰 값을 추측으로 바꾸지 않습니다. 값이 "정확하지 않음/추측"으로 표기된 항목은 사용자 확인 전까지 PART F에 적힌 기본값만 씁니다.
15. **[MUST NOT]** 원본 사이트의 `viewport` 설정(`user-scalable=no`)을 따라 하지 않습니다. 확대 제한은 접근성 위반입니다.

---

# PART D. 완료 정의 (Definition of Done)

모든 항목이 충족되어야 작업이 완료됩니다.

### 디자인
- [ ] 토큰 외 하드코딩 값 없음
- [ ] 320 / 768 / 1024 / 1280px 레이아웃 정상
- [ ] 텍스트 4.5:1, UI 3:1 대비 충족
- [ ] 모든 인터랙션 상태(hover/focus/active/disabled/loading/error) 구현
- [ ] 로딩·빈·오류 상태 화면 존재

### 레이아웃 (PART E)
- [ ] 모든 겉박스(header / main>section / footer)에 `.inner-box`가 직계 자식 1개
- [ ] `.inner-box`에 `max-width` + 중앙정렬 적용, 미지정 영역은 1920px
- [ ] 파티션은 flex, 줄바꿈 필요 파티션에만 `flex-wrap`
- [ ] 겉박스·속박스·파티션에 `display: grid` 없음 (내용박스만 허용, 사유 주석 있음)
- [ ] 박스 간격은 겉박스 padding / 파티션 gap으로 처리, 임의 margin 없음

### 듀오링고 스펙 (PART F)
- [ ] 색·반경·간격·그림자가 PART F 토큰에서 왔는가 (원본 hex 직접 기입 금지)
- [ ] 버튼에 4px 단색 립 + 눌림(translateY) 상태가 있는가
- [ ] 카드는 2px `Swan` 윤곽선, 블러 그림자 없음
- [ ] 텍스트는 Eel(`#4B4B4B`) 기반, 순수 검정 없음
- [ ] §F8 임시 예외 목록 외의 대비 미달이 없는가

### 마크업·스타일
- [ ] 시맨틱 요소 사용, h1 1개, 제목 레벨 순서 유지
- [ ] 인라인 스타일·핸들러 없음, `!important` 없음
- [ ] BEM 네이밍, `@layer` 순서 준수, 선택자 구체성 기준 충족
- [ ] Stylelint / HTMLHint 통과

### 스크립트
- [ ] ES Module, 전역 오염 없음, `var`/`eval` 없음
- [ ] 모든 비동기 처리에 에러·로딩 상태 있음
- [ ] 이벤트 위임·해제 처리
- [ ] ESLint 통과, `console.log` 없음

### 접근성·성능·보안
- [ ] 키보드만으로 전체 기능 사용 가능, 포커스 링 보임
- [ ] `prefers-reduced-motion` 대응
- [ ] 이미지 alt/크기 지정, LCP 이미지 최적화
- [ ] Lighthouse 모바일: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] 외부 링크 `rel` 처리, 사용자 데이터 `textContent` 삽입

### 보고
- [ ] 변경 파일, 신규 토큰/컴포넌트, 가정, 미해결 이슈를 보고함

---

# PART E. 레이아웃 규약 (이 프로젝트 고유 규칙)

> 원칙: **겉박스 > 속박스 > 파티션** 3단 구조로 단순화합니다. 박스 이름과 역할을 고정해, 어떤 페이지에서도 같은 골격이 반복되게 합니다.

## E1. 용어 정의

| 용어 | 대상 | 역할 |
|---|---|---|
| **겉박스** | `header`, `main > section`, `footer` | 가로 100%. 배경색·테두리·세로 패딩(섹션 간격)을 담당합니다. 폭 제한은 하지 않습니다. |
| **속박스** | `.inner-box` | 겉박스의 **직계 자식 1개**. `max-width` + 중앙정렬 + 좌우 패딩을 담당합니다. |
| **파티션** | `.part` (직계 자식) | 속박스 안의 가로 띠 하나. **flex 박스**이며 내용 요소를 배치합니다. |
| **내용박스** | 파티션 안의 콘텐츠 단위 (카드 묶음, 갤러리, 목록 등) | 실제 콘텐츠를 담습니다. **여기에만** 필요 시 grid를 허용합니다. |

허용되는 최대 깊이: `겉박스 > .inner-box > .part > 내용박스`. 이보다 깊은 래퍼를 새로 만들지 않습니다.

## E2. 겉박스 전체 구조

**[MUST]** 모든 페이지의 body 직계 구조는 `header + main + footer`이고, `main`의 직계 자식은 `section`뿐입니다.

```html
<body>
  <header class="site-header">
    <div class="inner-box">
      <div class="part">...</div>
    </div>
  </header>

  <main id="main">
    <section class="section">
      <div class="inner-box">
        <div class="part">...</div>
        <div class="part">...</div>
      </div>
    </section>
    <section class="section section--tinted">...</section>
  </main>

  <footer class="site-footer">
    <div class="inner-box">
      <div class="part">...</div>
    </div>
  </footer>
</body>
```

- **[MUST]** `main` 자체에는 `.inner-box`, 배경, 패딩을 주지 않습니다. 겉박스는 `section`입니다.
- **[MUST]** 겉박스 클래스는 `.site-header`, `.section`(+`.section--변형`), `.site-footer`로 고정합니다.
- **[MUST]** 한 겉박스에는 `.inner-box`가 **정확히 1개**입니다. `.inner-box` 안에 `.inner-box`를 중첩하지 않습니다.
- **[MUST]** 겉박스에는 `max-width`를 주지 않습니다. (배경이 화면 끝까지 닿아야 합니다.)
- **[MUST]** 겉박스 사이의 간격은 겉박스의 `padding-block`으로만 만듭니다. 겉박스에 `margin`을 쓰지 않습니다.

## E3. 속박스 `.inner-box`

- **[MUST]** 폭을 제한하는 박스의 이름은 **`.inner-box`로 일원화**합니다. `container`, `wrapper`, `wrap`, `inner`, `content-box` 등 다른 이름을 쓰지 않습니다.
- **[MUST]** `.inner-box`는 `max-width` + 좌우 중앙정렬을 가집니다.
- **[MUST]** **원본 사이트에서 max-width가 확인되는 영역은 그 값**을 쓰고, **확인되지 않는 영역은 `1920px`** 을 씁니다.
- **[MUST]** `max-width` 값은 `.inner-box`에 직접 쓰지 않고 `--inner-max` 변수로 주입합니다. 영역별 값은 겉박스(또는 겉박스 변형 클래스)에서 재정의합니다.
- **[MUST]** `.inner-box`의 `padding-block`은 0입니다. 세로 간격은 겉박스가 담당합니다.

```css
@layer layout {
  :root {
    --inner-max-fallback: 1920px;   /* 원본에서 max-width 미확인 시 */
    --inner-gutter: var(--space-4); /* 모바일 좌우 패딩 */
  }
  @media (min-width: 768px) {
    :root { --inner-gutter: var(--space-6); }
  }

  .inner-box {
    display: flex;
    flex-direction: column;
    gap: var(--part-gap, var(--space-8));
    width: 100%;
    max-width: var(--inner-max, var(--inner-max-fallback));
    margin-inline: auto;            /* 이 margin만 허용 */
    padding-inline: var(--inner-gutter);
  }
}
```

> `.inner-box`를 `flex column + gap`으로 둔 것은 파티션 사이 간격을 margin 없이 처리하려는 제안입니다. (사용자 규칙에는 명시되지 않은 부분이므로 변경 가능합니다.)

## E4. 파티션 `.part`

- **[MUST]** 파티션은 기본적으로 **flex 박스**입니다. `display: flex`를 기본으로 하고, 방향(`flex-direction`)을 의도에 맞게 명시합니다.
- **[MUST]** **내용이 줄바꿈될 수 있는 파티션에만 `flex-wrap: wrap`** 을 적용합니다. (예: 카드 나열, 태그·언어 목록, 버튼 그룹) 한 줄 유지가 의도인 파티션(헤더 내비 등)에는 `nowrap`을 명시합니다.
- **[MUST]** 파티션 안 요소 사이 간격은 `gap`으로만 줍니다. 자식에 `margin`으로 간격을 주지 않습니다.
- **[MUST]** 파티션 자식의 크기는 `flex: 1 1 <basis>` 패턴으로 지정하고, 퍼센트 `width` 하드코딩을 쓰지 않습니다. 텍스트가 들어가는 자식에는 `min-width: 0`을 줍니다.
- **[MUST]** 파티션에는 `padding`을 주지 않습니다. (간격은 gap, 안쪽 여백은 내용박스/컴포넌트가 담당)
- **[MUST NOT]** 파티션 안에 파티션을 중첩하지 않습니다. 구조가 복잡해지면 파티션을 분할합니다.
- **[MUST]** 모바일 우선입니다. 세로 쌓임이 기본이고, 768px 이상에서 가로로 전환합니다.

```css
@layer layout {
  .part {
    display: flex;
    gap: var(--part-inner-gap, var(--space-4));
    min-width: 0;
  }
  .part--wrap { flex-wrap: wrap; }
  .part--nowrap { flex-wrap: nowrap; }

  /* 모바일: 세로 → 768px 이상: 가로 */
  .part--stack { flex-direction: column; }
  @media (min-width: 768px) {
    .part--stack { flex-direction: row; }
  }

  .part--center  { align-items: center; justify-content: center; }
  .part--between { justify-content: space-between; align-items: center; }
}
```

> `.part--*` 수식어 이름은 제안입니다. 프로젝트 시작 시 확정하고 이후 변경하지 않습니다.

## E5. 박스별 padding / margin 책임

| 박스 | padding | margin | gap |
|---|---|---|---|
| 겉박스 | `padding-block` (섹션 간격 토큰) | **금지** | - |
| 속박스 `.inner-box` | `padding-inline` (거터)만 | `margin-inline: auto`만 | 파티션 간 간격 |
| 파티션 `.part` | **금지** | **금지** | 내용 요소 간 간격 |
| 내용박스/컴포넌트 | 허용 (카드 16px 등 PART F) | 외부 margin 금지 | 내부 요소 간 간격 |

- **[MUST]** margin 허용 예외는 ① `.inner-box`의 `margin-inline: auto` ② 본문 글 흐름(제목-문단) 내부 간격(부모 `gap` 사용을 우선) 두 가지뿐입니다.

## E6. Grid 사용 규칙

- **[MUST NOT]** 겉박스, `.inner-box`, `.part` 레벨에 `display: grid`, `grid-template-*`, `grid-area`를 쓰지 않습니다.
- **[MAY]** **내용박스에 한해**, 같은 규격의 항목을 2차원으로 정렬해야 하고 `flex-wrap`으로 열 맞춤이 불가능할 때 grid를 씁니다.
- **[MUST]** grid를 쓴 내용박스는 클래스에 `--grid` 수식어를 붙이고(예: `.course-list--grid`), CSS 상단에 사용 사유를 주석으로 남깁니다.
- **[SHOULD]** `grid-template-columns: repeat(auto-fit, minmax(<min>, 1fr))` 형태로 미디어쿼리 없이 반응하게 만듭니다.

## E7. 레이아웃 안티패턴

- `.inner-box` 없이 섹션 안에 바로 콘텐츠를 두는 것
- `.container`, `.wrapper` 등 별칭 박스를 추가로 만드는 것
- 겉박스에 `max-width`를 주고 배경이 잘리는 것
- 파티션에 `padding`/`margin`을 주어 간격이 이중으로 생기는 것
- 파티션을 3단 이상 중첩하는 것
- 파티션 레벨 grid, 12컬럼 그리드 시스템 도입
- `margin-top`으로 섹션·파티션 간격을 만드는 것

---

# PART F. 듀오링고 전용 스펙 (디자인 동일, 레이아웃은 PART E)

## F1. 출처와 신뢰도

- **[실측]** 사용자가 제공한 원본 CSS 번들(`css/*.css` 10개, 압축본)을 직접 분석했습니다. 사이트 본체 스타일(`app-*.css` 등)에서 타이포 토큰, 버튼 구조, 브레이크포인트, 컨테이너 폭, 패딩, 반경, 보더, 그림자, 전환 값을 추출했습니다.
- **[실측 한계]**
  - 색상은 `rgb(var(--color-snow))`처럼 **변수 이름으로만 쓰이고, 실제 RGB 값은 제공된 파일에 정의되어 있지 않습니다.** 따라서 hex 값은 이전 조사(공개 브랜드 가이드·제3자 정리 문서)의 값을 그대로 유지합니다. 변수 **이름과 사용 위치**만 실측입니다.
  - 번들에는 reCAPTCHA, Google 원탭 로그인, KaTeX 수식 스타일 등 **서드파티 CSS가 섞여 있습니다.** 해당 값(Roboto, `#1a73e8` 등)은 이 프로젝트에 반영하지 않습니다.
  - zip에는 **JS 파일이 없었습니다.** (`css/` 10개 + `html/` 3개뿐이며, `html/anchor.html`은 reCAPTCHA 프레임, 나머지 2개는 빈 페이지입니다.) JS 동작 규칙은 이번에 보완하지 못했습니다.
  - 압축된 클래스명(`_1VYyp` 등)은 의미 없는 해시이므로 이 프로젝트에서 사용하지 않습니다.
- **[MUST]** 구현 전에 원본 사이트를 브라우저 개발자 도구로 열어 색상 변수의 실제 값과 헤더·푸터 구조를 대조하고, 불일치 시 이 문서의 값을 수정합니다.
- 표기: **실측** = 제공된 CSS에서 직접 확인 / **사실** = 복수 출처 일치 / **추론** = 일부 근거 / **추측** = 근거 약함 / **정확하지 않음** = 출처 간 불일치(이 문서의 선택값을 기본값으로 사용)

## F2. 색상 토큰

### F2.0 실측: 원본이 사용하는 색상 변수 이름 (값은 CSS에 없음)

원본 CSS는 색을 `rgb(var(--color-이름))` 형태(공백 구분 RGB 채널 변수)로 참조합니다. 사용 빈도 상위: `snow`(96) / `swan`(88) / `snow-always-light`(82) / `macaw`(72) / `hare`(47) / `eel`(39) / `wolf`(28) / `owl`(24) / `polar`(24) / `whale`(15) / `cardinal`(14) / `bee`(8) / `fox`(6) / `beetle`(2).

- **[실측]** `*-always-light` 변수가 별도로 존재합니다. 원본은 테마(다크) 전환 시에도 라이트 값을 유지해야 하는 영역을 구분합니다. (**추론**: 원본에 다크 테마가 있습니다.)
- **[추론]** `--color-owl`은 진행률 바 등에 쓰이는 **주 초록(Feather Green 계열)** 입니다. 이 프로젝트에서는 `--color-feather-green`과 같은 값으로 두고 이름만 병기합니다.
- **[SHOULD]** 투명도 변형이 필요한 색은 원본처럼 RGB 채널 변수(`--color-snow-rgb: 255 255 255`)를 두고 `rgb(var(--color-snow-rgb) / 0.4)`로 씁니다. (원본: 비활성 배경 `snow` 40% 투명)

### F2.1 Primitive

| 토큰 | HEX | 용도 | 신뢰도 |
|---|---|---|---|
| `--color-feather-green` | `#58CC02` | 브랜드 주색, 주요 CTA, 정답 | 사실 |
| `--color-tree-green` | `#58A700` | 초록 버튼 하단 립, 눌림 상태, 정답 텍스트 | 사실 |
| `--color-mask-green` | `#89E219` | 밝은 보조 초록, 성공 하이라이트 | 사실 |
| `--color-macaw` | `#1CB0F6` | 보조 CTA, 선택 상태 | 사실 |
| `--color-whale` | `#1899D6` | 파란 버튼 립 | 추론 |
| `--color-cardinal` | `#FF4B4B` | 오답, 오류, 파괴적 동작 | 사실 |
| `--color-cardinal-dark` | `#EA2B2B` | 빨간 버튼 립 | **정확하지 않음** (다른 출처 `#CC3B3B`) |
| `--color-bee` | `#FFC800` | XP, 보상 | 사실 |
| `--color-fox` | `#FF9600` | 연속 학습(스트릭), 경고 | 사실 |
| `--color-beetle` | `#CE82FF` | 특별 이벤트, 장식 | 추론 |
| `--color-eel` | `#4B4B4B` | 기본 텍스트 | 사실 |
| `--color-wolf` | `#777777` | 보조 텍스트(원본값) | 사실 |
| `--color-hare` | `#AFAFAF` | placeholder, 비활성 텍스트 | 사실 |
| `--color-swan` | `#E5E5E5` | 기본 보더, 구분선, 비활성 배경 | 사실 |
| `--color-polar` | `#F7F7F7` | 보조 배경 | 사실 |
| `--color-snow` | `#FFFFFF` | 기본 배경 | 사실 |

### F2.2 틴트 (상태 배경)

| 토큰 | HEX | 용도 | 신뢰도 |
|---|---|---|---|
| `--color-macaw-tint` | `#DDF4FF` | 선택된 타일/카드 배경 | 추론 |
| `--color-green-tint` / `-border` | `#D7FFB8` / `#A5ED6E` | 정답 피드백 바 | 추론 |
| `--color-red-tint` / `-border` | `#FFDFE0` / `#FFB3B3` | 오답 피드백 바 | 추론 |
| `--color-red-tint-field` | `#FFF0F0` | 입력 오류 배경 | 추론 |

### F2.3 Semantic (컴포넌트는 이것만 참조)

```css
:root {
  --color-bg:             var(--color-snow);
  --color-bg-subtle:      var(--color-polar);
  --color-text:           var(--color-eel);
  --color-text-secondary: #757575;  /* 원본 Wolf #777777 → AA 보정 (F8 EX-03) */
  --color-text-disabled:  var(--color-hare);
  --color-border:         var(--color-swan);

  --color-primary:        var(--color-feather-green);
  --color-primary-lip:    var(--color-tree-green);
  --color-accent:         var(--color-macaw);
  --color-accent-lip:     var(--color-whale);
  --color-danger:         var(--color-cardinal);
  --color-danger-lip:     var(--color-cardinal-dark);
  --color-reward:         var(--color-bee);
  --color-streak:         var(--color-fox);
  --color-focus:          var(--color-whale);  /* 대비 약 3.2:1 */
}
```

- **[MUST]** 텍스트는 Eel(`#4B4B4B`) 기반입니다. `#000` 순수 검정을 쓰지 않습니다.
- **[MUST]** Polar(`#F7F7F7`) 배경 위 텍스트는 Eel을 씁니다. (`--color-text-secondary`는 흰 배경에서만 4.5:1을 충족합니다.)
- **[MUST]** 초록은 "해야 할 행동" 또는 "정답"에만 씁니다. Bee/Fox/Beetle은 보상·상태 표시에만 씁니다.
- **[MUST]** 다크모드는 이번 범위에서 지원하지 않으며 `color-scheme: light`를 명시합니다. (원본에는 다크 테마가 있을 것으로 **추론**되지만 다크 값이 제공되지 않았습니다. 지원이 필요하면 사용자 확인 후 별도 설계)
- **[MUST NOT]** 컴포넌트 CSS에 위 hex를 직접 쓰지 않습니다.

## F3. 타이포그래피

### F3.1 서체

- **[실측]** 원본 CSS의 서체 선언은 세 가지입니다: 본문·UI·라벨·푸터 링크는 `duolingo-sans`(+`PingFang SC`, `Noto Sans Math` 폴백), 일부 제목·강조는 `feather`, 일부 요소는 `DIN Next for Duolingo`입니다. 모두 자체/전용 서체이므로 이 프로젝트에 포함하지 않습니다. (이전 문서의 "DIN Next Rounded"는 **정정**: 실제 선언명은 `duolingo-sans`, `feather`, `DIN Next for Duolingo`)
- **[MUST]** 대체 서체는 **Nunito**(Latin)를 셀프 호스팅(woff2, `font-display: swap`)하고, 한글 글리프는 **Pretendard**로 폴백합니다. (두 서체의 라이선스 조건은 도입 전에 확인합니다. **추론**: Nunito는 둥근 형태가 유사해 무료 대체로 널리 쓰입니다.)

```css
:root {
  --font-display: "Nunito", "Pretendard", "Noto Sans KR", system-ui, -apple-system, sans-serif;
  --font-body:    "Nunito", "Pretendard", "Noto Sans KR", system-ui, -apple-system, sans-serif;
}
```

- **[MUST]** 굵기는 **400(본문) / 700(제목·강조·버튼·라벨)** 2종입니다. (**실측**: 굵기 선언 700 79회, 400 41회, 500 5회, 900 1회 → 500·900은 쓰지 않습니다.) 얇은 굵기(300 이하)를 쓰지 않습니다.
- **[MUST]** 로드하는 폰트 파일은 Nunito 400/700, Pretendard 400/700만 허용합니다. (이전 문서의 800 굵기는 **삭제**: 원본 제목도 700입니다.)

### F3.2 타입 스케일

**[실측]** 원본이 `:root`에 정의한 텍스트 토큰입니다. (이전 문서의 2차 자료 기반 스케일은 **전부 교체**했습니다.) 모든 제목 자간은 `0`, 대소문자 변환은 `none`입니다.

| 토큰 | 용도 | 크기 / 줄높이 | 굵기 | 자간 / 변환 |
|---|---|---|---|---|
| `--text-page-title-lg` | 페이지 제목 (큰 화면) | 40px (2.5rem) / 44px (2.75rem) | 700 | 0 / none |
| `--text-page-title-sm` | 페이지 제목 (작은 화면) | 32px (2rem) / 36px (2.25rem) | 700 | 0 / none |
| `--text-heading-lg` | 제목 대 | 28px (1.75rem) / 32px (2rem) | 700 | 0 / none |
| `--text-heading-md` | 제목 중 | 24px (1.5rem) / 32px (2rem) | 700 | 0 / none |
| `--text-heading-sm` | 제목 소 | 20px (1.25rem) / 24px (1.5rem) | 700 | 0 / none |
| `--text-heading-xs` | 제목 극소 | 16px (1rem) / 20px (1.25rem) | 700 | 0 / none |
| `--text-body` | **본문 기본** | 20px (1.25rem) / 28px (1.75rem) | 400 (강조 700) | 0 / none |
| `--text-body-spacious` | 여유 있는 본문 | 20px / 32px (2rem) | 400 (강조 700) | 0 / none |
| `--text-caption` | 캡션·메타 | 16px (1rem) / 24px (1.5rem) | 400 (강조 700) | 0 / none |
| `--text-label-lg` | 큰 라벨 | 24px (1.5rem) / 24px | 700 | **0.04em / uppercase** |
| `--text-label-md` | 작은 라벨·버튼 | 16px (1rem) / 16px | 700 | **0.04em / uppercase** |

- **[추론]** 토큰 이름의 `large / small`(`medium`)은 뷰포트 단계입니다. 기본(모바일)은 `small`, 768px 이상에서 `large`를 적용합니다. (CSS에서 전환 기준 미디어쿼리는 확인하지 못했습니다.)
- **[실측]** UI 소형 텍스트는 토큰 외 값도 많이 쓰입니다. `font-size` 선언 빈도: 14px(31회), 15px(22회), 13px(11회), 16px(10회), 17px(10회), 19px(8회), 20px(7회). 푸터 링크는 `15px / 700 / 줄높이 22px`, 입력창은 `17px / 줄높이 25px`입니다. 이 값들은 `--text-ui-sm`(14px), `--text-ui`(15px), `--text-ui-lg`(17px) 토큰으로 두고 임의 값을 쓰지 않습니다.
- **[MUST]** 라벨(버튼 포함)은 **영문 대문자 + `letter-spacing: 0.04em`** 입니다. (**정정**: 이전 문서의 `0.8px`는 변형 1건에서만 확인되었고, 기본은 `0.04em`입니다.) **한글 라벨에는 자간을 주지 않습니다.** (`:lang(ko)`에서 `letter-spacing: 0`)
- **[MUST]** 제목·히어로는 `small`을 기본으로 하고 768px 이상에서 `large`로 올립니다. `clamp()`로 유동화할 경우 하한은 `small`, 상한은 `large` 값을 넘지 않습니다.
- **[MUST]** 한글은 `word-break: keep-all; overflow-wrap: break-word;`를 유지합니다.
- **[MUST]** 강조 숫자(XP, 스트릭, 퍼센트)는 `--text-heading-md` 이상 크기에 700으로 표시합니다. 숫자를 캡션 크기로 두지 않습니다. (`--text-stat` 토큰은 삭제)

## F4. 박스·간격·반경·보더·그림자

### F4.1 간격 (4px 기반)

**[실측]** `gap` 선언 빈도: 12px(7), 8px(6), 10px(5), 24px(4), 15px(3), 32px(3), 48px(3), 96px(2), 40px(2). `padding` 상위: `16px`, `12px 14px`, `12px 16px`, `0 16px`, `0 24px`, `0 40px`, `32px 16px`, `40px 24px`, `48px 0`, `96px 0`.

| 토큰 | 값 | 비고 |
|---|---|---|
| `--space-1` | 4px | |
| `--space-2` | 8px | gap 6회 |
| `--space-3` | 12px | gap **최다**, 입력창 패딩 |
| `--space-4` | 16px | |
| `--space-5` | 20px | |
| `--space-6` | 24px | 컨테이너 거터(앱형) |
| `--space-8` | 32px | 컨테이너 거터(모바일) |
| `--space-10` | 40px | 컨테이너 거터(태블릿) |
| `--space-12` | 48px | |
| `--space-16` | 64px | 푸터 하단 패딩 |
| `--space-24` | 96px | 푸터 상단 패딩(데스크톱) |

- **[MUST]** 10px, 14px, 15px, 9.5px 같은 비정규 값은 원본에 있지만 **토큰화하지 않습니다.** 가장 가까운 토큰(10→8 또는 12, 14→12 또는 16)으로 맞춥니다. 단, 입력창 패딩(`9.5px 14px`)과 버튼 높이는 F5에서 정한 값을 씁니다.

섹션(겉박스) 세로 패딩 — **[실측]** 푸터 기준:

| 토큰 | 값 | 적용 구간 |
|---|---|---|
| `--footer-pad-top` | 모바일/태블릿 `0` ~ `64px`, 데스크톱 `96px` | 푸터 링크 영역 (`64px 40px`@768, `96px 0 64px`@1080) |
| `--footer-pad-bottom` | `64px` | 전 구간 |
| `--section-pad-top` | `40px` | 본문 섹션 상단 (`40px 32px 64px`) |
| `--section-pad-bottom` | `64px` | 본문 섹션 하단 |
| `--page-pad-app` | `32px 16px` → 700px~ `40px 24px` | 앱형 와이드 콘텐츠 영역 |

- **[추론]** 일반 섹션 사이 세로 간격은 위 값(상단 40px, 하단 64px)에서 파생했습니다. 이전 문서의 `--section-y-*`(40/56/80px)는 **추측값이었으므로 삭제**했습니다.

### F4.2 `.inner-box` 폭·거터

**[실측]** 원본에서 `margin: 0 auto` + `max-width` 조합이 확인된 컨테이너입니다.

| 영역 | 구간 | `--inner-max` | 거터(좌우) |
|---|---|---|---|
| **푸터·본문 섹션 (3단 사다리)** | 0 ~ 767px | `375px` | `32px` |
| | 768px ~ | `768px` | `40px` |
| | 1080px ~ | `988px` | `0` |
| 앱형 와이드 콘텐츠 | 0 ~ 699px | 100% | `16px` (세로 `32px`) |
| | 700px ~ | `1140px` | `24px` (세로 `40px`) |
| 상단바(header) 내부 | 전 구간 | `1036px` (너비 100%, 행 높이 `52px`) | - |
| 위에서 확인되지 않은 영역 | 전 구간 | **`1920px`** (PART E §E3) | `32px` → `40px` |

- **[추론]** 상단바 `1036px`·행 높이 `52px`는 앱 화면 헤더에서 확인된 값이며, 마케팅 헤더와 같은지는 확인하지 못했습니다. 이 프로젝트의 `.site-header`에 적용하되 사용자 확인 대상입니다.
- **[MUST]** 3단 사다리는 `.site-footer`와 `.section--site` 변형에, 와이드 영역은 `.section--app` 변형에 변수로 주입합니다.

```css
@layer layout {
  .site-footer, .section--site { --inner-max: 375px; --inner-gutter: var(--space-8); }
  @media (min-width: 768px)  { .site-footer, .section--site { --inner-max: 768px; --inner-gutter: var(--space-10); } }
  @media (min-width: 1080px) { .site-footer, .section--site { --inner-max: 988px; --inner-gutter: 0; } }

  .section--app { --inner-gutter: var(--space-4); }
  @media (min-width: 700px)  { .section--app { --inner-max: 1140px; --inner-gutter: var(--space-6); } }

  .site-header { --inner-max: 1036px; }
}
```

- **[MUST]** 위 변수 주입 외에 `.inner-box`의 `max-width`를 직접 고치지 않습니다. 사다리에 없는 영역은 `1920px` 폴백을 그대로 씁니다.
- **[MUST]** `--inner-gutter: 0`이 되는 1080px 이상에서는 `max-width` 안에서 콘텐츠가 가장자리에 닿아도 되도록 내부 요소(카드 등)가 자체 패딩을 가집니다.
- **[실측]** 사이드 내비 폭은 `56px`(라벨 없음), 1160px 이상에서 `224px`입니다. 사이드 내비를 쓸 경우 이 값을 따릅니다.
- **[사용자 확인]** 푸터 링크 영역은 원본에서 grid(`repeat(5, 178px)` 등)로 만들어져 있습니다. 이 프로젝트에서는 PART E에 따라 **flex + wrap**으로 구현하고, 열 폭은 `flex: 0 0 178px`(데스크톱) / `216px`(768px 이상 3열)로 맞춥니다.

### F4.3 반경

**[실측]** `border-radius` 선언 빈도: 12px(21), 16px(11), 50%(10), 0(10), 2px(8), 8px(6), 6px(5), 5px(3). 카드 `--web-ui_card-border-radius` 기본 12px, 리스트 `--web-ui_list-border-radius` 12px.

| 토큰 | 값 | 용도 | 신뢰도 |
|---|---|---|---|
| `--radius-sm` | 8px | 작은 버튼, 칩 | 실측 |
| `--radius-md` | 12px | **카드**, 리스트, 입력창, 답안 타일 | 실측 |
| `--radius-lg` | 16px | **웹 버튼 기본** | 실측 |
| `--radius-circle` | 50% | 원형 아이콘 버튼, 아바타 | 실측 |
| `--radius-full` | 9999px | 프로그레스 바, 배지, 토글 | 추론 |

- **[실측·확정]** 원본 `:root`에 `--web-ui_button-border-radius: 16px`가 전역으로 선언되어 있습니다. (이전 문서의 "12px vs 16px 불일치"는 **해소**: 웹 버튼은 16px) 버튼 컴포넌트 기본값이 8px/12px인 변형은 소형·보조 버튼용입니다.
- **[정정]** 이전 문서에서 카드 반경을 16px로 적었으나, 원본 카드 변수 기본값은 **12px**입니다. 카드는 `--radius-md`를 씁니다.

### F4.4 보더·그림자(립)

**[실측]** 보더 선언 빈도: `2px solid`(66회), `1px solid`(16), `3px solid`(3), `6px solid`(2). `box-shadow` 주요 값은 아래와 같습니다.

| 토큰 | 값 | 용도 | 신뢰도 |
|---|---|---|---|
| `--border-card` | `2px solid var(--color-border)` | 카드, 입력창, 타일 | 실측 |
| `--lip-height` | `4px` (채워진 버튼) / `2px` (아웃라인·고스트) | 버튼 하단 립 | 실측 |
| `--shadow-lip` | `0 var(--lip-height) 0 <립 색>` | 버튼(`::before` 의사요소에 적용) | 실측 |
| `--shadow-lip-border` | `0 2px 0 var(--color-border)` | 카드·타일 하단 라인 | 실측 |
| `--shadow-soft` | `0 0 4px 1px rgba(0,0,0,.08)` | 팝오버·드롭다운 **한정** | 실측 |
| `--shadow-inset` | `inset 0 1px 1px rgba(0,0,0,.1)` | 입력창 안쪽 | 실측 |
| `--scrim` | `rgba(0,0,0,.4)` | 모달 배경 | 추측 (원본에서 2회 확인, 용도 미확정) |

- **[정정]** 이전 문서의 `--shadow-modal`(`0 8px 0 rgba(0,0,0,.05)`)은 원본 CSS에서 확인되지 않아 **삭제**했습니다. 카드 하단 라인은 `0 2px 0` 단색입니다. 카드에 4px 하단 보더를 쓰는 안은 폐기합니다.
- **[MUST NOT]** 블러가 큰 드롭섀도를 카드·버튼에 쓰지 않습니다. 립은 항상 **같은 계열의 더 어두운 단색**입니다. 블러 그림자(`--shadow-soft`)는 팝오버·드롭다운에만 허용합니다.
- **[MUST]** 원본 소스에서 `rgba(0,0,0,.14)` 등 3겹 블러 그림자가 보이지만 reCAPTCHA(서드파티) 스타일이므로 쓰지 않습니다.

### F4.5 z-index

**[실측]** 선언된 값: `-1`(립 의사요소), `1`, `2`, `10`, `100`, `101`, `300`, `310`, `315`, `320`, `322`, `324`, `9999`(서드파티). 이 프로젝트의 토큰은 다음 5단계로 단순화합니다. (**추론**: 용도 매핑은 값의 크기 순으로 정했습니다.)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--z-behind` | -1 | 버튼 립 의사요소 |
| `--z-raised` | 1 | 카드 겹침 |
| `--z-sticky` | 100 | 스티키 헤더·내비 |
| `--z-overlay` | 300 | 스크림, 드롭다운 |
| `--z-modal` | 320 | 모달, 바텀 시트 |

- **[MUST NOT]** 위 5개 외의 z-index 숫자를 직접 쓰지 않습니다.

## F5. 컴포넌트 박스 스펙

### F5.1 버튼

| 변형 | 배경 | 글자 | 립 | 비고 |
|---|---|---|---|---|
| Primary | `--color-primary` | 흰색 | `--color-primary-lip` | 뷰포트당 1개 |
| Accent | `--color-accent` | 흰색 | `--color-accent-lip` | 보조 긍정 행동 |
| Outline | 흰색 + `2px solid --color-border` | `--color-accent` 또는 Eel | `0 2px 0 --color-border` | "건너뛰기" 등 |
| Danger | `--color-danger` | 흰색 | `--color-danger-lip` | 오답, 삭제 |
| Disabled | `--color-border` | `--color-text-disabled` | 없음 | 클릭 불가 |

**[실측] 원본 버튼 구조** (압축 클래스명 대신 동작만 기록)

- 높이는 **`height` 고정**이며 값은 변형별로 `48px`(기본, 4회) / `50px`(2회) / `32px`(소형, 3회)입니다. 패딩은 `0 16px`(기본), `0 11px`, `0 7px`(소형)로 **가로 패딩만** 줍니다. (이전 문서의 `14px 24px`는 **정정·삭제**)
- 줄높이는 `calc(높이 - 립 높이)`로 잡아 글자가 립을 뺀 영역의 가운데에 오게 합니다.
- 립은 버튼 본체가 아니라 **`::before` 의사요소**가 만듭니다. 의사요소는 버튼과 같은 배경색·반경에 `box-shadow: 0 <립> 0`을 가지고 `z-index: -1`로 뒤에 깔립니다. 채워진 버튼의 립은 `4px`, 아웃라인 변형은 보더 `2px 2px 4px`(아래만 4px)입니다.
- 눌림(`:active`)은 버튼을 `translateY(립 높이) translateZ(0)`로 내리고 의사요소의 `box-shadow`를 `none`으로 만듭니다.
- 호버는 `filter: brightness(1.1)`(또는 변형에 따라 `.9`/`opacity(.8)`)이며 `@media (hover: hover)` 안에서만 적용합니다. 전환은 `filter .2s`와 `transform`(립 전환 변수)입니다.
- 라벨은 `font: 700 <크기> / <줄높이> duolingo-sans`, `letter-spacing: 0.04em`, 대문자입니다. 크기는 변형별로 14/15/16/17px입니다.
- 비활성은 글자 `hare`, 배경 `swan`입니다. (일부 변형은 `snow` 40% 투명)

**이 프로젝트 규격**

| 변형 | 높이 | 가로 패딩 | 립 | 용도 |
|---|---|---|---|---|
| 기본 | `48px` | `16px` | `4px` | 일반 버튼 |
| 대형 | `50px` | `16px` | `4px` | 주요 CTA (모바일 풀폭) |
| 소형 | `32px` | `11px` | `4px` | 데스크톱 보조 컨트롤 **한정** |

- 반경 `--radius-lg`(16px, 소형은 `--radius-sm` 8px), 글자 `--text-label-md`(16px) 기본 / 소형 `--text-ui-sm`(14px)
- **[MUST]** 소형(32px) 버튼은 모바일 화면에 쓰지 않습니다. 쓰더라도 A5의 44×44px 클릭 영역을 `::after`로 확장해 확보합니다.
- **[MUST]** 인접 버튼 사이 간격은 `--space-3`(12px) 이상입니다. (립이 가려지지 않도록)

```css
@layer components {
  .btn {
    --btn-height: 48px;
    --btn-lip: 4px;
    position: relative;
    isolation: isolate;                      /* ::before의 z-index:-1을 버튼 안에 가둠 */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    height: var(--btn-height);
    padding: 0 var(--space-4);
    border: 0;
    background: transparent;
    color: var(--btn-fg, #fff);
    font: 700 var(--text-label-md-size, 1rem) / calc(var(--btn-height) - var(--btn-lip)) var(--font-display);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      filter var(--duration-fast) ease,
      transform var(--duration-instant) ease;
  }
  .btn::before {
    content: "";
    position: absolute;
    inset: 0 0 0 0;
    z-index: var(--z-behind);
    border-radius: var(--radius-lg);
    background: var(--btn-bg);
    box-shadow: 0 var(--btn-lip) 0 var(--btn-lip-color);
  }
  .btn:lang(ko) { letter-spacing: 0; }
  .btn:active   { transform: translateY(var(--btn-lip)) translateZ(0); }
  .btn:active::before { box-shadow: none; }
  .btn:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 4px; }

  @media (hover: hover) {
    .btn:hover:not([disabled]) { filter: brightness(1.1); }
  }

  .btn--lg { --btn-height: 50px; }
  .btn--sm { --btn-height: 32px; padding: 0 11px; }
  .btn--primary { --btn-bg: var(--color-primary); --btn-lip-color: var(--color-primary-lip); }
  .btn--accent  { --btn-bg: var(--color-accent);  --btn-lip-color: var(--color-accent-lip); }
  .btn--danger  { --btn-bg: var(--color-danger);  --btn-lip-color: var(--color-danger-lip); }
  .btn[disabled], .btn[aria-disabled="true"] {
    --btn-bg: var(--color-border);
    --btn-fg: var(--color-text-disabled);
    cursor: not-allowed;
  }
  .btn[disabled]::before, .btn[aria-disabled="true"]::before { box-shadow: none; }

  @media (prefers-reduced-motion: reduce) {
    .btn { transition: none; }
  }
}
```

- **[MUST]** 버튼 립을 `box-shadow`로 만들기 때문에 눌림 시 `box-shadow`가 즉시 사라지게 합니다. (전환 없음) 이 컴포넌트에서 `transform`·`filter` 외에 별도 전환을 추가하지 않습니다. (A7 "transform/opacity만" 규칙과의 충돌 해소: 립은 전환하지 않고 즉시 전환)
- **[MUST]** `prefers-reduced-motion: reduce`에서 `transition: none`입니다. (**원본 CSS에는 이 미디어쿼리가 0건**이므로 이 프로젝트가 추가하는 규칙입니다.)

### F5.2 카드

- 배경 `--color-bg`, 보더 `--border-card`(2px), 반경 `--radius-md`(**12px**, 실측 `--web-ui_card-border-radius`), 패딩 `--space-4`(16px)
- **[실측]** 카드·타일 하단 라인은 `box-shadow: 0 2px 0 <보더색>`(`--shadow-lip-border`)입니다. 기본으로 적용합니다. (이전 문서의 "기본 립 없음" **정정**)
- 통계 카드는 패딩 `--space-5`(20px) — 추론
- 선택/활성: 보더 `--color-accent`, 배경 `--color-macaw-tint`
- **[MUST NOT]** 카드에 블러 그림자를 쓰지 않습니다.

### F5.3 입력창

- 배경 흰색, 보더 `--border-card`(2px), 반경 `--radius-md`(12px), 패딩 `9.5px 14px`, 글자 `17px / 줄높이 25px`(`--text-ui-lg`) — **실측**(패딩·글자·줄높이), 반경은 추론
- **[실측]** placeholder는 `hare` 색, 굵기 400, `opacity: 1`입니다.
- 포커스: 보더 `--color-accent` + 외곽 링(`outline: 2px solid --color-focus`, `outline-offset: 2px`)
- 오류: 보더 `--color-danger`, 배경 `--color-red-tint-field`, 하단 도움말 `--text-caption` `--color-danger`
- **[MUST]** 라벨은 항상 노출합니다. placeholder(Hare, 약 2.2:1)로 라벨을 대체하지 않습니다.

### F5.4 답안 타일 / 칩

- 배경 흰색, 보더 `--border-card`, 립 `--shadow-lip-border`(`0 2px 0`), 반경 `--radius-md`, 패딩 `--space-3 --space-4`(12px 16px), 글자 `--text-ui-lg`(17px)
- 선택됨: 보더 `--color-accent`, 배경 `--color-macaw-tint`

### F5.5 배지·필

- 반경 `--radius-full`, 패딩 `4px 10px`(카운터) / `2px 8px`(상태 배지), 글자 13px 또는 12px / 700

### F5.6 프로그레스 바

- 높이 `16px`, 트랙 `--color-border`, 채움 `--color-primary`, 반경 `--radius-full` — 사실
- **[MUST]** 채움 애니메이션은 `transform: scaleX()` + `transform-origin: left`로 구현합니다. (`width` 전환 금지)
- **[MUST]** `role="progressbar"`, `aria-valuenow/min/max`를 제공합니다.

### F5.7 피드백 바 (정답/오답)

- 정답: 배경 `--color-green-tint`, 텍스트 `--color-tree-green`, 상단 보더 `2px --color-green-tint-border`
- 오답: 배경 `--color-red-tint`, 텍스트 `--color-cardinal-dark`, 상단 보더 `2px --color-red-tint-border`
- **[MUST]** 정답·오답은 **색뿐 아니라 아이콘과 문구로도** 전달합니다. 오답 문구는 비난하지 않습니다.

### F5.8 모달

- 배경 흰색, 반경 `--radius-lg`, 패딩 `--space-6`(24px), 제목 `--text-heading`, 스크림 `--scrim`
- `<dialog>`, 포커스 트랩, `Esc` 닫기는 B4 규칙을 따릅니다.

## F6. 반응형·모션

- 브레이크포인트는 A4의 3단계(0 / 768 / 1024)를 씁니다. (**추론**: 원본 문서의 모바일 <768, 태블릿 768~1024, 데스크톱 >1024 구분)
- 데스크톱 전용 사이드 요소는 모바일에서 숨기는 대신 **세로로 재배치**합니다. (콘텐츠 누락 금지)
- 이미지·일러스트는 SVG 우선, 고정 비율 확보(`aspect-ratio`)로 레이아웃 이동을 막습니다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--duration-fast` | 150ms | 버튼 눌림, 호버 |
| `--duration-base` | 250ms | 화면 전환, 피드백 바 |
| `--duration-celebrate` | 400~600ms | XP 증가, 진행률 채움, 정답 연출 |
| `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | 등장 |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 퇴장 |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 양방향 전환 |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | **축하 연출에만** 허용 |

- **[MUST]** `--ease-bounce`는 정답·완료·보상 연출에만 씁니다. 일반 UI 전환에는 쓰지 않습니다.
- (신뢰도: 위 모션 값은 단일 정리 문서 기준의 **추론**입니다.)

## F7. 톤·카피

- 톤은 친근하고 격려하는 말투이며, 오답·실패를 비난하지 않습니다. (예: "틀렸어요!" 대신 정답을 담담히 제시)
- 문체는 **해요체**를 기본으로 제안합니다. (**추측**: 원본 한국어 문체는 직접 확인하지 못했습니다. 프로젝트 시작 시 확정)
- 버튼 라벨은 짧은 동사형으로 씁니다. (예: "계속하기", "시작하기", "확인")

## F8. 접근성 충돌 및 임시 예외

원본 디자인을 그대로 따르면 WCAG 2.2 AA 일반 텍스트 기준(4.5:1)에 미달하는 조합이 있습니다. 0.2의 우선순위 1순위(접근성)와 충돌하므로 **사용자 결정이 날 때까지 아래 범위 안에서만 임시 예외**로 허용합니다.

| ID | 조합 | 대비(계산) | 처리 |
|---|---|---|---|
| EX-01 | 흰 글자 on `#58CC02` (Primary 버튼) | 약 2.09:1 (**사실**: 출처 문서도 미달로 기록) | **임시 예외.** 아래 보완책 필수. 사용자 결정 필요 |
| EX-02 | 흰 글자 on `#1CB0F6` (Accent 버튼) | 약 2.44:1 (**사실**: 출처 문서도 미달로 기록) | **임시 예외.** 위와 동일 |
| EX-03 | `#777777` on 흰색 (보조 텍스트) | 약 4.48:1 (**추론**: 계산값, AA 근소 미달) | **수정 적용.** `#757575`로 보정(약 4.6:1) |
| EX-04 | `#757575` on `#F7F7F7` | 약 4.3:1 (계산값) | Polar 위에서는 Eel 사용 (F2.3) |
| EX-05 | Macaw 텍스트 링크 | 약 2.44:1 | **금지.** 텍스트 링크는 Eel + 밑줄. 색 링크가 필요하면 4.5:1 값을 사용자 승인 후 확정 |
| EX-06 | Hare `#AFAFAF` placeholder | 약 2.2:1 | 라벨 필수 노출로 보완 (F5.3) |

**EX-01/02 보완책 (임시):**
- 라벨은 `15px / 700` 이상, 높이 50px 이상, 하단 립 유지
- 버튼 형태(립·높이·반경)로 상호작용 요소임을 시각적으로 구분
- 포커스 링은 `--color-focus`(약 3.2:1)로 별도 확보
- **[MUST]** 이 문서를 받는 작업자는 최종 배포 전에 사용자에게 "원본 유지 / 대비 충족 대안(채움색을 더 어둡게 또는 글자색 변경)" 중 선택을 요청합니다. 대안 hex는 **추측으로 정하지 않고** 대비 계산 후 확정합니다.

## F9. 원본과 의도적으로 다르게 하는 항목

| 항목 | 원본 | 이 프로젝트 |
|---|---|---|
| viewport | `user-scalable=no` | 확대 허용 (접근성) |
| 레이아웃 | 원본 내부 레이아웃 | PART E 구조 (겉박스 > `.inner-box` > 파티션) |
| 서체 | Feather Bold / DIN Next Rounded | Nunito + Pretendard (라이선스) |
| 보조 텍스트 | `#777777` | `#757575` (AA 보정) |
| 로고·마스코트 | 듀오링고 자산 | **사용 금지**, 자리표시만 |

## F10. 구현 전 확인이 필요한 항목(실측 결과는 아래 확인)

1. 원본 개발자 도구로 `max-width`(섹션·헤더·푸터), 헤더 높이, 섹션 상하 패딩 실측
2. 버튼 반경 12px vs 16px, 패딩 `14px 20px` vs `14px 24px`
3. 본문 기본 굵기(400 / 500 / 700)와 크기(15px / 17px)
4. 빨간 버튼 립 `#EA2B2B` vs `#CC3B3B`
5. F8 EX-01·02 처리 방침 (원본 유지 / 대비 충족 대안)
6. 한국어 문체(해요체 / 합쇼체)
7. 로고·일러스트·아이콘 에셋 제공 여부

### F10.1 레이아웃 및 간격
- max-width: 섹션(1024px) / 헤더(1024px) / 푸터(375px) ※ 컨테이너 기준
- 헤더 높이: 72px
- 섹션 상하 패딩: 96px

### F10.2 버튼 스타일
- 버튼 반경: 12px
- 버튼 패딩: 0px 20px (실측 기준)

### F10.3 본문 텍스트
- 기본 굵기: 400 (Regular)
- 기본 크기: 17px

### F10.4 버튼 색상
- 빨간 버튼 립: #EA2B2B (Base) / #CC3B3B (Lip)

### F10.5 F8 EX-01·02 처리 방침
- 원본 유지

### F10.6 한국어 문체
- 해요체 ("~해요", "~였어요")

### F10.7 로고·일러스트·아이콘 에셋 제공 여부
- `./images`위치에서 확인


