/**
 * 로그인 / 회원가입 화면 (login.html)
 * - 로그인 성공 시 ?redirect= 로 전달된 이전 화면으로 복귀
 * - 회원가입: 입력 형식 검증, 아이디·이메일 중복확인, 가입 후 로그인 폼에 아이디 자동 입력
 */

import { authService, validateSignUp } from './services/authService.js';

const DEFAULT_REDIRECT = './notice.html';

/** 같은 사이트의 html 페이지만 허용 (외부 주소로의 오픈 리다이렉트 방지) */
function getRedirectUrl() {
  const raw = new URLSearchParams(window.location.search).get('redirect');
  if (!raw) return DEFAULT_REDIRECT;
  if (!/^[\w-]+\.html(#[\w\-/]*)?$/.test(raw) || /^login\.html/i.test(raw)) return DEFAULT_REDIRECT;
  return `./${raw}`;
}

function showToast(message) {
  let toast = document.getElementById('authToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'authToast';
    toast.className = 'notice-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-show'), 2600);
}

function setBusy(button, busy, busyText) {
  if (!button) return;
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? busyText : button.dataset.label;
}

function friendlyError(err, fallback) {
  if (err && err.code && String(err.code).startsWith('auth/')) return err.message;
  console.error(err);
  return fallback;
}

// --------------------------------------------------------------------------
// 로그인
// --------------------------------------------------------------------------
function initLogin(redirectUrl) {
  const form = document.getElementById('loginForm');
  const loggedInBox = document.getElementById('authLoggedIn');
  const loggedInName = document.getElementById('authLoggedInName');
  const continueBtn = document.getElementById('btnAuthContinue');
  const logoutBtn = document.getElementById('btnAuthLogout');
  const errorEl = document.getElementById('loginError');
  const submitBtn = document.getElementById('btnLoginSubmit');
  const idInput = document.getElementById('loginUserId');
  const pwInput = document.getElementById('loginPassword');

  continueBtn.href = redirectUrl;

  const renderState = (user) => {
    loggedInBox.hidden = !user;
    form.hidden = Boolean(user);
    if (user) loggedInName.textContent = user.name;
  };
  renderState(authService.getCurrentUser());
  authService.onChange(renderState);

  logoutBtn.addEventListener('click', () => {
    authService.signOut();
    showToast('로그아웃되었습니다.');
    idInput.focus();
  });

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  };
  [idInput, pwInput].forEach((el) => el.addEventListener('input', () => showError('')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = idInput.value.trim();
    const password = pwInput.value;
    if (!userId || !password) {
      showError(!userId ? '아이디를 입력해 주세요.' : '비밀번호를 입력해 주세요.');
      (!userId ? idInput : pwInput).focus();
      return;
    }

    setBusy(submitBtn, true, '로그인 중...');
    try {
      const user = await authService.signIn(userId, password);
      showToast(`${user.name}님 환영합니다!`);
      window.location.href = redirectUrl;
    } catch (err) {
      showError(friendlyError(err, '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'));
      pwInput.value = '';
      pwInput.focus();
      setBusy(submitBtn, false);
    }
  });
}

// --------------------------------------------------------------------------
// 회원가입
// --------------------------------------------------------------------------
function initSignup() {
  const form = document.getElementById('signupForm');
  const errorEl = document.getElementById('signupError');
  const submitBtn = document.getElementById('btnSignupSubmit');
  const field = (name) => form.elements.namedItem(name);
  const msgEl = (name) => form.querySelector(`[data-msg-for="${name}"]`);

  // 중복확인 결과: { value, available } — 입력값이 바뀌면 무효화
  const checked = { userId: null, email: null };

  const setMsg = (name, text, type = 'error') => {
    const el = msgEl(name);
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('is-error', Boolean(text) && type === 'error');
    el.classList.toggle('is-success', Boolean(text) && type === 'success');
    const input = field(name);
    if (input) input.setAttribute('aria-invalid', text && type === 'error' ? 'true' : 'false');
  };

  const values = () => ({
    name: field('name').value,
    userId: field('userId').value.trim().toLowerCase(),
    password: field('password').value,
    passwordConfirm: field('passwordConfirm').value,
    email: field('email').value.trim().toLowerCase(),
  });

  const validateOne = (name) => {
    const errors = validateSignUp(values());
    if (name === 'passwordConfirm' && !field('passwordConfirm').value) {
      setMsg(name, '');
      return true;
    }
    if (errors[name]) {
      setMsg(name, errors[name]);
      return false;
    }
    if ((name === 'userId' || name === 'email') && checked[name] && checked[name].value === values()[name]) {
      return checked[name].available; // 기존 중복확인 메시지 유지
    }
    setMsg(name, name === 'passwordConfirm' ? '비밀번호가 일치합니다.' : '', 'success');
    return true;
  };

  /** 중복확인 (형식 검증 → Firestore 조회) */
  const runDuplicateCheck = async (name) => {
    const value = values()[name];
    if (validateSignUp(values())[name]) {
      validateOne(name);
      return false;
    }
    if (checked[name] && checked[name].value === value) return checked[name].available;

    const btn = form.querySelector(`[data-check="${name}"]`);
    setBusy(btn, true, '확인 중...');
    try {
      const available =
        name === 'userId' ? await authService.isUserIdAvailable(value) : await authService.isEmailAvailable(value);
      checked[name] = { value, available };
      if (available) {
        setMsg(name, name === 'userId' ? '사용 가능한 아이디입니다.' : '사용 가능한 이메일입니다.', 'success');
      } else {
        setMsg(name, name === 'userId' ? '이미 사용 중인 아이디입니다.' : '이미 가입된 이메일입니다.');
      }
      return available;
    } catch (err) {
      setMsg(name, '중복확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
      console.error(err);
      return false;
    } finally {
      setBusy(btn, false);
    }
  };

  form.querySelectorAll('[data-check]').forEach((btn) => {
    btn.addEventListener('click', () => runDuplicateCheck(btn.dataset.check));
  });

  ['name', 'userId', 'password', 'passwordConfirm', 'email'].forEach((name) => {
    const input = field(name);
    input.addEventListener('input', () => {
      errorEl.hidden = true;
      if (name === 'userId' || name === 'email') {
        if (checked[name] && checked[name].value !== values()[name]) checked[name] = null;
        setMsg(name, '');
      } else if (msgEl(name) && msgEl(name).classList.contains('is-error')) {
        validateOne(name);
      }
      if (name === 'password' && field('passwordConfirm').value) validateOne('passwordConfirm');
      if (name === 'passwordConfirm') validateOne('passwordConfirm');
    });
    input.addEventListener('blur', () => {
      if (!input.value) return;
      if (name === 'userId' || name === 'email') {
        runDuplicateCheck(name); // 입력을 마치면 자동으로 중복확인
      } else {
        validateOne(name);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const errors = validateSignUp(values());
    ['name', 'userId', 'password', 'passwordConfirm', 'email'].forEach((name) => {
      if (errors[name]) setMsg(name, errors[name]);
    });
    const firstInvalid = ['name', 'userId', 'password', 'passwordConfirm', 'email'].find((n) => errors[n]);
    if (firstInvalid) {
      field(firstInvalid).focus();
      return;
    }

    setBusy(submitBtn, true, '가입 처리 중...');
    try {
      const [idOk, emailOk] = await Promise.all([runDuplicateCheck('userId'), runDuplicateCheck('email')]);
      if (!idOk || !emailOk) {
        field(!idOk ? 'userId' : 'email').focus();
        return;
      }

      const { name, userId, password, email } = values();
      const user = await authService.signUp({ name, userId, password, email });

      form.reset();
      checked.userId = null;
      checked.email = null;
      ['name', 'userId', 'password', 'passwordConfirm', 'email'].forEach((n) => setMsg(n, ''));

      showToast(`${user.name}님, 회원가입이 완료되었습니다. 로그인해 주세요.`);
      const loginId = document.getElementById('loginUserId');
      if (loginId && !document.getElementById('loginForm').hidden) {
        loginId.value = user.userId;
        document.getElementById('loginPassword').value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('loginPassword').focus({ preventScroll: true });
      }
    } catch (err) {
      if (err.code === 'auth/duplicate-user-id') {
        checked.userId = { value: values().userId, available: false };
        setMsg('userId', err.message);
        field('userId').focus();
      } else if (err.code === 'auth/duplicate-email') {
        checked.email = { value: values().email, available: false };
        setMsg('email', err.message);
        field('email').focus();
      } else {
        errorEl.textContent = friendlyError(err, '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        errorEl.hidden = false;
      }
    } finally {
      setBusy(submitBtn, false);
    }
  });
}

function focusSignupIfRequested() {
  if (window.location.hash !== '#signup') return;
  const card = document.getElementById('signup');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('signupName').focus({ preventScroll: true });
}

function init() {
  const redirectUrl = getRedirectUrl();
  initLogin(redirectUrl);
  initSignup();
  focusSignupIfRequested();
  window.addEventListener('hashchange', focusSignupIfRequested);
  authService.verifySession();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
