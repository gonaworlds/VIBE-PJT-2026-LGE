/**
 * 정렬된 게시글 목록에서 현재 글의 이전글/다음글과 주변 글 목록을 구합니다.
 * (목록 화면 순서 기준: index - 1 = 이전글, index + 1 = 다음글)
 *
 * @param {Array<object>} list  정렬된 게시글 목록
 * @param {string} currentId    현재 게시글 ID
 * @param {number} [size=3]     주변 글 목록 개수 (현재 글 포함)
 * @returns {{ prev: object|null, next: object|null, nearby: Array<{ post: object, offset: number }> }}
 *   nearby: 현재 글이 가능한 한 가운데에 오도록 자른 연속 구간.
 *           offset < 0 이전글, 0 현재 글, > 0 다음글
 */
export function pickSiblings(list, currentId, size = 3) {
  const index = list.findIndex((item) => item.id === currentId);
  if (index === -1) return { prev: null, next: null, nearby: [] };

  const count = Math.min(size, list.length);
  const start = Math.max(0, Math.min(index - Math.floor((count - 1) / 2), list.length - count));

  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
    nearby: list.slice(start, start + count).map((post, i) => ({ post, offset: start + i - index })),
  };
}
