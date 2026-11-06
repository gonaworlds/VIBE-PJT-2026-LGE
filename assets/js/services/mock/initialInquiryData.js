/**
 * 초기 문의하기 (Q&A) 시드 데이터 생성기
 */
export function generateInitialInquiries() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'inq-001',
      inquiryNumber: 6,
      category: 'delivery',
      categoryLabel: '배송문의',
      title: '듀오링고 캐릭터 인형 굿즈 배송 일정 문의드립니다',
      content: '<p>안녕하세요! 듀오링고 스토어에서 듀오 대형 봉제인형을 주문했는데요, 발송 일정이 언제쯤 될지 궁금하여 문의글 남깁니다. 주문번호는 #DUO-20261102 입니다.</p>',
      author: {
        id: 'duo_learner',
        name: '김학습',
      },
      isSecret: false,
      status: 'answered',
      views: 42,
      answer: {
        content: '<p>안녕하세요 김학습 고객님, 듀오링고 스토어 지원팀입니다.<br><br>확인해 주신 주문(#DUO-20261102)은 현재 물류센터에서 꼼꼼히 검수 및 포장 중이며, 오늘 오후 우체국 택배를 통해 출고될 예정입니다. 송장번호는 등록된 이메일과 SMS로 함께 발송해 드리겠습니다.<br><br>듀오 인형과 함께 더욱 즐겁고 유익한 학습 되시길 바랍니다. 감사합니다!</p>',
        adminId: 'admin',
        adminName: '듀오 고객센터',
        answeredAt: new Date(now - 1 * day + 3 * 3600 * 1000).toISOString(),
      },
      createdAt: new Date(now - 1 * day).toISOString(),
      updatedAt: new Date(now - 1 * day + 3 * 3600 * 1000).toISOString(),
    },
    {
      id: 'inq-002',
      inquiryNumber: 5,
      category: 'account',
      categoryLabel: '계정문의',
      title: '기존 구글 이메일 계정 연동 및 데이터 이전 요청의 건',
      content: '<p>기존에 사용하던 계정의 이메일 주소를 변경하고 싶은데 개인정보 관련 문의라 비밀글로 남깁니다. 기존 계정: old_user@gmail.com 에서 새로운 계정으로 진행 상황(연속 학습 streak)을 연동할 수 있는 방법 안내 부탁드립니다.</p>',
      author: {
        id: 'secret_user',
        name: '박보안',
      },
      isSecret: true,
      status: 'answered',
      views: 18,
      answer: {
        content: '<p>안녕하세요 박보안 회원님, 듀오링고 계정 지원팀입니다.<br><br>회원님의 소중한 학습 데이터(Streak 및 수료 기록)는 프로필 설정 &gt; 계정 &gt; [이메일 변경] 메뉴에서 직접 인증 후 안전하게 변경 가능하십니다. 회원님의 계정 보호를 위해 별도 인증 코드를 발송해 드렸으니 확인 부탁드립니다.<br><br>추가 문의사항이 있으시면 언제든 말씀해 주세요. 감사합니다.</p>',
        adminId: 'admin',
        adminName: '듀오 계정지원팀',
        answeredAt: new Date(now - 2 * day + 5 * 3600 * 1000).toISOString(),
      },
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 2 * day + 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 'inq-003',
      inquiryNumber: 4,
      category: 'refund',
      categoryLabel: '교환/환불',
      title: '슈퍼 듀오링고(Super Duolingo) 연간 구독 환불 규정 문의',
      content: '<p>지난주에 슈퍼 듀오링고 1년 구독을 신청했는데, 사정상 잠시 학습을 쉬어가야 할 것 같아 환불 규정과 절차가 어떻게 되는지 문의드립니다.</p>',
      author: {
        id: 'super_fan',
        name: '이듀오',
      },
      isSecret: false,
      status: 'answered',
      views: 65,
      answer: {
        content: '<p>안녕하세요 이듀오 고객님, 듀오링고 결제 지원팀입니다.<br><br>듀오링고는 첫 구독 결제일로부터 14일 이내 이용 내역이 없으실 경우 100% 전액 환불 정책을 지원하고 있습니다.<br>웹 브라우저에서 결제하신 경우 본 고객센터에서 즉시 환불 접수가 가능하며, 모바일(구글 플레이/애플 앱스토어)에서 결제하신 경우 각 스토어 결제 내역 관리 페이지에서 [환불 요청]을 진행해 주시면 신속하게 처리됩니다.<br><br>자세한 계정 조회를 원하시면 주문번호를 알려주시면 감사하겠습니다.</p>',
        adminId: 'admin',
        adminName: '듀오 결제팀',
        answeredAt: new Date(now - 3 * day + 4 * 3600 * 1000).toISOString(),
      },
      createdAt: new Date(now - 3 * day).toISOString(),
      updatedAt: new Date(now - 3 * day + 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'inq-004',
      inquiryNumber: 3,
      category: 'error',
      categoryLabel: '시스템오류',
      title: '학습 완료 후 연속 학습(Streak) 일수가 반영되지 않는 오류가 있어요',
      content: '<p>어제 밤 11시경 오늘의 스페인어 레슨 2개를 정상적으로 완료했는데, 오늘 아침 확인해보니 연속 학습 일수가 올라가지 않고 동결 아이템이 사용되었습니다. 버그 확인 및 복구 가능할까요?</p>',
      author: {
        id: 'streak_master',
        name: '최열정',
      },
      isSecret: false,
      status: 'waiting',
      views: 29,
      answer: null,
      createdAt: new Date(now - 4 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'inq-005',
      inquiryNumber: 2,
      category: 'delivery',
      categoryLabel: '배송문의',
      title: '배송지 주소 변경 요청드립니다 (비공개)',
      content: '<p>이사 일정으로 인해 배송받을 주소를 긴급히 변경하고자 합니다. 이전 주소와 새 주소 남겨드립니다. 빠른 변경 부탁드립니다!</p>',
      author: {
        id: 'mover_user',
        name: '정민우',
      },
      isSecret: true,
      status: 'waiting',
      views: 12,
      answer: null,
      createdAt: new Date(now - 8 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 8 * 3600 * 1000).toISOString(),
    },
    {
      id: 'inq-006',
      inquiryNumber: 1,
      category: 'etc',
      categoryLabel: '기타',
      title: '오프라인 듀오링고 언어 교환 밋업(Meetup) 행사 계획이 있나요?',
      content: '<p>한국 듀오링고 학습자들을 위한 오프라인 커뮤니티 언어 교환 모임이나 밋업 행사 계획이 혹시 있으신지 궁금합니다. 친구들과 함께 꼭 참여해보고 싶습니다.</p>',
      author: {
        id: 'polyglot',
        name: '강글로벌',
      },
      isSecret: false,
      status: 'waiting',
      views: 38,
      answer: null,
      createdAt: new Date(now - 12 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 12 * 3600 * 1000).toISOString(),
    },
  ];
}

