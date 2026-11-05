/**
 * 공지사항 초기 시드 데이터
 * 디자인 레퍼런스 이미지에 표기된 128건 및 상세 예시 데이터를 완벽히 재현합니다.
 */

export function generateInitialPosts() {
  const seedList = [
    {
      id: "duo-notice-service-check-2026",
      postNumber: 128,
      category: "important",
      categoryLabel: "중요",
      isPinned: true,
      title: "듀오링고 서비스 점검 안내 (11/10 02:00 - 05:00)",
      content: `<p>안녕하세요, 듀오링고 팀입니다.</p>
<p>더 안정적이고 쾌적한 서비스 제공을 위해 아래와 같이 서버 점검이 진행될 예정입니다.<br>점검 시간 동안에는 웹사이트와 앱 일부 기능의 이용이 제한될 수 있으니 학습 계획에 참고해 주세요.</p>
<div class="notice-info-box">
  <div class="notice-info-box__icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#58cc02"/><path d="M12 7V13M12 16V17" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/></svg>
  </div>
  <div class="notice-info-box__content">
    <p><strong>점검 일시</strong> &nbsp;&nbsp; 2026년 11월 10일 (화) 02:00 – 05:00 (약 3시간)</p>
    <p><strong>영향 범위</strong> &nbsp;&nbsp; 웹사이트 및 모바일 앱 전체 서비스 (학습, 랭킹, 상점 등)</p>
    <p><strong>점검 내용</strong> &nbsp;&nbsp; 서버 안정화 및 시스템 성능 개선 작업</p>
  </div>
</div>
<p>점검이 완료되면 더 빠르고 안정적인 듀오링고를 만나보실 수 있습니다.<br>항상 듀오링고를 사랑해 주시는 학습자 여러분께 감사드리며,<br>더 좋은 학습 경험을 만들기 위해 최선을 다하겠습니다.</p>
<p>감사합니다.<br>듀오링고 드림 💚</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 4328,
      attachments: [
        {
          id: "att-1",
          name: "서비스점검_안내사항.pdf",
          size: 1258291,
          formattedSize: "1.2MB",
          type: "application/pdf",
        },
      ],
      createdAt: "2026-11-04T10:30:00.000Z",
      updatedAt: "2026-11-04T10:35:00.000Z",
    },
    {
      id: "duo-notice-renewal-2026",
      postNumber: 127,
      category: "notice",
      categoryLabel: "안내",
      isPinned: true,
      title: "웹사이트 리뉴얼 오픈 및 주요 변경사항 안내",
      content: `<p>안녕하세요, 듀오링고 학습자 여러분!</p>
<p>더 직관적이고 즐거운 외국어 학습을 경험하실 수 있도록 듀오링고 웹사이트가 새로워졌습니다.</p>
<div class="notice-info-box">
  <div class="notice-info-box__icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#58cc02"/><path d="M12 7V13M12 16V17" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/></svg>
  </div>
  <div class="notice-info-box__content">
    <p><strong>리뉴얼 오픈</strong> &nbsp;&nbsp; 2026년 10월 28일 (수)</p>
    <p><strong>주요 변경점</strong> &nbsp;&nbsp; 직관적인 반응형 내비게이션, Lottie 모션 인터랙션 강화, 모바일 최적화</p>
    <p><strong>신규 기능</strong> &nbsp;&nbsp; 공지사항 게시판 오픈 및 실시간 학습 상태 피드백 지원</p>
  </div>
</div>
<p>앞으로도 여러분의 지속적인 학습을 응원하겠습니다. 많은 관심 부탁드립니다!</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 3914,
      attachments: [
        {
          id: "att-2",
          name: "웹사이트_리뉴얼_가이드.pdf",
          size: 3565158,
          formattedSize: "3.4MB",
          type: "application/pdf",
        },
      ],
      createdAt: "2026-10-28T14:15:00.000Z",
      updatedAt: "2026-10-28T14:15:00.000Z",
    },
    {
      id: "duo-notice-friend-quest-126",
      postNumber: 126,
      category: "notice",
      categoryLabel: "안내",
      isPinned: false,
      title: "친구와 함께하는 프렌즈 퀘스트 보상 개편 안내",
      content: `<p>학습 친구와 함께 달성하는 프렌즈 퀘스트 보상이 더욱 풍성해졌습니다.</p><p>매주 화요일 새로운 퀘스트가 갱신됩니다.</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 2890,
      attachments: [],
      createdAt: "2026-10-27T15:00:00.000Z",
      updatedAt: "2026-10-27T15:00:00.000Z",
    },
    {
      id: "duo-notice-challenge-nov",
      postNumber: 125,
      category: "event",
      categoryLabel: "이벤트",
      isPinned: false,
      title: "11월 학습 챌린지: 30일 연속 학습하고 배지를 받으세요!",
      content: `<p>안녕하세요! 듀오링고와 함께하는 11월 학습 챌린지가 시작됩니다.</p>
<p>매일 1레슨씩 완료하고 연속 학습(스트릭)을 달성하여 한정판 11월 스페셜 배지를 획득하세요!</p>
<div class="notice-info-box">
  <div class="notice-info-box__icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#ce82ff"/><path d="M12 7V13M12 16V17" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/></svg>
  </div>
  <div class="notice-info-box__content">
    <p><strong>챌린지 기간</strong> &nbsp;&nbsp; 2026년 11월 1일 ~ 11월 30일 (총 30일간)</p>
    <p><strong>달성 조건</strong> &nbsp;&nbsp; 기간 내 1,000 XP 획득 또는 20퀘스트 완료</p>
    <p><strong>보상</strong> &nbsp;&nbsp; 11월 한정 Duo 트로피 배지 &amp; 300 보석(Gems)</p>
  </div>
</div>
<p>부엉이 듀오가 매일 여러분의 스트릭을 지켜줄게요!</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 2167,
      attachments: [],
      createdAt: "2026-10-27T09:00:00.000Z",
      updatedAt: "2026-10-27T09:00:00.000Z",
    },
    {
      id: "duo-notice-app-update-738",
      postNumber: 124,
      category: "update",
      categoryLabel: "업데이트",
      isPinned: false,
      title: "앱 업데이트(v7.38.0) 안내 - 학습 경험이 더 좋아졌어요!",
      content: `<p>안녕하세요, 듀오링고 팀입니다.<br>최신 버전(v7.38.0) 앱이 출시되었습니다.</p>
<ul>
  <li>음성 인식 정확도 20% 향상</li>
  <li>발음 연습 피드백 시각화 기능 추가</li>
  <li>저사양 기기 메모리 최적화 및 로딩 속도 단축</li>
</ul>
<p>지금 바로 앱스토어 및 구글 플레이스토어에서 업데이트를 진행해 보세요.</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 개발팀",
        role: "엔지니어",
      },
      views: 5481,
      attachments: [],
      createdAt: "2026-10-20T16:40:00.000Z",
      updatedAt: "2026-10-20T16:40:00.000Z",
    },
    {
      id: "duo-notice-for-schools",
      postNumber: 123,
      category: "notice",
      categoryLabel: "안내",
      isPinned: false,
      title: "듀오링고 for Schools 신규 기능 안내",
      content: `<p>선생님과 학생을 위한 'Duolingo for Schools'에 새로운 대시보드 및 맞춤 과제 출제 기능이 도입되었습니다.</p>
<p>학급별 학습 진도율을 한눈에 파악하고 취약한 문법 주제를 집중 복습할 수 있습니다.</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 1902,
      attachments: [],
      createdAt: "2026-10-15T11:20:00.000Z",
      updatedAt: "2026-10-15T11:20:00.000Z",
    },
    {
      id: "duo-notice-halloween-event",
      postNumber: 122,
      category: "event",
      categoryLabel: "이벤트",
      isPinned: false,
      title: "할로윈 스페셜 이벤트 종료 안내 및 보상 지급 일정",
      content: `<p>2026 할로윈 스페셜 이벤트가 성황리에 마무리되었습니다. 참여해 주신 모든 학습자분들께 감사드립니다.</p>
<p>이벤트 보상 보석 및 한정판 할로윈 코스튬은 10월 12일까지 순차적으로 우편함에 지급됩니다.</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 3223,
      attachments: [],
      createdAt: "2026-10-10T18:00:00.000Z",
      updatedAt: "2026-10-10T18:00:00.000Z",
    },
    {
      id: "duo-notice-privacy-policy",
      postNumber: 121,
      category: "notice",
      categoryLabel: "안내",
      isPinned: false,
      title: "개인정보처리방침 개정 안내 (시행일: 2026.10.17)",
      content: `<p>듀오링고 서비스를 이용해 주시는 회원 여러분께 감사드립니다.</p>
<p>개인정보보호법 관련 법령 개정 및 신규 서비스 출시에 따라 개인정보처리방침이 개정됨을 안내드립니다.</p>
<p>자세한 변경 내역은 공식 약관 센터에서 확인하실 수 있습니다.</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 법무팀",
        role: "담당자",
      },
      views: 1418,
      attachments: [],
      createdAt: "2026-10-05T15:30:00.000Z",
      updatedAt: "2026-10-05T15:30:00.000Z",
    },
  ];

  // 1페이지당 7건 기준 5페이지 분량(총 35건)을 구성하기 위해
  // 대표 공지 8건 + 추가 공지 27건 (120번부터 94번까지) 생성
  const additionalCategories = [
    { cat: "notice", label: "안내" },
    { cat: "event", label: "이벤트" },
    { cat: "update", label: "업데이트" },
    { cat: "notice", label: "안내" },
  ];

  const additionalTitles = [
    "학습 알림 푸시 설정 기능 개선 안내",
    "친구와 함께하는 퀘스트 기능 오픈",
    "다이아몬드 리그 주간 승급자 발표",
    "영어 말하기 평가 시스템 알고리즘 업데이트",
    "슈퍼 듀오링고 1주년 감사 할인 프로모션 안내",
    "모바일 웹 브라우저 호환성 개선 안내",
    "스페인어 기초 코스 신규 단원 추가",
    "학습 시간 통계 위젯 업데이트 안내",
    "정기 시스템 인프라 점검 완료 안내",
    "듀오링고 팟캐스트 시즌 4 릴리즈 안내",
  ];

  const result = [...seedList];
  let baseDate = new Date("2026-10-04T10:00:00.000Z");

  for (let num = 120; num >= 94; num--) {
    baseDate = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000 * 1.5);
    const catObj = additionalCategories[num % additionalCategories.length];
    const titleBase = additionalTitles[num % additionalTitles.length];
    const createdIso = baseDate.toISOString();

    result.push({
      id: `duo-notice-${num}`,
      postNumber: num,
      category: catObj.cat,
      categoryLabel: catObj.label,
      isPinned: false,
      title: `${titleBase} (#${num})`,
      content: `<p>듀오링고 공지사항 번호 ${num}번 안내입니다.</p><p>회원 여러분의 쾌적한 학습 환경을 위해 최선을 다하겠습니다.</p>`,
      author: {
        id: "duo-admin",
        name: "듀오링고 운영팀",
        role: "관리자",
      },
      views: 800 + (num * 37) % 3500,
      attachments: [],
      createdAt: createdIso,
      updatedAt: createdIso,
    });
  }

  return result;
}
