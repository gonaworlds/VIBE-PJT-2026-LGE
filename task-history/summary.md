# 작업 이력 요약

프로젝트: Duolingo 한국어 랜딩 페이지 벤치마킹 구현  
최종 기록일: 2026-11-04

## 다음 작업 시작 전

1. 이 파일과 최신 상세 기록인 [task_2026-11-04.md](./task_2026-11-04.md)를 먼저 읽습니다.
2. 현재 구현과 자산 경로를 확인하고, 이미 완료된 작업을 다시 만들지 않습니다.
3. 작업이 끝나면 날짜별 `task_{yyyy-mm-dd}.md`에 변경·검증 내용을 추가하고, 이 요약과 최신 상세 기록 링크를 함께 갱신합니다.

## 현재 구현 상태

- Vanilla HTML/CSS/ES Modules 기반 반응형 Duolingo 랜딩 페이지입니다.
- `index.html`의 `header` 안에 `nav_logo.svg` 로고, `header_hero.svg` 히어로, 언어별 SVG를 사용하는 학습 언어 내비게이션이 있습니다.
- 언어 바는 영어 항목 너비만큼 일부가 가려진 상태로 시작하며, 좌우 버튼으로 이동합니다. 버튼은 스크롤 양 끝에서도 활성 커서를 유지합니다. 동작은 `assets/js/main.js`에 있습니다.
- `main`은 `container` 파트 안의 `benefit`, `downloads` 섹션과 `try1week`, `englishtest`, `getstarted` 파트로 구성됩니다. `.englishtest`는 영어 시험 소개·인증 CTA와 반응형 일러스트를, `.getstarted`는 마무리 제목·가입 CTA 및 `getstarted.svg` 일러스트 배경을 포함합니다.
- `.benefit`에는 네 개의 혜택 설명/일러스트가 있습니다. 데스크톱은 좌우 번갈아 배치하고, 태블릿·모바일은 세로 배치합니다.
- `.downloads`에는 기기 배경 일러스트와 App Store/Google Play 다운로드 링크를 구현했습니다.
- `.try1week`에는 부엉이, 화면 크기별 Super Duolingo 로고, 1주 체험 CTA가 있습니다. 데스크톱은 좌우, 태블릿·모바일은 세로 배치입니다.
- 고정 헤더는 로고를 하나만 렌더링합니다. 히어로의 로그인 버튼 이후 `.benefit` 끝까지는 사이트 언어 요약 대신 시작하기 CTA를 표시하고, 영역 종료 후 숨겼다가 `.englishtest`에서 다시 표시합니다. 로고는 Primary/Compact 상태에서 같은 위치와 모양을 유지합니다.
- 헤더는 단일 DOM으로 구성되며 사이트 언어 요약과 시작하기 CTA만 스크롤 상태에 따라 교체됩니다. 메뉴는 `.benefit` 끝에서 위로 사라지고 `.englishtest`에서 다시 나타납니다.
- 간편 메뉴는 `.englishtest`에 진입할 때 다시 아래로 내려오며 표시됩니다.
- `Duolingo Sans`, `Feather` 폰트는 `assets/css/base/typography.css`에서 `assets/fonts/` 경로로 로드하고 전역 폰트 스택 맨 앞에 배치합니다.
- CSS 진입점은 `assets/css/main.css`이며 기본, 레이아웃, 컴포넌트, 페이지 스타일은 `assets/css/` 아래에서 관리합니다.

## 적용할 프로젝트 제약

- 프레임워크나 번들러 없이 HTML5, CSS3, Vanilla JavaScript만 사용합니다.
- 새 레이아웃과 섹션은 시맨틱 HTML 및 기존 CSS 구조/토큰을 우선 따릅니다.
- 새 스타일은 기존 `assets/css/` 구조와 `assets/css/base/tokens.css` 토큰을 우선 재사용합니다.
- 구현 규칙과 완료 기준은 `spec-kit/AGENTS.md` 및 프로젝트 루트 `README.md`를 참조합니다.

## 최근 작업

- [2026-11-03 상세 작업 기록](./task_2026-11-03.md): CSS/폰트 자산 경로 통합, 반응형 헤더/히어로 및 언어 내비게이션, benefit/downloads, Super Duolingo 1주 체험 섹션 구현과 검증을 기록했습니다.
- [2026-11-04 상세 작업 기록](./task_2026-11-04.md): benefit 스크롤 구간의 고정 내비게이션, 전환 기준 수정 및 모바일 로고 크롭 구현과 검증을 기록했습니다.
- 2026-11-04 구조 확인: 단일 index.html, 계층별 CSS, main.js의 두 인터랙션을 확인했습니다. footer CSS와 Lottie JSON은 현재 페이지에 연결되지 않았으며, 본문 구조와 일부 스타일 값은 규약과 차이가 있습니다. 상세 기록 13항 참조.

- 반응형 푸터 구현 완료: main 다음 footer에 sitemap 및 footer-site-language 두 파트를 추가했습니다. 768px 미만 1열, 768px 이상 3열, 1080px 이상 5열입니다. footer.js가 묶음을 재배치하며, 사용자 선택에 따라 링크 연결은 보류하고 첨부 색상을 유지합니다. 320~1440px 가로 넘침 및 JS 오류 없음 확인. 상세 기록 14항 참조.

- 글꼴 변경: 일반 본문은 Duolingo Sans 400, 제목·기존 강조는 Feather와 --bold: 700 토큰을 사용합니다. 히어로 h1은 Duolingo Sans / --bold를 유지합니다. 상세 기록 15~17항 참조.

- container 스크롤 배경 전환: 진입 중에는 흰색을 유지하고, container 상단이 화면 상단에 닿은 후 내부를 스크롤하는 동안 흰색→#DFF5FF로 변경하며 역방향에도 대응합니다. scroll-background.js에서 관리합니다. 모바일/데스크톱 진행률과 모션 감소 설정 검증 완료. 상세 기록 18~19항 참조.
