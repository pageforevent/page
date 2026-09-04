/**
 * 간편 관리자 (Admin) 로직 스크립트 - admin.js
 */

const REPO_OWNER = 'pageforevent';
const REPO_NAME = 'page';
const BRANCH_NAME = 'main';
const DATA_PATH = 'data.json';
const CONFIG_PATH = 'admin-config.json';

// 세션 및 상태
let currentToken = null;
let currentSha = null;
let originalData = null;

// ==========================================================================
// 1. Web Crypto API 암호화 / 복호화 유틸리티 (PBKDF2 + AES-GCM)
// ==========================================================================

function buf2hex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hex2buf(hexString) {
    const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
}

// 비밀번호와 Salt로부터 AES-GCM 키 생성
async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// 텍스트 암호화 (JSON 반환: salt, iv, ciphertext)
async function encryptToken(token, password) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        enc.encode(token)
    );

    return {
        salt: buf2hex(salt),
        iv: buf2hex(iv),
        ciphertext: buf2hex(ciphertext)
    };
}

// 텍스트 복호화 (비밀번호 일치 시 평문 반환, 불일치 시 Error)
async function decryptToken(encryptedObj, password) {
    const dec = new TextDecoder();
    const salt = hex2buf(encryptedObj.salt);
    const iv = hex2buf(encryptedObj.iv);
    const ciphertext = hex2buf(encryptedObj.ciphertext);

    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        ciphertext
    );

    return dec.decode(decrypted);
}

// UTF-8 Base64 인코딩 / 디코딩
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// ==========================================================================
// 2. UI 및 토스트 메시지
// ==========================================================================

function showToast(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.2s ease';
        setTimeout(() => toast.remove(), 250);
    }, duration);
}

// ==========================================================================
// 3. GitHub API 통신
// ==========================================================================

async function fetchFromGitHub(path, token = currentToken) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH_NAME}&t=${Date.now()}`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    const res = await fetch(url, { headers, cache: 'no-cache' });
    if (res.status === 404) return null;
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub 요청 실패 (${res.status})`);
    }
    return await res.json();
}

async function commitToGitHub(path, contentStr, message, token = currentToken, sha = currentSha) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
    };

    const body = {
        message: message,
        content: b64EncodeUnicode(contentStr),
        branch: BRANCH_NAME
    };
    if (sha) {
        body.sha = sha;
    }

    const res = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `저장 실패 (${res.status})`);
    }

    return await res.json();
}

// ==========================================================================
// 4. 인증 및 설정 관리
// ==========================================================================

// 저장된 암호화 설정 가져오기 (1: 로컬스토리지, 2: 원격 admin-config.json)
async function getEncryptedConfig() {
    // 1. 로컬에 저장된 게 있으면 우선 사용
    const local = localStorage.getItem('page_admin_config');
    if (local) {
        try {
            return JSON.parse(local);
        } catch (e) {
            console.warn('Local config parse error:', e);
        }
    }

    // 2. 없으면 원격 admin-config.json 확인
    try {
        const remoteFile = await fetchFromGitHub(CONFIG_PATH, null);
        if (remoteFile && remoteFile.content) {
            const decoded = b64DecodeUnicode(remoteFile.content.replace(/\s/g, ''));
            const parsed = JSON.parse(decoded);
            // 로컬에도 캐싱
            localStorage.setItem('page_admin_config', JSON.stringify(parsed));
            return parsed;
        }
    } catch (e) {
        console.log('No remote config found or error:', e.message);
    }

    return null;
}

// 비밀번호 검증 및 토큰 해독
async function authenticate(password, rememberMe = false) {
    const config = await getEncryptedConfig();
    if (!config) {
        throw new Error('CONFIG_NOT_FOUND');
    }

    let token;
    try {
        token = await decryptToken(config, password);
    } catch (err) {
        throw new Error('PASSWORD_INCORRECT');
    }

    // 토큰 유효성 검사 (간단한 API 호출)
    try {
        const testRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!testRes.ok) {
            throw new Error('TOKEN_EXPIRED');
        }
    } catch (e) {
        throw new Error('토큰이 만료되었거나 권한이 부족합니다: ' + e.message);
    }

    currentToken = token;

    if (rememberMe) {
        localStorage.setItem('page_admin_saved_pw', password);
    } else {
        localStorage.removeItem('page_admin_saved_pw');
    }

    return token;
}

// ==========================================================================
// 5. 데이터 로드 및 폼 바인딩
// ==========================================================================

async function loadAndRenderContent() {
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('editor-view').style.display = 'none';

    try {
        const fileData = await fetchFromGitHub(DATA_PATH, currentToken);
        if (!fileData) {
            throw new Error('data.json 파일을 찾을 수 없습니다.');
        }

        currentSha = fileData.sha;
        const decodedContent = b64DecodeUnicode(fileData.content.replace(/\s/g, ''));
        originalData = JSON.parse(decodedContent);

        populateForm(originalData);

        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('editor-view').style.display = 'block';
        document.getElementById('save-bar').style.display = 'block';

        updateSaveStatus('최신 데이터를 불러왔습니다.', 'ready');
    } catch (err) {
        document.getElementById('loading-indicator').style.display = 'none';
        showToast('데이터 불러오기 실패: ' + err.message, 'error', 5000);
    }
}

function populateForm(data) {
    // 1. 기본 정보
    document.getElementById('field-pageTitle').value = data.pageTitle || '';
    document.getElementById('field-headerTitle').value = data.headerTitle || '';
    document.getElementById('field-subtitle').value = data.subtitle || '';

    // 2. STEP 01 (steps[0])
    const step1 = data.steps && data.steps[0] ? data.steps[0] : {};
    document.getElementById('field-step1-title').value = step1.title || '';
    document.getElementById('field-step1-tagline').value = step1.tagline || '';
    document.getElementById('field-step1-desc').value = step1.description || '';
    document.getElementById('field-step1-button').value = step1.buttonText || '';
    document.getElementById('field-step1-link-android').value = step1.link_android || '';
    document.getElementById('field-step1-link-ios').value = step1.link_ios || '';
    document.getElementById('field-step1-link-default').value = step1.link || '';

    // 3. STEP 02 (steps[1])
    const step2 = data.steps && data.steps[1] ? data.steps[1] : {};
    document.getElementById('field-step2-title').value = step2.title || '';
    document.getElementById('field-step2-tagline').value = step2.tagline || '';
    document.getElementById('field-step2-desc').value = step2.description || '';
    document.getElementById('field-step2-button').value = step2.buttonText || '';
    document.getElementById('field-step2-link').value = step2.link || '';

    // 4. STEP 03 사은 행사 (giftStep)
    const gift = data.giftStep || {};
    document.getElementById('field-step3-title').value = gift.title || '';
    document.getElementById('field-step3-tagline').value = gift.tagline || '';
    document.getElementById('field-step3-desc').value = gift.description || '';

    // 혜택 1
    const pOffer = gift.primaryOffer || {};
    document.getElementById('field-step3-offer1-title').value = pOffer.title || '';
    document.getElementById('field-step3-offer1-button').value = pOffer.buttonText || '';
    document.getElementById('field-step3-offer1-link').value = pOffer.link || '';

    // 혜택 2
    const showSecond = Boolean(gift.showSecondOffer);
    document.getElementById('field-step3-show-second').checked = showSecond;
    toggleSecondOfferVisibility(showSecond);

    const sOffer = gift.secondaryOffer || {};
    document.getElementById('field-step3-offer2-title').value = sOffer.title || '';
    document.getElementById('field-step3-offer2-button').value = sOffer.buttonText || '';
    document.getElementById('field-step3-offer2-link').value = sOffer.link || '';
}

function toggleSecondOfferVisibility(show) {
    const card = document.getElementById('step3-offer2-card');
    if (card) {
        card.style.display = show ? 'block' : 'none';
    }
}

// 폼 입력값을 JSON 객체로 수집 (기존 불변 필드 iconSvg, id 등 유지)
function collectFormData() {
    const updated = JSON.parse(JSON.stringify(originalData));

    // 기본 정보
    updated.pageTitle = document.getElementById('field-pageTitle').value.trim();
    updated.headerTitle = document.getElementById('field-headerTitle').value.trim();
    updated.subtitle = document.getElementById('field-subtitle').value.trim();

    // STEP 01
    if (!updated.steps) updated.steps = [];
    if (!updated.steps[0]) updated.steps[0] = { id: 'step1', stepNum: 'STEP 01' };
    updated.steps[0].title = document.getElementById('field-step1-title').value.trim();
    updated.steps[0].tagline = document.getElementById('field-step1-tagline').value.trim();
    updated.steps[0].description = document.getElementById('field-step1-desc').value.trim();
    updated.steps[0].buttonText = document.getElementById('field-step1-button').value.trim();
    updated.steps[0].link_android = document.getElementById('field-step1-link-android').value.trim();
    updated.steps[0].link_ios = document.getElementById('field-step1-link-ios').value.trim();
    updated.steps[0].link = document.getElementById('field-step1-link-default').value.trim() || updated.steps[0].link_android;

    // STEP 02
    if (!updated.steps[1]) updated.steps[1] = { id: 'step2', stepNum: 'STEP 02' };
    updated.steps[1].title = document.getElementById('field-step2-title').value.trim();
    updated.steps[1].tagline = document.getElementById('field-step2-tagline').value.trim();
    updated.steps[1].description = document.getElementById('field-step2-desc').value.trim();
    updated.steps[1].buttonText = document.getElementById('field-step2-button').value.trim();
    updated.steps[1].link = document.getElementById('field-step2-link').value.trim();

    // STEP 03
    if (!updated.giftStep) updated.giftStep = { id: 'step3', stepNum: 'STEP 03' };
    updated.giftStep.title = document.getElementById('field-step3-title').value.trim();
    updated.giftStep.tagline = document.getElementById('field-step3-tagline').value.trim();
    updated.giftStep.description = document.getElementById('field-step3-desc').value.trim();

    // 사은 혜택 1
    if (!updated.giftStep.primaryOffer) updated.giftStep.primaryOffer = {};
    updated.giftStep.primaryOffer.title = document.getElementById('field-step3-offer1-title').value.trim();
    updated.giftStep.primaryOffer.buttonText = document.getElementById('field-step3-offer1-button').value.trim();
    updated.giftStep.primaryOffer.link = document.getElementById('field-step3-offer1-link').value.trim();

    // 사은 혜택 2
    const showSecond = document.getElementById('field-step3-show-second').checked;
    updated.giftStep.showSecondOffer = showSecond;
    if (!updated.giftStep.secondaryOffer) updated.giftStep.secondaryOffer = {};
    updated.giftStep.secondaryOffer.title = document.getElementById('field-step3-offer2-title').value.trim();
    updated.giftStep.secondaryOffer.buttonText = document.getElementById('field-step3-offer2-button').value.trim();
    updated.giftStep.secondaryOffer.link = document.getElementById('field-step3-offer2-link').value.trim();

    return updated;
}

function updateSaveStatus(text, state = 'ready') {
    const statusTextEl = document.getElementById('save-status-text');
    const dotEl = document.getElementById('save-status-dot');
    if (!statusTextEl || !dotEl) return;

    statusTextEl.textContent = text;
    dotEl.className = 'status-dot';
    if (state === 'saving') {
        dotEl.classList.add('saving');
    }
}

// ==========================================================================
// 6. 데이터 저장 (GitHub 자동 커밋)
// ==========================================================================

async function saveChanges() {
    const saveBtn = document.getElementById('btn-save-submit');
    saveBtn.disabled = true;
    updateSaveStatus('GitHub 저장소에 커밋하는 중...', 'saving');

    try {
        const updatedData = collectFormData();
        const jsonString = JSON.stringify(updatedData, null, 2);

        const commitRes = await commitToGitHub(
            DATA_PATH,
            jsonString,
            '콘텐츠 수정 (간편 관리자)',
            currentToken,
            currentSha
        );

        // 새 sha 갱신
        currentSha = commitRes.content.sha;
        originalData = updatedData;

        updateSaveStatus('방금 저장 완료! (사이트 자동 배포 중)', 'ready');
        showToast('성공적으로 저장되었습니다! 약 30초~1분 후 실제 사이트에 반영됩니다.', 'success', 5000);
    } catch (err) {
        console.error(err);
        updateSaveStatus('저장 중 오류가 발생했습니다.', 'ready');
        showToast('저장 실패: ' + err.message, 'error', 5000);
    } finally {
        saveBtn.disabled = false;
    }
}

// ==========================================================================
// 7. 초기 설정 모달 (Setup Wizard)
// ==========================================================================

function openSetupModal() {
    document.getElementById('setup-modal').classList.add('active');
}

function closeSetupModal() {
    document.getElementById('setup-modal').classList.remove('active');
}

async function handleSetupSubmit(e) {
    e.preventDefault();
    const pw = document.getElementById('setup-password').value.trim();
    const token = document.getElementById('setup-token').value.trim();
    const saveRemote = document.getElementById('setup-save-remote').checked;

    if (!pw || pw.length < 4) {
        showToast('비밀번호는 최소 4자리 이상 입력해주세요.', 'error');
        return;
    }
    if (!token || !token.startsWith('gh')) {
        showToast('올바른 GitHub 토큰을 입력해주세요 (ghp_ 또는 github_pat_로 시작).', 'error');
        return;
    }

    const submitBtn = document.getElementById('btn-setup-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '설정 저장 중...';

    try {
        // 1. 토큰 암호화
        const encrypted = await encryptToken(token, pw);
        const encryptedJsonStr = JSON.stringify(encrypted, null, 2);

        // 2. 로컬 브라우저에 저장
        localStorage.setItem('page_admin_config', encryptedJsonStr);

        // 3. 원격 저장소에 admin-config.json 커밋 (다른 기기에서도 암호만으로 접속 가능하도록)
        if (saveRemote) {
            let configSha = null;
            try {
                const existingFile = await fetchFromGitHub(CONFIG_PATH, token);
                if (existingFile) configSha = existingFile.sha;
            } catch (e) {
                // 없을 수 있음
            }

            await commitToGitHub(
                CONFIG_PATH,
                encryptedJsonStr,
                '관리자 암호화 설정 저장',
                token,
                configSha
            );
        }

        showToast('관리자 설정이 완료되었습니다! 이제 로그인할 수 있습니다.', 'success');
        closeSetupModal();

        // 로그인 폼에 새 암호 자동 입력 및 로그인 시도
        document.getElementById('login-password').value = pw;
        document.getElementById('login-remember').checked = true;
        document.getElementById('login-form').dispatchEvent(new Event('submit'));
    } catch (err) {
        console.error(err);
        showToast('설정 중 오류 발생: ' + err.message, 'error', 5000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '설정 완료 및 로그인';
    }
}

// ==========================================================================
// 8. 초기화 및 이벤트 리스너
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 혜택 2 토글 이벤트
    const secondOfferToggle = document.getElementById('field-step3-show-second');
    if (secondOfferToggle) {
        secondOfferToggle.addEventListener('change', (e) => {
            toggleSecondOfferVisibility(e.target.checked);
        });
    }

    // 설정 모달 열기/닫기
    const btnOpenSetup = document.getElementById('btn-open-setup');
    if (btnOpenSetup) btnOpenSetup.addEventListener('click', openSetupModal);

    const btnCloseSetup = document.getElementById('btn-close-setup');
    if (btnCloseSetup) btnCloseSetup.addEventListener('click', closeSetupModal);

    // 설정 폼 제출
    const setupForm = document.getElementById('setup-form');
    if (setupForm) setupForm.addEventListener('submit', handleSetupSubmit);

    // 로그인 폼 제출
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwInput = document.getElementById('login-password');
            const pw = pwInput.value;
            const rememberMe = document.getElementById('login-remember').checked;
            const loginBtn = document.getElementById('btn-login-submit');

            if (!pw) {
                showToast('비밀번호를 입력해주세요.', 'error');
                return;
            }

            loginBtn.disabled = true;
            loginBtn.textContent = '로그인 중...';

            try {
                await authenticate(pw, rememberMe);
                showToast('로그인 성공!', 'success');

                document.getElementById('login-view').style.display = 'none';
                document.getElementById('btn-logout').style.display = 'inline-flex';

                await loadAndRenderContent();
            } catch (err) {
                console.error(err);
                if (err.message === 'CONFIG_NOT_FOUND') {
                    showToast('아직 관리자 초기 설정이 되지 않았습니다. [초기 설정]을 진행해주세요.', 'info', 4000);
                    openSetupModal();
                } else if (err.message === 'PASSWORD_INCORRECT') {
                    showToast('비밀번호가 일치하지 않습니다.', 'error');
                } else {
                    showToast(err.message, 'error', 4000);
                }
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = '로그인';
            }
        });
    }

    // 저장 버튼 클릭
    const btnSave = document.getElementById('btn-save-submit');
    if (btnSave) {
        btnSave.addEventListener('click', saveChanges);
    }

    // 되돌리기 버튼 클릭
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm('수정한 내용을 모두 취소하고 마지막 저장 상태로 되돌릴까요?')) {
                if (originalData) populateForm(originalData);
                showToast('수정 전 상태로 복원되었습니다.', 'info');
            }
        });
    }

    // 로그아웃 버튼 클릭
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('관리자 세션에서 로그아웃하시겠습니까?')) {
                currentToken = null;
                localStorage.removeItem('page_admin_saved_pw');
                location.reload();
            }
        });
    }

    // 자동 로그인 확인 (기억된 비밀번호가 있는 경우)
    const savedPw = localStorage.getItem('page_admin_saved_pw');
    if (savedPw) {
        document.getElementById('login-password').value = savedPw;
        document.getElementById('login-remember').checked = true;
        // 바로 자동 로그인 시도
        try {
            await authenticate(savedPw, true);
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('btn-logout').style.display = 'inline-flex';
            await loadAndRenderContent();
        } catch (e) {
            console.log('Auto login skipped:', e.message);
            localStorage.removeItem('page_admin_saved_pw');
        }
    } else {
        // 설정이 아예 없으면 초기 설정 팝업 유도 힌트
        getEncryptedConfig().then(config => {
            if (!config) {
                const hintEl = document.getElementById('no-config-hint');
                if (hintEl) hintEl.style.display = 'block';
            }
        });
    }
});
