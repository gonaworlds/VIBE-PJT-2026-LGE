# 프로젝트 시작 가이드 (README.md 상단 전달용)

## 📌 필독: 개발 시작 전 준수 사항

본 프로젝트는 **듀오링고(Duolingo) 한국어 웹사이트를 벤치마킹하여 Vanilla Web Stack(HTML5, CSS3, Vanilla JS)으로 구현하는 프로젝트**입니다.

모든 코드 작성 및 수정 작업은 **`spec-kit/AGENTS.md`에 정의된 규약(15년 차 웹디자이너·웹개발자 표준)을 최우선으로 준수**해야 합니다. 작업 착수 전 아래 핵심 지침을 반드시 확인하십시오.

---

### 1. 설계 및 구현 규약 파일 위치

- **실행 자산 관리:** CSS는 `assets/css/`, JavaScript는 `assets/js/`에서만 관리합니다. 루트에 `css/`·`js/` 복사본을 만들지 않습니다.
- **HTML 진입 경로:** `index.html`은 `assets/css/main.css`와 `assets/js/main.js`를, `notice.html`은 같은 CSS 진입점과 `assets/js/notice-page.js`를 사용합니다.

- **규약 문서 경로:** `spec-kit/AGENTS.md`
- **작업 전 필수 절차:**

1. 작업 시작 전 `spec-kit/AGENTS.md`의 전체 내용과 우선순위(0.2절)를 완전히 숙지하십시오.

2. 코드를 작성하기 전 기존 토큰(`assets/css/base/tokens.css`) 및 공통 컴포넌트의 존재 여부를 먼저 확인하십시오.

---

### 2. 핵심 아키텍처 및 하드 룰 (Hard Rules)

- **기술 스택 제약:**
- 순수 HTML5 / CSS3 / Vanilla JavaScript (ES2022+)만 사용합니다.

- 프레임워크(React, Vue 등), 빌드 도구, 번들러, 무거운 외부 라이브러리(jQuery, Lodash 등) 도입을 엄격히 금지합니다.

- **레이아웃 3단 구조 준수 (PART E):**
- `겉박스(header / main > section / footer)` > `속박스(.inner-box)` > `파티션(.part)` 3단계 계층을 엄격히 준수합니다.

- 폭 제한 컨테이너 클래스는 **오직 `.inner-box` 하나만 허용**하며, 다른 별칭(`.container`, `.wrapper` 등)은 사용할 수 없습니다.

- 레이아웃 배치는 **Flexbox 기반**으로 구성하며, 겉박스·속박스·파티션 레벨에서의 **Grid 사용을 금지**합니다 (파티션 내부 내용박스에 한해서만 사유 주석 후 제한적 허용).

- **디자인 토큰 엄수:**
- 모든 색상, 폰트 크기, 간격, 보더 반경, 그림자 값은 `tokens.css`의 CSS 변수로만 지정해야 하며 임의의 hex/px 하드코딩을 금지합니다.

- **듀오링고 디자인 구현 (PART F):**
- 버튼: 4px 단색 립(`box-shadow`)과 누름(`:active`) 물리 모션 구현

- 카드: 블러 없는 2px 윤곽선 및 하단 라인 적용

- 서체/텍스트: 본문 기본 크기 17px, 기본 서체(Nunito + Pretendard), Eel(`#4B4B4B`) 텍스트 컬러 사용

---

### 3. 작업 프로토콜 및 완료 정의 (DoD)

1. **임의 구현 금지:** 요구사항이 불명확한 경우 추측으로 코드를 작성하지 말고 질문하거나 가정을 보고서에 명시하십시오.

2. **반응형 자체 점검:** 모바일(375px), 태블릿(768px), 데스크톱(1024px/1280px) 환경에서 수평 스크롤(오버플로) 없이 온전히 동작하는지 점검하십시오.

3. **완료 보고:** 작업 종료 시 `spec-kit/AGENTS.md`의 PART D(완료 정의 Checklist)를 대조 검증한 후, 변경 파일 목록과 적용 결과를 보고하십시오.
