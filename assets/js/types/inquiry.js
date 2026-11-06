/**
 * 1:1 문의하기 (Q&A) 게시판 타입 및 카테고리 상수 정의
 */

/**
 * 5가지 질문유형
 * 1. 배송문의
 * 2. 계정문의
 * 3. 교환/환불
 * 4. 시스템오류
 * 5. 기타
 */
export const INQUIRY_CATEGORIES = {
  delivery: {
    key: 'delivery',
    label: '배송문의',
    badgeClass: 'badge--delivery',
    desc: '상품 배송 및 배송지 변경 관련 문의',
  },
  account: {
    key: 'account',
    label: '계정문의',
    badgeClass: 'badge--account',
    desc: '로그인, 회원정보, 계정 연동 관련 문의',
  },
  refund: {
    key: 'refund',
    label: '교환/환불',
    badgeClass: 'badge--refund',
    desc: '결제 취소, 구독 환불, 상품 교환 관련 문의',
  },
  error: {
    key: 'error',
    label: '시스템오류',
    badgeClass: 'badge--error',
    desc: '학습 진도 오류, 앱 버그, 접속 장애 관련 문의',
  },
  etc: {
    key: 'etc',
    label: '기타',
    badgeClass: 'badge--etc',
    desc: '기타 일반 질문 및 건의사항',
  },
};

/**
 * 답변 처리 상태
 */
export const INQUIRY_STATUS = {
  waiting: {
    key: 'waiting',
    label: '답변대기',
    badgeClass: 'badge--status-waiting',
  },
  answered: {
    key: 'answered',
    label: '답변완료',
    badgeClass: 'badge--status-answered',
  },
};

