/**
 * LocalStorage 도우미 모듈
 * 가이드라인 지침 준수: 실제 네트워크 레이턴시를 시뮬레이션(약 150ms)하여
 * 비동기 환경과 로딩 상태를 UI가 일관되게 처리하도록 지원합니다.
 */

const NETWORK_DELAY_MS = 150;

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const storageHelper = {
  /**
   * LocalStorage에서 데이터를 비동기로 읽어옵니다.
   * @template T
   * @param {string} key
   * @param {T} defaultValue
   * @returns {Promise<T>}
   */
  get: async (key, defaultValue) => {
    await delay();
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.warn(`[storageHelper] Failed to read key: ${key}`, err);
      return defaultValue;
    }
  },

  /**
   * LocalStorage에 데이터를 비동기로 저장합니다.
   * @template T
   * @param {string} key
   * @param {T} value
   * @returns {Promise<void>}
   */
  set: async (key, value) => {
    await delay();
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[storageHelper] Failed to write key: ${key}`, err);
      throw err;
    }
  },

  /**
   * 특정 키의 데이터를 삭제합니다.
   * @param {string} key
   * @returns {Promise<void>}
   */
  remove: async (key) => {
    await delay();
    localStorage.removeItem(key);
  },
};

