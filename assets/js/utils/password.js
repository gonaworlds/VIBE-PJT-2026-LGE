/**
 * 비밀번호 해시 유틸 (PBKDF2-SHA256, Web Crypto)
 * - 비밀번호 원문은 저장하지 않고, 사용자별 salt + 해시만 Firestore 에 저장합니다.
 * - 브라우저와 Node(관리자 등록 스크립트)에서 동일하게 동작합니다.
 */

export const PASSWORD_ITERATIONS = 100000;

function getSubtle() {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) {
    throw new Error('이 환경에서는 암호화 기능을 사용할 수 없습니다. https 또는 localhost 로 접속해 주세요.');
  }
  return subtle;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function generateSalt() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function hashPassword(password, saltHex, iterations = PASSWORD_ITERATIONS) {
  const subtle = getSubtle();
  const key = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations },
    key,
    256
  );
  return toHex(bits);
}

/** 타이밍 차이를 줄이기 위한 상수 시간 비교 */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
