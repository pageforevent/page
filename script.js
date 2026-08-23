document.addEventListener('DOMContentLoaded', () => {
    initTimeTheme();
    loadEventData();
});

const TIME_THEMES = {
    morning: {
        label: 'SOFT MORNING',
        themeColor: '#F6C98D'
    },
    day: {
        label: 'VIVID DAY',
        themeColor: '#2474E8'
    },
    sunset: {
        label: 'GOLDEN SUNSET',
        themeColor: '#D95462'
    },
    night: {
        label: 'NEON NIGHT',
        themeColor: '#07091A'
    }
};

function resolveTimeTheme(date = new Date()) {
    const forcedTheme = new URLSearchParams(window.location.search).get('theme');
    if (forcedTheme && TIME_THEMES[forcedTheme]) return forcedTheme;

    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'sunset';
    return 'night';
}

function applyTimeTheme() {
    const now = new Date();
    const themeName = resolveTimeTheme(now);
    const theme = TIME_THEMES[themeName];
    const formattedTime = new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(now);

    document.documentElement.dataset.timeTheme = themeName;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme.themeColor);

    const periodLabel = document.getElementById('time-period-label');
    const timeLabel = document.getElementById('time-label');
    if (periodLabel) periodLabel.textContent = theme.label;
    if (timeLabel) timeLabel.textContent = formattedTime;
}

function initTimeTheme() {
    applyTimeTheme();
    window.setInterval(applyTimeTheme, 60 * 1000);
}

function getCurrentDateDisplay(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
        .format(date)
        .toUpperCase();

    return {
        label: `${year}.${month}.${day} · ${weekday}`,
        iso: `${year}-${month}-${day}`
    };
}

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

// 이벤트 데이터 로드
async function loadEventData() {
    try {
        // 브라우저 캐시를 재사용하면서 배포 후 변경 여부만 서버에 확인합니다.
        const response = await fetch('data.json', { cache: 'no-cache' });
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
function createGwanganBridgeIllustrationSvg(idSuffix = '') {
    return `
    <div class="bridge-illustration-card">
        <svg class="gwangan-bridge-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <!-- 하늘 배경 그라데이션 -->
                <linearGradient id="skyGrad${idSuffix}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#070D1E"/>
                    <stop offset="50%" stop-color="#0F284E"/>
                    <stop offset="100%" stop-color="#1A4A7A"/>
                </linearGradient>

                <!-- 바다 그라데이션 -->
                <linearGradient id="seaGrad${idSuffix}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#11335A"/>
                    <stop offset="50%" stop-color="#0A223E"/>
                    <stop offset="100%" stop-color="#051324"/>
                </linearGradient>

                <!-- 달빛 글로우 -->
                <radialGradient id="moonGlow${idSuffix}" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#FFF6D1" stop-opacity="1"/>
                    <stop offset="40%" stop-color="#FCD34D" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#FCD34D" stop-opacity="0"/>
                </radialGradient>

                <!-- 주탑 및 케이블 골드/사이언 그라데이션 -->
                <linearGradient id="bridgeGrad${idSuffix}" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#F59E0B"/>
                    <stop offset="50%" stop-color="#FCD34D"/>
                    <stop offset="100%" stop-color="#38BDF8"/>
                </linearGradient>

                <!-- 다리 반사광 그라데이션 -->
                <linearGradient id="reflectionGrad${idSuffix}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FCD34D" stop-opacity="0.45"/>
                    <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
                </linearGradient>
            </defs>

            <!-- 1. 하늘 배경 -->
            <rect width="400" height="200" rx="16" fill="url(#skyGrad${idSuffix})"/>

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
                <circle cx="0" cy="0" r="22" fill="url(#moonGlow${idSuffix})" class="moon-aura"/>
                <circle cx="0" cy="0" r="13" fill="#FFFBEB"/>
                <!-- 달 크레이터 -->
                <circle cx="-3" cy="-4" r="2.2" fill="#FDE68A" opacity="0.6"/>
                <circle cx="4" cy="3" r="3.2" fill="#FDE68A" opacity="0.6"/>
                <circle cx="-2" cy="5" r="1.8" fill="#FDE68A" opacity="0.5"/>
            </g>

            <!-- 4. 페스티벌 불꽃놀이 (Fireworks Effect) -->
            <g transform="translate(325, 48)">
                <g class="fireworks">
                <circle cx="0" cy="0" r="2" fill="#EC4899" class="firework-core"/>
                <line x1="0" y1="0" x2="0" y2="-16" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" class="spark spark-1"/>
                <line x1="0" y1="0" x2="12" y2="-12" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" class="spark spark-2"/>
                <line x1="0" y1="0" x2="16" y2="0" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round" class="spark spark-3"/>
                <line x1="0" y1="0" x2="12" y2="12" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" class="spark spark-4"/>
                <line x1="0" y1="0" x2="-12" y2="12" stroke="#34D399" stroke-width="1.5" stroke-linecap="round" class="spark spark-5"/>
                <line x1="0" y1="0" x2="-16" y2="0" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" class="spark spark-6"/>
                <line x1="0" y1="0" x2="-12" y2="-12" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" class="spark spark-7"/>
                </g>
            </g>

            <g transform="translate(180, 35)">
                <g class="fireworks fireworks-sm">
                <line x1="0" y1="0" x2="0" y2="-11" stroke="#FCD34D" stroke-width="1.2" stroke-linecap="round" class="spark spark-1"/>
                <line x1="0" y1="0" x2="9" y2="-7" stroke="#38BDF8" stroke-width="1.2" stroke-linecap="round" class="spark spark-2"/>
                <line x1="0" y1="0" x2="9" y2="7" stroke="#EC4899" stroke-width="1.2" stroke-linecap="round" class="spark spark-3"/>
                <line x1="0" y1="0" x2="-9" y2="7" stroke="#34D399" stroke-width="1.2" stroke-linecap="round" class="spark spark-4"/>
                <line x1="0" y1="0" x2="-9" y2="-7" stroke="#A78BFA" stroke-width="1.2" stroke-linecap="round" class="spark spark-5"/>
                </g>
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
            <rect x="0" y="132" width="400" height="68" fill="url(#seaGrad${idSuffix})"/>

            <!-- 7. 바다 위 광안대교 조명 반영 (Reflection) -->
            <polygon points="120,132 170,132 178,190 112,190" fill="url(#reflectionGrad${idSuffix})" class="bridge-reflection"/>
            <polygon points="230,132 280,132 288,190 222,190" fill="url(#reflectionGrad${idSuffix})" class="bridge-reflection"/>

            <!-- 8. 광안대교 구조물 (Gwangan Bridge Structure) -->
            <g class="gwangan-bridge-structure">
                <!-- 하단 교각 기초 기둥 -->
                <rect x="138" y="128" width="14" height="12" fill="#1E293B" rx="1.5"/>
                <rect x="248" y="128" width="14" height="12" fill="#1E293B" rx="1.5"/>

                <!-- 서스펜션 케이블 (메인 곡선 케이블) -->
                <!-- 좌측 접속교 케이블 -->
                <path d="M10,130 Q80,110 145,65" fill="none" stroke="url(#bridgeGrad${idSuffix})" stroke-width="2.2" class="cable-glow"/>
                <!-- 중앙 주경간 메인 케이블 -->
                <path d="M145,65 Q200,122 255,65" fill="none" stroke="url(#bridgeGrad${idSuffix})" stroke-width="2.6" class="cable-glow main-cable"/>
                <!-- 우측 접속교 케이블 -->
                <path d="M255,65 Q320,110 390,130" fill="none" stroke="url(#bridgeGrad${idSuffix})" stroke-width="2.2" class="cable-glow"/>

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
        <div class="hero-sticker" aria-hidden="true">
            <span>BUSAN</span>
        </div>
    </div>
    `;
}

// 다섯 장소의 실루엣은 고정하고, 네 시간대의 팔레트와 모션은 CSS로 바꿉니다.
const BUSAN_SCENES = {
    gwangan: true,
    gamcheon: true,
    nurimaru: true,
    huinnyeoul: true,
    jagalchi: true
};

function chooseRandomBusanScene() {
    const keys = Object.keys(BUSAN_SCENES);
    const previewScene = new URLSearchParams(window.location.search).get('scene');
    if (previewScene && BUSAN_SCENES[previewScene]) return previewScene;

    // 한 장소가 연속으로 뽑히지 않고, 다섯 장소를 모두 본 뒤 다시 섞습니다.
    try {
        const bagKey = 'busan-scene-bag-v2';
        const lastKey = 'busan-scene-last-v2';
        const lastScene = window.localStorage.getItem(lastKey);
        let sceneBag = JSON.parse(window.localStorage.getItem(bagKey) || '[]')
            .filter((key) => keys.includes(key));

        if (sceneBag.length === 0) {
            sceneBag = [...keys];
            for (let index = sceneBag.length - 1; index > 0; index -= 1) {
                const swapIndex = Math.floor(Math.random() * (index + 1));
                [sceneBag[index], sceneBag[swapIndex]] = [sceneBag[swapIndex], sceneBag[index]];
            }
            if (sceneBag[0] === lastScene && sceneBag.length > 1) {
                [sceneBag[0], sceneBag[1]] = [sceneBag[1], sceneBag[0]];
            }
        }

        const selectedScene = sceneBag.shift();
        window.localStorage.setItem(bagKey, JSON.stringify(sceneBag));
        window.localStorage.setItem(lastKey, selectedScene);
        return selectedScene;
    } catch (error) {
        return keys[Math.floor(Math.random() * keys.length)];
    }
}

function createAtmosphereSvg() {
    return `
        <g class="time-atmosphere atmosphere-morning">
            <g class="morning-sun" transform="translate(76 63)"><circle r="27" fill="var(--scene-sun)" opacity=".16"/><circle r="14" fill="var(--scene-sun)"/></g>
            <g class="morning-mist" fill="var(--scene-cloud)" opacity=".72"><path d="M-25 76C4 63 36 68 62 76c28 9 51 4 76-3v16H-25Z"/><path d="M278 59c23-11 53-8 79 3c19 7 38 4 61-5v16H278Z" opacity=".52"/></g>
            <g class="morning-birds" fill="none" stroke="var(--scene-ink-soft)" stroke-width="1.5" stroke-linecap="round"><path d="M280 52q7-8 14 0q7-8 14 0M317 68q5-6 10 0q5-6 10 0"/></g>
        </g>
        <g class="time-atmosphere atmosphere-day">
            <g class="day-sun" transform="translate(330 43)"><g class="day-rays" stroke="var(--scene-sun)" stroke-width="2" stroke-linecap="round"><path d="M0-24V-31M0 24v7M-24 0h-7M24 0h7M-17-17l-5-5M17 17l5 5M17-17l5-5M-17 17l-5 5"/></g><circle r="16" fill="var(--scene-sun)"/></g>
            <g class="day-cloud day-cloud-one" fill="var(--scene-cloud)"><path d="M25 55c6-13 25-12 30 0c12-7 27 1 26 12H14c-1-8 4-13 11-12Z"/></g>
            <g class="day-cloud day-cloud-two" fill="var(--scene-cloud)" opacity=".74"><path d="M210 36c5-10 20-9 25 0c9-5 20 1 20 10h-54c0-7 3-11 9-10Z"/></g>
        </g>
        <g class="time-atmosphere atmosphere-sunset">
            <g class="sunset-sun" transform="translate(310 96)"><circle r="34" fill="var(--scene-sun)" opacity=".14"/><circle r="20" fill="var(--scene-sun)"/></g>
            <path class="sunset-reflection" d="M284 130h52l28 70H256Z" fill="var(--scene-sun)" opacity=".22"/>
            <g class="sunset-birds" fill="none" stroke="var(--scene-ink-soft)" stroke-width="1.6" stroke-linecap="round"><path d="M48 62q8-9 16 0q8-9 16 0M88 78q5-6 10 0q5-6 10 0"/></g>
        </g>
        <g class="time-atmosphere atmosphere-night">
            <g class="night-stars" fill="var(--scene-star)"><circle cx="34" cy="26" r="1.2"/><circle cx="95" cy="19" r="1.5"/><circle cx="151" cy="38" r="1"/><circle cx="214" cy="22" r="1.3"/><circle cx="274" cy="31" r="1.1"/><circle cx="369" cy="22" r="1.5"/></g>
            <g class="night-moon" transform="translate(58 48)"><circle r="22" fill="var(--scene-moon)" opacity=".14"/><circle r="12" fill="var(--scene-moon)"/><circle cx="4" cy="-2" r="11" fill="var(--scene-sky-top)"/></g>
            <g class="night-firework" transform="translate(334 50)" stroke="var(--scene-pop-2)" stroke-width="1.5" stroke-linecap="round"><path d="M0-2v-16M2 0l13-10M3 2l16 1M2 4l11 12M-2 4l-12 11M-3 1l-16-1M-2-1l-12-12"/><circle r="2" fill="var(--scene-pop-1)" stroke="none"/></g>
        </g>`;
}

function createGwanganSceneSvg() {
    return `
        <rect y="128" width="400" height="72" fill="var(--scene-sea-top)"/><path d="M0 160Q100 145 200 160t200 0v40H0Z" fill="var(--scene-sea-bottom)"/>
        <g class="scene-landmark gwangan-landmark">
            <g fill="none" stroke="var(--scene-line)" stroke-linecap="round"><path d="M8 128Q78 112 145 66M145 66Q200 119 255 66M255 66Q323 112 392 128" stroke-width="2.6"/><g stroke-width=".8" opacity=".7"><path d="M165 86v40M182 103v23M200 114v12M218 103v23M235 86v40M105 103v23M295 103v23"/></g></g>
            <g stroke="var(--scene-structure)" stroke-width="3" stroke-linecap="round"><path d="M141 126V61M149 126V61M251 126V61M259 126V61"/></g>
            <g stroke="var(--scene-pop-2)" stroke-width="1.1"><path d="M141 76l8 12m0-12l-8 12m0 9l8 12m0-12l-8 12M251 76l8 12m0-12l-8 12m0 9l8 12m0-12l-8 12"/></g>
            <path d="M0 125H400" stroke="var(--scene-ink)" stroke-width="7"/><path d="M0 124H400" stroke="var(--scene-line)" stroke-width="1.3"/>
            <g class="scene-night-lights" fill="var(--scene-light)"><circle cx="145" cy="58" r="2"/><circle cx="170" cy="90" r="1.8"/><circle cx="200" cy="112" r="2"/><circle cx="230" cy="90" r="1.8"/><circle cx="255" cy="58" r="2"/></g>
            <g class="bridge-traffic" stroke-width="2" stroke-linecap="round"><path d="M10 122h38" stroke="var(--scene-pop-1)"/><path d="M352 128h38" stroke="var(--scene-light)"/></g>
        </g><g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.2" opacity=".65"><path d="M-30 153q45-7 90 0t90 0t90 0t90 0t90 0M-60 178q58-8 116 0t116 0t116 0t116 0"/></g>`;
}

function createGamcheonSceneSvg() {
    return `
        <path d="M0 116L62 87l43 13l48-39l50 26l54-18l55 28l88-20v123H0Z" fill="var(--scene-hill)"/>
        <g class="scene-landmark gamcheon-landmark" stroke="var(--scene-ink)" stroke-width="1">
            <g fill="var(--scene-pop-1)"><path d="M10 124h48v28H10zM64 108h43v27H64zM113 89h44v31h-44zM165 103h48v30h-48zM219 87h45v29h-45zM271 104h47v29h-47zM326 90h54v31h-54z"/></g>
            <g fill="var(--scene-pop-2)"><path d="M24 157h50v30H24zM81 139h45v31H81zM132 126h48v32h-48zM186 139h49v31h-49zM242 121h48v33h-48zM297 138h50v31h-50zM352 126h48v34h-48z"/></g>
            <g fill="var(--scene-pop-3)"><path d="M0 174h42v26H0zM51 180h56v20H51zM116 164h55v36h-55zM180 177h55v23h-55zM244 160h54v40h-54zM307 175h55v25h-55zM370 165h30v35h-30z"/></g>
            <g fill="var(--scene-window)" class="scene-night-lights"><path d="M20 132h7v6h-7zM76 116h7v6h-7zM126 98h7v6h-7zM179 112h7v6h-7zM231 96h7v6h-7zM284 112h7v6h-7zM340 99h7v6h-7zM94 148h7v6h-7zM202 148h7v6h-7zM258 130h7v6h-7z"/></g>
            <g class="gamcheon-bunting" fill="var(--scene-light)"><path d="M128 79l9 2l-6 7zM143 82l9 1l-5 8zM158 83l9-1l-3 9z"/></g>
            <g class="gamcheon-alleys" fill="none" stroke-linejoin="round">
                <path d="M108 200v-20h9v-17" stroke="var(--scene-hill)" stroke-width="7"/><path d="M108 200v-20h9v-17" stroke="var(--scene-house)" stroke-width="1.2" opacity=".7"/>
                <path d="M235 200v-24h9v-17" stroke="var(--scene-hill)" stroke-width="7"/><path d="M235 200v-24h9v-17" stroke="var(--scene-house)" stroke-width="1.2" opacity=".7"/>
                <path d="M347 175v-16h8v-17" stroke="var(--scene-hill)" stroke-width="6"/><path d="M347 175v-16h8v-17" stroke="var(--scene-house)" stroke-width="1.1" opacity=".65"/>
            </g>
            <g class="gamcheon-rooftops" fill="var(--scene-house)" stroke="var(--scene-ink)" stroke-width="1"><path d="M75 101h17v7H75zM228 78h18v9h-18zM337 80h18v10h-18z"/><circle cx="83" cy="98" r="4"/><circle cx="237" cy="75" r="4"/><circle cx="346" cy="77" r="4"/></g>
            <g fill="none" stroke="var(--scene-house)" stroke-width="1.3" opacity=".8"><path d="M10 154h48M64 137h43M113 122h44M165 135h48M219 118h45M271 135h47M326 123h54"/></g>
        </g>`;
}

function createNurimaruSceneSvg() {
    return `
        <rect y="126" width="400" height="74" fill="var(--scene-sea-top)"/><path d="M0 168q100-17 200 0t200 0v32H0Z" fill="var(--scene-sea-bottom)"/>
        <path d="M0 137Q60 91 137 111q70 19 132 4q70-17 131 8v31H0Z" fill="var(--scene-hill)"/>
        <g class="scene-landmark nurimaru-landmark">
            <g class="dongbaek-pines" fill="var(--scene-ink)" stroke="var(--scene-ink)" stroke-linecap="round"><path d="M30 126V78m0 8l-18 17m18-8l19 17M55 130V94m0 7l-13 14m13-7l15 13M357 129V83m0 8l-17 16m17-8l18 17M380 132V99m0 7l-12 12m12-5l13 11" fill="none" stroke-width="3"/><path d="M9 106q18-19 40-5q-14 5-20 17q-7-10-20-12ZM40 118q14-18 31-7q-11 5-16 15q-5-7-15-8ZM337 109q19-22 39-6q-14 5-20 18q-6-9-19-12ZM365 121q15-18 30-5q-10 4-14 13q-6-7-16-8Z"/></g>
            <g class="distant-bridge" fill="none" stroke="var(--scene-line)" stroke-width="1" opacity=".5"><path d="M278 116q20-16 39 0q20-16 41 0M297 116V96m40 20V96"/></g>
            <path class="nurimaru-roof-shadow" d="M91 114Q196 30 309 103q-58-20-109-11q-55 9-109 31Z" fill="var(--scene-ink)" opacity=".72"/>
            <path class="nurimaru-roof" d="M96 107Q196 38 304 98q-55-15-105-7q-53 8-103 25Z" fill="var(--scene-house)" stroke="var(--scene-ink)" stroke-width="2.2"/>
            <path d="M112 109q86-46 176-9" fill="none" stroke="var(--scene-pop-2)" stroke-width="4" stroke-linecap="round"/>
            <path d="M128 111q72-28 145-8" fill="none" stroke="var(--scene-line)" stroke-width="2"/>
            <path d="M132 110Q199 91 270 106v44H132Z" fill="var(--scene-glass)" stroke="var(--scene-ink)" stroke-width="2"/>
            <g stroke="var(--scene-line)" opacity=".72"><path d="M146 108v41M164 103v46M183 99v50M202 97v52M221 98v51M240 101v48M258 105v44"/></g>
            <path class="nurimaru-light-sweep scene-night-lights" d="M146 138q55 11 111-2" fill="none" stroke="var(--scene-light)" stroke-width="3" stroke-linecap="round"/>
            <path d="M112 150h176l20 11H93Z" fill="var(--scene-ink)"/><path d="M126 154h151" stroke="var(--scene-line)" stroke-width="2"/>
        </g>
        <g class="scene-water-lines nurimaru-reflection" fill="none" stroke="var(--scene-water-line)" stroke-width="1.2" opacity=".72"><path d="M48 170q49-7 98 0t98 0t98 0M92 187q38-6 76 0t76 0t76 0"/></g>`;
}

function createHuinnyeoulSceneSvg() {
    return `
        <rect y="112" width="400" height="88" fill="var(--scene-sea-top)"/><path d="M128 168q90-15 180 0t180 0v32H128Z" fill="var(--scene-sea-bottom)"/><path d="M0 48q87 19 146 72l25 80H0Z" fill="var(--scene-hill)"/>
        <g class="scene-landmark huinnyeoul-landmark">
            <g class="white-cliff-houses" stroke="var(--scene-ink)" stroke-width="1.2">
                <path d="M5 68h48v29H5zM47 80h58v34H47zM14 103h51v32H14zM67 117h56v35H67zM8 142h58v35H8zM74 158h55v42H74z" fill="var(--scene-house)"/>
                <path d="M1 64h57v8H1zM43 75h68v9H43zM10 98h61v9H10zM62 112h67v9H62zM4 137h68v9H4zM69 153h66v9H69z" fill="var(--scene-pop-2)"/>
            </g>
            <g fill="var(--scene-window)" class="scene-night-lights"><path d="M16 78h10v8H16zM62 91h12v10H62zM26 115h11v9H26zM83 130h12v10H83zM21 154h12v10H21zM93 173h12v10H93z"/></g>
            <g class="huinnyeoul-laundry" stroke="var(--scene-ink)" stroke-width="1"><path d="M71 104h45"/><path d="M78 105l8 2l-4 8zM90 105l8 1l-4 8zM102 105l8 2l-5 7z" fill="var(--scene-pop-1)"/></g>
            <g class="coastal-promenade" fill="none" stroke-linejoin="round" stroke-linecap="round">
                <path class="coastal-steps" d="M108 111h14v8h13v9h13v10h13v11h13v12h16v16" stroke="var(--scene-house)" stroke-width="7"/>
                <path d="M108 106l16 8l14 9l14 10l14 12l14 13l15 15" stroke="var(--scene-pop-2)" stroke-width="2.2"/>
                <g class="coastal-railing" stroke="var(--scene-ink-soft)" stroke-width="1.15"><path d="M112 108v9M126 115v10M140 124v10M154 135v10M168 147v10M182 160v10"/></g>
                <g class="stair-treads" stroke="var(--scene-ink)" stroke-width="1.2" opacity=".72"><path d="M118 118h10M131 127h10M144 137h10M157 148h10M170 160h10M183 173h10"/></g>
            </g>
            <g class="huinnyeoul-boat"><path d="M278 147h58l-11 14h-35Z" fill="var(--scene-pop-1)" stroke="var(--scene-ink)" stroke-width="1.5"/><path d="M307 147v-22" stroke="var(--scene-ink)"/><path d="M310 127l19 11h-19Z" fill="var(--scene-light)"/></g>
        </g>
        <g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.2" opacity=".72"><path d="M168 164q45-7 90 0t90 0t90 0M146 188q54-8 108 0t108 0t108 0"/></g>`;
}

function createJagalchiSceneSvg() {
    return `
        <rect y="139" width="400" height="61" fill="var(--scene-sea-top)"/><path d="M0 177q100-14 200 0t200 0v23H0Z" fill="var(--scene-sea-bottom)"/>
        <g class="scene-landmark jagalchi-landmark">
            <g class="harbor-crane" fill="none" stroke="var(--scene-ink)" stroke-width="2"><path d="M337 53v86M321 54h63M337 54l30 29M367 83v31"/><path class="jagalchi-crane-hook" d="M367 108v14q0 8 8 8"/></g>
            <path d="M103 65h181v91H103Z" fill="var(--scene-structure)" stroke="var(--scene-ink)" stroke-width="2"/>
            <path class="jagalchi-wave-roof" d="M92 70q48-35 101-8q47 24 103-17q-6 24-18 39q-45 24-91-2q-42-24-84 5Z" fill="var(--scene-house)" stroke="var(--scene-ink)" stroke-width="2.2"/>
            <path d="M101 70q47-26 89-7q48 22 96-10" fill="none" stroke="var(--scene-pop-2)" stroke-width="8" stroke-linecap="round"/>
            <path d="M115 88h157v58H115Z" fill="var(--scene-glass)"/><g stroke="var(--scene-line)" opacity=".68"><path d="M135 88v58M158 88v58M181 88v58M204 88v58M227 88v58M250 88v58M115 107h157M115 126h157"/></g>
            <g class="scene-night-lights" fill="var(--scene-light)"><path d="M120 92h12v10h-12zM142 92h12v10h-12zM233 92h12v10h-12zM255 111h12v10h-12z"/></g>
            <rect x="141" y="116" width="103" height="22" rx="3" fill="var(--scene-pop-1)" stroke="var(--scene-ink)"/>
            <g class="market-fish-mark" fill="var(--scene-ink)"><path d="M156 127q9-8 19 0q-10 8-19 0Zm-6 0l7-6v12Z"/><path d="M188 127q9-8 19 0q-10 8-19 0Zm-6 0l7-6v12Z"/><path d="M220 127q6-6 13 0q-7 6-13 0Zm-5 0l6-5v10Z"/></g>
            <g class="market-awnings"><path d="M286 137h104v12H286Z" fill="var(--scene-house)" stroke="var(--scene-ink)"/><path d="M286 137h13v12h-13zM312 137h13v12h-13zM338 137h13v12h-13zM364 137h13v12h-13z" fill="var(--scene-pop-1)"/><g fill="var(--scene-pop-3)" stroke="var(--scene-ink)"><path d="M295 149h25v20h-25zM324 149h26v20h-26zM354 149h27v20h-27z"/></g></g>
            <g class="jagalchi-boat"><path d="M15 157h81l-13 19H33Z" fill="var(--scene-pop-3)" stroke="var(--scene-ink)" stroke-width="2"/><path d="M45 157v-26h35v26" fill="var(--scene-house)" stroke="var(--scene-ink)"/><path d="M63 131v-18" stroke="var(--scene-ink)" stroke-width="2"/><path d="M65 116l20 10H65Z" fill="var(--scene-light)"/><path d="M24 151h67" stroke="var(--scene-pop-1)" stroke-width="3"/></g>
        </g>
        <g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.2" opacity=".72"><path d="M-20 178q45-6 90 0t90 0t90 0t90 0t90 0M70 191q42-5 84 0t84 0t84 0"/></g>`;
}

function createBusanSceneIllustrationSvg(sceneKey, idSuffix = '') {
    const safeSceneKey = BUSAN_SCENES[sceneKey] ? sceneKey : 'gwangan';
    const artworkByScene = { gwangan: createGwanganSceneSvg, gamcheon: createGamcheonSceneSvg, nurimaru: createNurimaruSceneSvg, huinnyeoul: createHuinnyeoulSceneSvg, jagalchi: createJagalchiSceneSvg };
    const gradientId = `busanSceneSky${idSuffix || 'Header'}`;

    return `
    <div class="bridge-illustration-card busan-scene-card scene-${safeSceneKey}" data-scene="${safeSceneKey}">
        <svg class="gwangan-bridge-svg busan-scene-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--scene-sky-top)"/><stop offset="1" stop-color="var(--scene-sky-bottom)"/></linearGradient></defs>
            <rect width="400" height="200" rx="16" fill="url(#${gradientId})"/>
            ${createAtmosphereSvg()}${artworkByScene[safeSceneKey]()}
        </svg>
        <div class="hero-sticker" aria-hidden="true"><strong>BUSAN</strong></div>
    </div>`;
}

function createCinematicIntro(data, target, sceneKey) {
    const currentDate = getCurrentDateDisplay();
    const overlay = document.createElement('div');
    overlay.className = 'cinematic-intro';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="cinematic-visual">
            ${createBusanSceneIllustrationSvg(sceneKey, 'Intro')}
        </div>
        <div class="cinematic-copy">
            <time class="cinematic-kicker" datetime="${currentDate.iso}">${currentDate.label}</time>
            <h2>${data.headerTitle}</h2>
            <p>${data.subtitle || '앱 설치부터 사은 행사 참여까지, 오늘의 혜택을 한 번에.'}</p>
        </div>
        <span class="cinematic-corner cinematic-corner-top">SPECIAL GIFT</span>
        <span class="cinematic-corner cinematic-corner-bottom">BUSAN · COASTAL EDITION</span>
    `;
    document.body.appendChild(overlay);

    const targetRect = target?.getBoundingClientRect();
    const introCard = overlay.querySelector('.bridge-illustration-card');
    if (targetRect && introCard) {
        const introScale = window.innerWidth < 600 ? 2.05 : 1.65;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const introCenterY = window.innerHeight * (window.innerWidth < 600 ? 0.34 : 0.40);
        const translateX = window.innerWidth / 2 - targetCenterX;
        const translateY = introCenterY - targetCenterY;

        Object.assign(introCard.style, {
            left: `${targetRect.left}px`,
            top: `${targetRect.top}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${introScale})`
        });
    }

    return overlay;
}

function collapseCinematicIntro(overlay, target, duration) {
    if (!overlay || !target || typeof overlay.animate !== 'function') {
        overlay?.remove();
        return Promise.resolve();
    }

    const rect = target.getBoundingClientRect();
    const top = Math.max(0, rect.top);
    const right = Math.max(0, window.innerWidth - rect.right);
    const bottom = Math.max(0, window.innerHeight - rect.bottom);
    const left = Math.max(0, rect.left);
    const targetClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 23px)`;

    overlay.classList.add('is-collapsing');

    const collapseAnimation = overlay.animate([
        {
            clipPath: 'inset(0px 0px 0px 0px round 0px)',
            opacity: 1
        },
        {
            clipPath: targetClip,
            opacity: 1,
            offset: 0.88
        },
        {
            clipPath: targetClip,
            opacity: 0
        }
    ], {
        duration,
        easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
        fill: 'forwards'
    });

    const introCard = overlay.querySelector('.bridge-illustration-card');
    introCard?.animate([
        { transform: introCard.style.transform },
        { transform: 'translate3d(0, 0, 0) scale(1)', offset: 0.88 },
        { transform: 'translate3d(0, 0, 0) scale(1)' }
    ], {
        duration,
        easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
        fill: 'forwards'
    });

    return collapseAnimation.finished
        .catch(() => undefined)
        .finally(() => overlay.remove());
}

// 전체 페이지 렌더링 및 시네마틱 인트로 전환 제어
function renderPage(data) {
    document.title = data.pageTitle;
    const sceneKey = chooseRandomBusanScene();
    const currentDate = getCurrentDateDisplay();
    document.documentElement.dataset.sceneTheme = sceneKey;

    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.classList.add('is-intro');
        document.body.classList.add('is-intro');
    }

    // 헤더 영역 렌더링
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="hero-toolbar">
                <span class="hero-brand">
                    <span class="brand-spark" aria-hidden="true">✦</span>
                    <time datetime="${currentDate.iso}">${currentDate.label}</time>
                </span>
                <span class="time-chip" aria-label="현재 시간대 테마">
                    <span class="time-dot" aria-hidden="true"></span>
                    <span id="time-period-label">NEON NIGHT</span>
                    <span class="time-divider" aria-hidden="true"></span>
                    <time id="time-label">--:--</time>
                </span>
            </div>
            ${createBusanSceneIllustrationSvg(sceneKey)}
            <div class="header-content">
                <span class="title-overline">EVENT GUIDE</span>
                <div class="title-row">
                    <h1 class="festival-title">${data.headerTitle}</h1>
                    <span class="title-kitsch-mark" aria-hidden="true">✳</span>
                </div>
                <p class="festival-subtitle">${data.subtitle || '앱 설치부터 사은 행사 참여까지, 오늘의 혜택을 한 번에.'}</p>
            </div>
        `;
        applyTimeTheme();
    }

    // 스텝 카드 영역 렌더링
    const stepContainer = document.getElementById('step-container');
    if (stepContainer) {
        stepContainer.innerHTML = '';
        const userOS = getMobileOS();

        const stepsToRender = data.giftStep
            ? [...data.steps, data.giftStep]
            : data.steps;

        stepsToRender.forEach((step, index) => {
            const stepElement = document.createElement('section');
            stepElement.className = 'step-card';
            stepElement.style.setProperty('--step-index', index);
            stepElement.style.setProperty('--step-delay', `${0.15 + index * 0.09}s`);
            stepElement.dataset.stepNumber = String(index + 1).padStart(2, '0');

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

            const isGiftStep = step.id === 'step3' && step.primaryOffer;
            if (isGiftStep) stepElement.classList.add('gift-step-card');

            const visibleGiftOffers = isGiftStep
                ? [
                    step.primaryOffer,
                    ...(step.showSecondOffer && step.secondaryOffer ? [step.secondaryOffer] : [])
                ].filter((offer) => offer?.title && offer?.link)
                : [];

            const actionMarkup = isGiftStep
                ? `
                    <div class="gift-offer-list ${visibleGiftOffers.length === 1 ? 'is-single' : 'is-double'}">
                        ${visibleGiftOffers.map((offer, offerIndex) => `
                            <article class="gift-offer-row" data-offer-number="${String(offerIndex + 1).padStart(2, '0')}">
                                <div class="gift-offer-copy">
                                    <span class="gift-offer-label">
                                        <strong>${String(offerIndex + 1).padStart(2, '0')}</strong>
                                        <span>GIFT BENEFIT</span>
                                    </span>
                                    <h3>${offer.title}</h3>
                                </div>
                                <a href="${offer.link}" class="gift-offer-link" target="${step.target || '_blank'}" rel="noopener noreferrer" aria-label="${offer.title}: ${offer.buttonText || '바로가기'}">
                                    <span>${offer.buttonText || '바로가기'}</span>
                                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                </a>
                            </article>
                        `).join('')}
                    </div>
                `
                : `
                    <div class="card-action">
                        <a href="${finalLink}" class="btn-action" target="${step.target || '_blank'}" rel="noopener noreferrer" aria-label="${step.title}: ${step.buttonText}">
                            <span class="btn-label">${step.buttonText}</span>
                            <span class="btn-icon" aria-hidden="true">
                                <svg class="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                            </span>
                        </a>
                    </div>
                `;

            stepElement.innerHTML = `
                <div class="card-glow-bg"></div>
                <div class="card-header-row">
                    <span class="step-num-pill">${step.stepNum || `STEP 0${index + 1}`}</span>
                    <div class="card-meta-right">
                        ${osBadgeText}
                        <span class="card-tagline">${step.tagline || `SPECIAL 0${index + 1}`}</span>
                    </div>
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
                ${actionMarkup}
            `;

            stepContainer.appendChild(stepElement);
        });
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bridgeTarget = headerContainer?.querySelector('.bridge-illustration-card');
    const cinematicIntro = reduceMotion ? null : createCinematicIntro(data, bridgeTarget, sceneKey);

    // 전체 화면 광안대교 인트로 -> 최종 헤더 크롭 전환
    let transitioned = false;
    function triggerPageTransition(isUserSkip = false) {
        if (transitioned || !appContainer) return;
        transitioned = true;
        appContainer.classList.remove('is-intro');
        appContainer.classList.add('is-ready');

        if (reduceMotion || !cinematicIntro || !bridgeTarget) {
            cinematicIntro?.remove();
            document.body.classList.remove('is-intro');
            return;
        }

        collapseCinematicIntro(cinematicIntro, bridgeTarget, isUserSkip ? 520 : 1080)
            .finally(() => document.body.classList.remove('is-intro'));
    }

    // 전체 화면 비주얼을 충분히 보여준 뒤 최종 헤더로 접습니다.
    const transitionTimer = setTimeout(triggerPageTransition, reduceMotion ? 0 : 950);

    // 사용자가 화면을 탭/클릭하면 즉시 인트로를 건너뛰고 전환
    function handleUserSkip() {
        clearTimeout(transitionTimer);
        triggerPageTransition(true);
        window.removeEventListener('click', handleUserSkip);
        window.removeEventListener('touchstart', handleUserSkip);
    }

    window.addEventListener('click', handleUserSkip, { once: true });
    window.addEventListener('touchstart', handleUserSkip, { once: true, passive: true });
}
