/**
 * 관리자 계정 수동 등록 스크립트 (Firestore REST API)
 *
 * 사용법 (프로젝트 루트에서, Node 18+):
 *   node tools/seed-admin.mjs --password <비밀번호>
 *   node tools/seed-admin.mjs --id admin --name 관리자 --email admin.com@company.co.kr --password <비밀번호>
 *   (이미 존재하면 건너뜀. 비밀번호/정보를 다시 설정하려면 --force)
 *
 * - 비밀번호는 저장소에 남기지 않도록 실행 인자로만 받습니다.
 * - 웹과 동일한 PBKDF2 해시(assets/js/utils/password.js)로 저장하며 role 은 'admin' 입니다.
 * - 회원가입 화면은 항상 role 'user' 로만 가입되므로, 관리자는 이 스크립트로만 만들 수 있습니다.
 */

import { readFileSync } from 'node:fs';
import { generateSalt, hashPassword, PASSWORD_ITERATIONS } from '../assets/js/utils/password.js';

// 웹과 같은 Firebase 프로젝트 설정을 firebaseConfig.js 에서 읽어옴 (브라우저용 import 는 Node 에서 실행 불가)
const configSource = readFileSync(new URL('../assets/js/services/firebase/firebaseConfig.js', import.meta.url), 'utf8');
const readConfig = (field) => (configSource.match(new RegExp(`${field}:\\s*["']([^"']+)["']`)) || [])[1];
const firebaseConfig = { projectId: readConfig('projectId'), apiKey: readConfig('apiKey') };

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};

const userId = String(arg('id', 'admin')).trim().toLowerCase();
const name = String(arg('name', '관리자')).trim();
const email = String(arg('email', 'admin.com@company.co.kr')).trim().toLowerCase();
const password = arg('password');
const force = args.includes('--force');

if (!password) {
  console.error('비밀번호를 --password 로 전달해 주세요. 예) node tools/seed-admin.mjs --password 1111');
  process.exit(1);
}

const base = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const key = `key=${firebaseConfig.apiKey}`;
const docName = (path) => `projects/${firebaseConfig.projectId}/databases/(default)/documents/${path}`;
const userPath = `duo_users/${encodeURIComponent(userId)}`;
const emailDocId = encodeURIComponent(email);

const str = (v) => ({ stringValue: v });

const existing = await fetch(`${base}/${userPath}?${key}`);
if (existing.ok && !force) {
  console.log(`[seed-admin] '${userId}' 계정이 이미 존재합니다. 다시 설정하려면 --force 를 붙여 실행하세요.`);
  process.exit(0);
}

const salt = generateSalt();
const passwordHash = await hashPassword(password, salt);
const nowIso = new Date().toISOString();

const writes = [
  {
    update: {
      name: docName(`duo_users/${userId}`),
      fields: {
        userId: str(userId),
        name: str(name),
        email: str(email),
        role: str('admin'),
        passwordHash: str(passwordHash),
        passwordSalt: str(salt),
        passwordIterations: { integerValue: String(PASSWORD_ITERATIONS) },
        createdAt: str(nowIso),
        lastLoginAt: { nullValue: null },
      },
    },
  },
  {
    update: {
      name: docName(`duo_user_emails/${emailDocId}`),
      fields: { userId: str(userId), createdAt: str(nowIso) },
    },
  },
];

const res = await fetch(`${base}:commit?${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ writes }),
});

if (!res.ok) {
  console.error(`[seed-admin] 등록 실패 (${res.status}):`, await res.text());
  process.exit(1);
}

console.log(`[seed-admin] 관리자 계정 등록 완료 → 아이디: ${userId}, 이름: ${name}, 이메일: ${email}`);
