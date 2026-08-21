document.addEventListener('DOMContentLoaded', () => {
    initParticleBackground();
    loadEventData();
});

// 사용자의 모바일 OS 판별
function getMobileOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    return 'unknown';
}

// 배경 반짝이는 별빛/스파클 파티클 캔버스 효과
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 45);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.2 + 0.8,
            speedY: -(Math.random() * 0.4 + 0.15),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            color: ['#FCD34D', '#38BDF8', '#F472B6', '#FFFFFF', '#A78BFA'][Math.floor(Math.random() * 5)]
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.opacity += Math.sin(Date.now() * p.twinkleSpeed) * 0.02;

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            const alpha = Math.max(0.1, Math.min(1, p.opacity));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = p.size * 3;
            ctx.shadowColor = p.color;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// 이벤트 데이터 로드
async function loadEventData() {
    try {
        const response = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        renderPage(data);
    } catch (error) {
        console.error(error);
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div class="error-msg">
                    <p>데이터를 불러오는 중 문제가 발생했습니다.</p>
                    <button onclick="location.reload()" class="btn-retry">다시 시도</button>
                </div>
            `;
        }
    }
}

// 광안대교 및 오션 나이트 일러스트 SVG 생성
function createGwanganBridgeIllustrationSvg() {
    return `
    <div class="bridge-illustration-card">
        <svg class="gwangan-bridge-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- 하늘 배경 그라데이션 -->
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#070D1E"/>
                    <stop offset="50%" stop-color="#0F284E"/>
                    <stop offset="100%" stop-color="#1A4A7A"/>
                </linearGradient>

                <!-- 바다 그라데이션 -->
                <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#11335A"/>
                    <stop offset="50%" stop-color="#0A223E"/>
                    <stop offset="100%" stop-color="#051324"/>
                </linearGradient>

                <!-- 달빛 글로우 -->
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#FFF6D1" stop-opacity="1"/>
                    <stop offset="40%" stop-color="#FCD34D" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#FCD34D" stop-opacity="0"/>
                </radialGradient>

                <!-- 주탑 및 케이블 골드/사이언 그라데이션 -->
                <linearGradient id="bridgeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#F59E0B"/>
                    <stop offset="50%" stop-color="#FCD34D"/>
                    <stop offset="100%" stop-color="#38BDF8"/>
                </linearGradient>

                <!-- 다리 반사광 그라데이션 -->
                <linearGradient id="reflectionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FCD34D" stop-opacity="0.45"/>
                    <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
                </linearGradient>
            </defs>

            <!-- 1. 하늘 배경 -->
            <rect width="400" height="200" rx="16" fill="url(#skyGrad)"/>

            <!-- 2. 밤하늘의 별들 (Twinkling Stars) -->
            <g class="stars-layer">
                <circle cx="35" cy="30" r="1.2" fill="#FFF" class="star star-1"/>
                <circle cx="85" cy="22" r="1.5" fill="#FCD34D" class="star star-2"/>
                <circle cx="140" cy="38" r="1" fill="#FFF" class="star star-3"/>
                <circle cx="210" cy="20" r="1.4" fill="#38BDF8" class="star star-1"/>
                <circle cx="275" cy="32" r="1.2" fill="#FFF" class="star star-2"/>
                <circle cx="345" cy="18" r="1.6" fill="#FCD34D" class="star star-3"/>
                <circle cx="370" cy="45" r="1" fill="#FFF" class="star star-1"/>
            </g>

            <!-- 3. 귀여운 달 (Moon) & 은은한 아우라 -->
            <g class="moon-wrapper" transform="translate(45, 42)">
                <circle cx="0" cy="0" r="22" fill="url(#moonGlow)" class="moon-aura"/>
                <circle cx="0" cy="0" r="13" fill="#FFFBEB"/>
                <!-- 달 크레이터 -->
                <circle cx="-3" cy="-4" r="2.2" fill="#FDE68A" opacity="0.6"/>
                <circle cx="4" cy="3" r="3.2" fill="#FDE68A" opacity="0.6"/>
                <circle cx="-2" cy="5" r="1.8" fill="#FDE68A" opacity="0.5"/>
            </g>

            <!-- 4. 페스티벌 불꽃놀이 (Fireworks Effect) -->
            <g class="fireworks" transform="translate(325, 48)">
                <circle cx="0" cy="0" r="2" fill="#EC4899" class="firework-core"/>
                <line x1="0" y1="0" x2="0" y2="-16" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" class="spark spark-1"/>
                <line x1="0" y1="0" x2="12" y2="-12" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" class="spark spark-2"/>
                <line x1="0" y1="0" x2="16" y2="0" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round" class="spark spark-3"/>
                <line x1="0" y1="0" x2="12" y2="12" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" class="spark spark-4"/>
                <line x1="0" y1="0" x2="-12" y2="12" stroke="#34D399" stroke-width="1.5" stroke-linecap="round" class="spark spark-5"/>
                <line x1="0" y1="0" x2="-16" y2="0" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" class="spark spark-6"/>
                <line x1="0" y1="0" x2="-12" y2="-12" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" class="spark spark-7"/>
            </g>

            <g class="fireworks fireworks-sm" transform="translate(180, 35)">
                <line x1="0" y1="0" x2="0" y2="-11" stroke="#FCD34D" stroke-width="1.2" stroke-linecap="round" class="spark spark-1"/>
                <line x1="0" y1="0" x2="9" y2="-7" stroke="#38BDF8" stroke-width="1.2" stroke-linecap="round" class="spark spark-2"/>
                <line x1="0" y1="0" x2="9" y2="7" stroke="#EC4899" stroke-width="1.2" stroke-linecap="round" class="spark spark-3"/>
                <line x1="0" y1="0" x2="-9" y2="7" stroke="#34D399" stroke-width="1.2" stroke-linecap="round" class="spark spark-4"/>
                <line x1="0" y1="0" x2="-9" y2="-7" stroke="#A78BFA" stroke-width="1.2" stroke-linecap="round" class="spark spark-5"/>
            </g>

            <!-- 5. 귀여운 부산 갈매기 (Seagulls) -->
            <g class="seagull-group">
                <g class="seagull seagull-1">
                    <path d="M0,0 Q6,-8 12,0 Q18,-8 24,0" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
                </g>
                <g class="seagull seagull-2">
                    <path d="M0,0 Q4,-6 8,0 Q12,-6 16,0" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round"/>
                </g>
            </g>

            <!-- 6. 바다 (Sea Base) -->
            <rect x="0" y="132" width="400" height="68" fill="url(#seaGrad)"/>

            <!-- 7. 바다 위 광안대교 조명 반영 (Reflection) -->
            <polygon points="120,132 170,132 178,190 112,190" fill="url(#reflectionGrad)" class="bridge-reflection"/>
            <polygon points="230,132 280,132 288,190 222,190" fill="url(#reflectionGrad)" class="bridge-reflection"/>

            <!-- 8. 광안대교 구조물 (Gwangan Bridge Structure) -->
            <g class="gwangan-bridge-structure">
                <!-- 하단 교각 기초 기둥 -->
                <rect x="138" y="128" width="14" height="12" fill="#1E293B" rx="1.5"/>
                <rect x="248" y="128" width="14" height="12" fill="#1E293B" rx="1.5"/>

                <!-- 서스펜션 케이블 (메인 곡선 케이블) -->
                <!-- 좌측 접속교 케이블 -->
                <path d="M10,130 Q80,110 145,65" fill="none" stroke="url(#bridgeGrad)" stroke-width="2.2" class="cable-glow"/>
                <!-- 중앙 주경간 메인 케이블 -->
                <path d="M145,65 Q200,122 255,65" fill="none" stroke="url(#bridgeGrad)" stroke-width="2.6" class="cable-glow main-cable"/>
                <!-- 우측 접속교 케이블 -->
                <path d="M255,65 Q320,110 390,130" fill="none" stroke="url(#bridgeGrad)" stroke-width="2.2" class="cable-glow"/>

                <!-- 수직 현수선 케이블 (Vertical Hangers) -->
                <g stroke="#FCD34D" stroke-width="0.8" opacity="0.65" class="vertical-hangers">
                    <!-- 중앙 경간 -->
                    <line x1="165" y1="84" x2="165" y2="128"/>
                    <line x1="180" y1="102" x2="180" y2="128"/>
                    <line x1="200" y1="113" x2="200" y2="128"/>
                    <line x1="220" y1="102" x2="220" y2="128"/>
                    <line x1="235" y1="84" x2="235" y2="128"/>
                    <!-- 좌우측 경간 -->
                    <line x1="70" y1="120" x2="70" y2="128"/>
                    <line x1="100" y1="106" x2="100" y2="128"/>
                    <line x1="125" y1="88" x2="125" y2="128"/>
                    <line x1="275" y1="88" x2="275" y2="128"/>
                    <line x1="300" y1="106" x2="300" y2="128"/>
                    <line x1="330" y1="120" x2="330" y2="128"/>
                </g>

                <!-- 케이블 위 인터랙티브 LED 조명 점 (LED Light Show) -->
                <g class="led-lights">
                    <circle cx="145" cy="65" r="2" fill="#FCD34D" class="led-dot led-1"/>
                    <circle cx="165" cy="84" r="1.8" fill="#38BDF8" class="led-dot led-2"/>
                    <circle cx="180" cy="102" r="1.8" fill="#EC4899" class="led-dot led-3"/>
                    <circle cx="200" cy="113" r="2.2" fill="#FCD34D" class="led-dot led-4"/>
                    <circle cx="220" cy="102" r="1.8" fill="#34D399" class="led-dot led-5"/>
                    <circle cx="235" cy="84" r="1.8" fill="#38BDF8" class="led-dot led-6"/>
                    <circle cx="255" cy="65" r="2" fill="#FCD34D" class="led-dot led-1"/>
                </g>

                <!-- 2층 복층 교량 트러스 상판 (Road Deck) -->
                <rect x="0" y="126" width="400" height="4" fill="#0F172A"/>
                <line x1="0" y1="125" x2="400" y2="125" stroke="#38BDF8" stroke-width="1.2" opacity="0.8"/>
                <line x1="0" y1="130" x2="400" y2="130" stroke="#FCD34D" stroke-width="1.2" opacity="0.9"/>

                <!-- 다리 위 주행 차량 빛 궤적 (Moving Traffic Lights) -->
                <g class="traffic-lights">
                    <line x1="20" y1="125.5" x2="60" y2="125.5" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round" class="car-light car-red"/>
                    <line x1="220" y1="125.5" x2="260" y2="125.5" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round" class="car-light car-red-2"/>
                    <line x1="380" y1="129.5" x2="340" y2="129.5" stroke="#FFFBEB" stroke-width="1.8" stroke-linecap="round" class="car-light car-white"/>
                    <line x1="180" y1="129.5" x2="140" y2="129.5" stroke="#FFFBEB" stroke-width="1.8" stroke-linecap="round" class="car-light car-white-2"/>
                </g>

                <!-- 좌측 메인 타워 (주탑 1) - 트러스 다이아몬드 스타일 -->
                <g class="main-tower tower-left">
                    <!-- 기둥 바디 -->
                    <line x1="141" y1="62" x2="141" y2="128" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                    <line x1="149" y1="62" x2="149" y2="128" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                    <!-- X 트러스 크로스 빔 -->
                    <line x1="141" y1="75" x2="149" y2="87" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="149" y1="75" x2="141" y2="87" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="141" y1="92" x2="149" y2="104" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="149" y1="92" x2="141" y2="104" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="141" y1="109" x2="149" y2="121" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="149" y1="109" x2="141" y2="121" stroke="#38BDF8" stroke-width="1.2"/>
                    <!-- 타워 상단 크라운 & 첨탑 -->
                    <polygon points="139,62 145,52 151,62" fill="#FCD34D"/>
                    <line x1="145" y1="52" x2="145" y2="46" stroke="#FCD34D" stroke-width="1.5"/>
                    <circle cx="145" cy="45" r="2" fill="#EF4444" class="beacon-light"/>
                </g>

                <!-- 우측 메인 타워 (주탑 2) - 트러스 다이아몬드 스타일 -->
                <g class="main-tower tower-right">
                    <!-- 기둥 바디 -->
                    <line x1="251" y1="62" x2="251" y2="128" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                    <line x1="259" y1="62" x2="259" y2="128" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                    <!-- X 트러스 크로스 빔 -->
                    <line x1="251" y1="75" x2="259" y2="87" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="259" y1="75" x2="251" y2="87" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="251" y1="92" x2="259" y2="104" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="259" y1="92" x2="251" y2="104" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="251" y1="109" x2="259" y2="121" stroke="#38BDF8" stroke-width="1.2"/>
                    <line x1="259" y1="109" x2="251" y2="121" stroke="#38BDF8" stroke-width="1.2"/>
                    <!-- 타워 상단 크라운 & 첨탑 -->
                    <polygon points="249,62 255,52 261,62" fill="#FCD34D"/>
                    <line x1="255" y1="52" x2="255" y2="46" stroke="#FCD34D" stroke-width="1.5"/>
                    <circle cx="255" cy="45" r="2" fill="#EF4444" class="beacon-light"/>
                </g>
            </g>

            <!-- 9. 바다 파도 레이어 (Animated Ocean Waves) -->
            <g class="ocean-waves">
                <!-- 뒤쪽 잔물결 -->
                <path d="M-100,155 C-50,152 0,158 50,155 C100,152 150,158 200,155 C250,152 300,158 350,155 C400,152 450,158 500,155 L500,200 L-100,200 Z" fill="#0C2D54" opacity="0.75" class="wave wave-back"/>
                <!-- 중간 파도 -->
                <path d="M-100,165 C-40,160 20,170 80,165 C140,160 200,170 260,165 C320,160 380,170 440,165 C500,160 560,170 620,165 L620,200 L-100,200 Z" fill="#0E3B6E" opacity="0.85" class="wave wave-mid"/>
                <!-- 앞쪽 파도 물결 & 하얀 포말 -->
                <path d="M-100,178 C-30,172 40,182 110,177 C180,172 250,182 320,177 C390,172 460,182 530,177 L530,200 L-100,200 Z" fill="#134B8A" class="wave wave-front"/>
                <!-- 반짝이는 수면 하이라이트 라인 -->
                <path d="M10,166 C70,162 130,170 190,166 C250,162 310,170 370,166" fill="none" stroke="#67E8F9" stroke-width="1.2" stroke-linecap="round" opacity="0.7" class="wave-shimmer"/>
                <path d="M40,182 C100,178 160,186 220,182 C280,178 340,186 400,182" fill="none" stroke="#FCD34D" stroke-width="1.2" stroke-linecap="round" opacity="0.6" class="wave-shimmer-2"/>
            </g>
        </svg>
    </div>
    `;
}

// 전체 페이지 렌더링 및 시네마틱 인트로 전환 제어
function renderPage(data) {
    document.title = data.pageTitle;

    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.classList.add('is-intro');
    }

    // 헤더 영역 렌더링
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = `
            ${createGwanganBridgeIllustrationSvg()}
            <div class="header-content">
                <h1 class="festival-title">${data.headerTitle}</h1>
            </div>
        `;
    }

    // 스텝 카드 영역 렌더링
    const stepContainer = document.getElementById('step-container');
    if (stepContainer) {
        stepContainer.innerHTML = '';
        const userOS = getMobileOS();

        data.steps.forEach((step, index) => {
            const stepElement = document.createElement('section');
            stepElement.className = 'step-card';
            stepElement.style.setProperty('--step-index', index);

            // 1번 어플 설치 단계일 경우 OS에 따라 링크 분기
            let finalLink = step.link;
            let osBadgeText = '';

            if (step.id === 'step1') {
                if (userOS === 'ios' && step.link_ios) {
                    finalLink = step.link_ios;
                    osBadgeText = '<span class="os-tag ios-tag">🍎 iOS 전용 연결</span>';
                } else if (userOS === 'android' && step.link_android) {
                    finalLink = step.link_android;
                    osBadgeText = '<span class="os-tag android-tag">🤖 Android 전용 연결</span>';
                } else {
                    finalLink = step.link_android || step.link;
                }
            }

            stepElement.innerHTML = `
                <div class="card-glow-bg"></div>
                <div class="card-header-row">
                    <span class="step-num-pill">${step.stepNum || `STEP 0${index + 1}`}</span>
                    ${osBadgeText}
                </div>
                <div class="card-body">
                    <div class="icon-avatar">
                        <div class="icon-pulse"></div>
                        <div class="icon-inner">
                            ${step.iconSvg}
                        </div>
                    </div>
                    <div class="card-text-group">
                        <h2 class="step-heading">${step.title}</h2>
                        <p class="step-desc">${step.description || ''}</p>
                    </div>
                </div>
                <div class="card-action">
                    <a href="${finalLink}" class="btn-action" target="${step.target || '_blank'}" rel="noopener noreferrer">
                        <span>${step.buttonText}</span>
                        <svg class="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </div>
            `;

            stepContainer.appendChild(stepElement);
        });
    }

    // 시네마틱 인트로 -> 본 페이지 전환 트리거
    let transitioned = false;
    function triggerPageTransition() {
        if (transitioned || !appContainer) return;
        transitioned = true;
        appContainer.classList.remove('is-intro');
        appContainer.classList.add('is-ready');
    }

    // 1.1초 동안 인트로를 보여준 후 상단 헤더로 부드럽게 축소 이동
    const transitionTimer = setTimeout(triggerPageTransition, 1100);

    // 사용자가 화면을 탭/클릭하면 즉시 인트로를 건너뛰고 전환
    function handleUserSkip() {
        clearTimeout(transitionTimer);
        triggerPageTransition();
        window.removeEventListener('click', handleUserSkip);
        window.removeEventListener('touchstart', handleUserSkip);
    }

    window.addEventListener('click', handleUserSkip, { once: true });
    window.addEventListener('touchstart', handleUserSkip, { once: true, passive: true });
}
