/**
 * 공통 레이아웃(상단 헤더 · 하단 푸터) 데이터 — 사이트 전체에서 이 파일 하나만 수정합니다.
 *
 * - PAGE_LAYOUTS : 페이지별로 어떤 헤더/푸터를 쓰는지 지정
 * - 나머지 상수  : 메뉴, 링크, 사이트맵, 언어 목록 등 화면에 표시되는 내용
 *
 * 마크업은 site-header.js / site-footer.js 가, 페이지 삽입은 site-layout.js 가 담당합니다.
 */

/* --------------------------------------------------------------------------
   1. 페이지별 레이아웃 지정
   header: 'landing'     index 히어로 위 고정 내비게이션 (스크롤 시 compact 전환)
           'service'     공지사항·로그인 등 서비스 화면 공통 헤더 (로그인 상태 표시)
           'englishtest' Duolingo English Test 전용 헤더 (드롭다운 + 모바일 드로어)
   footer: 'site'        듀오링고 공통 그린 푸터 (사이트맵 + 사이트 언어)
           'englishtest' Duolingo English Test 전용 푸터
   -------------------------------------------------------------------------- */
export const PAGE_LAYOUTS = {
  'index.html': { header: 'landing', footer: 'site' },
  'notice.html': { header: 'service', footer: 'site' },
  'inquiry.html': { header: 'service', footer: 'site' },
  'login.html': {
    header: 'service',
    // 로그인 화면: 로그인 버튼은 로그아웃 용도로만 노출, CTA 는 공지사항으로 이동
    headerOptions: { loginLogoutOnly: true, cta: 'notice' },
    footer: 'site',
  },
  'englishtest.html': { header: 'englishtest', footer: 'englishtest' },
};

/** PAGE_LAYOUTS 에 없는 새 페이지의 기본값 */
export const DEFAULT_LAYOUT = { header: 'service', footer: 'site' };

/* --------------------------------------------------------------------------
   2. 공통 링크
   -------------------------------------------------------------------------- */
export const LINKS = {
  home: './index.html',
  login: './login.html',
  signup: './login.html#signup',
  notice: './notice.html',
  inquiry: './inquiry.html',
  englishtest: './englishtest.html',
  register: 'https://www.duolingo.com/register',
};

export const LOGO = {
  main: { src: './assets/images/nav_logo.svg', alt: 'duolingo' },
  englishtest: { src: './assets/images/englishtest/logo_text_green.svg', alt: 'duolingo english test' },
  englishtestWhite: { src: './assets/images/englishtest/logo_text_white.svg', alt: 'duolingo english test' },
};

/** 헤더 CTA 버튼 종류 (headerOptions.cta 로 선택) */
export const HEADER_CTAS = {
  register: { label: '시작하기', href: LINKS.register, external: true },
  notice: { label: '공지사항', href: LINKS.notice, external: false },
};

/* --------------------------------------------------------------------------
   3. 듀오링고 공통 푸터 (site)
   -------------------------------------------------------------------------- */
export const SITE_FOOTER_GROUPS = [
  {
    id: 'about',
    title: '듀오링고 소개',
    items: ['학습 과정', '사명', '교육방식', '학습 효과', '듀오링고 핸드북', '연구', '인재 채용', '스토어', '언론', '투자자', { label: '듀오링고에 문의하기', href: LINKS.inquiry }],
  },
  {
    id: 'products',
    title: '제품',
    items: ['듀오링고', 'Duolingo for Schools', 'Duolingo English Test', '팟캐스트', 'Duolingo for Business', '슈퍼 듀오링고', '슈퍼 듀오링고 선물하기', '듀오링고 맥스'],
  },
  {
    id: 'apps',
    title: '앱',
    items: ['안드로이드용 듀오링고', 'iOS용 듀오링고'],
  },
  {
    id: 'support',
    title: '도움말 및 지원',
    items: [{ label: '공지사항', href: LINKS.notice }, { label: '1:1 문의하기', href: LINKS.inquiry }, '듀오링고 FAQ', '학교용 듀오링고 FAQ', 'Duolingo English Test FAQ', '상태'],
  },
  {
    id: 'legal',
    title: '개인정보처리방침 및 약관',
    items: ['커뮤니티 지침', '규정', '개인정보보호'],
  },
  {
    id: 'social',
    title: '소셜 미디어',
    items: ['블로그', 'Instagram', 'TikTok', 'Twitter', 'YouTube', 'LinkedIn'],
  },
];

/** 반응형 열 배치 (site-footer.js 가 화면 폭에 맞춰 그룹을 재배치) */
export const SITE_FOOTER_COLUMNS = {
  mobile: [['about', 'products', 'apps', 'support', 'legal', 'social']],
  tablet: [['about', 'support'], ['products', 'legal'], ['apps', 'social']],
  desktop: [['about'], ['products'], ['apps'], ['support'], ['legal', 'social']],
};

export const SITE_LANGUAGES = [
  { lang: 'ar', label: 'العربية', dir: 'rtl' },
  { lang: 'bn', label: 'বাংলা' },
  { lang: 'cs', label: 'Čeština' },
  { lang: 'de', label: 'Deutsch' },
  { lang: 'el', label: 'Ελληνικά' },
  { lang: 'en', label: 'English' },
  { lang: 'es', label: 'Español' },
  { lang: 'fr', label: 'Français' },
  { lang: 'hi', label: 'हिंदी' },
  { lang: 'hu', label: 'Magyar' },
  { lang: 'id', label: 'Bahasa Indonesia' },
  { lang: 'it', label: 'Italiano' },
  { lang: 'ja', label: '日本語' },
  { lang: 'kn', label: 'ಕನ್ನಡ' },
  { lang: 'ko', label: '한국어' },
  { lang: 'mr', label: 'मराठी' },
  { lang: 'nl', label: 'Nederlands' },
  { lang: 'pl', label: 'Polski' },
  { lang: 'pt', label: 'Português' },
  { lang: 'ro', label: 'Română' },
  { lang: 'ru', label: 'Русский' },
  { lang: 'sv', label: 'svenska' },
  { lang: 'ta', label: 'தமிழ்' },
  { lang: 'te', label: 'తెలుగు' },
  { lang: 'th', label: 'ภาษาไทย' },
  { lang: 'tl', label: 'Tagalog' },
  { lang: 'tr', label: 'Türkçe' },
  { lang: 'uk', label: 'Українською' },
  { lang: 'ur', label: 'اردو', dir: 'rtl' },
  { lang: 'vi', label: 'Tiếng Việt' },
  { lang: 'zh', label: '中文' },
];

/* --------------------------------------------------------------------------
   4. Duolingo English Test 헤더 / 푸터
   -------------------------------------------------------------------------- */
/** 데스크톱 드롭다운과 모바일 드로어가 함께 사용하는 메뉴 */
export const ENGLISHTEST_MENU = [
  { title: '시험 응시자', items: ['개요', '인정 기관', '채점 방식', '시험 준비하기'] },
  { title: '기관', items: ['개요', '시험 보안', '채점 방식', '액세스 프로그램', '글로벌 자문단'] },
  { title: '연구원 소개', items: ['개요', '출판물', '연구팀', '상금 및 보조금', '블로그'] },
];

export const ENGLISHTEST_FOOTER_COLUMNS = [
  { id: 'candidates', title: '응시자', items: ['소개', '인정 기관', '채점 방식', '시험 준비하기', '편의 지원'] },
  { id: 'institutions', title: '교육기관', items: ['소개', '시험 보안', '채점 방식', '액세스 프로그램', '글로벌 자문단'] },
  { id: 'researchers', title: '연구원', items: ['소개', '연구 출판', '듀오링고 팀', '지원금 및 상금', '블로그'] },
  { id: 'support', title: '고객지원', items: ['도움말 센터', '이용 약관', '개인정보보호정책', '시험 보안 및 신뢰 센터', '내부고발자 신고양식'] },
];

export const ENGLISHTEST_SNS = [
  { label: 'Facebook', href: 'https://www.facebook.com/duolingo', icon: 'sns_facebook.svg' },
  { label: 'Instagram', href: 'https://www.instagram.com/duolingo', icon: 'sns_instagram.svg' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/duolingo', icon: 'sns_linkedin.svg' },
  { label: 'Twitter', href: 'https://twitter.com/duolingo', icon: 'sns_twitter.svg' },
  { label: 'YouTube', href: 'https://www.youtube.com/duolingo', icon: 'sns_youtube.svg' },
];
