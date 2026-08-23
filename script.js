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
        // head에서 먼저 시작한 요청을 재사용해 느린 네트워크의 대기 시간을 줄입니다.
        const response = await (window.__eventDataPromise || fetch('data.json', {
            cache: 'no-cache',
            credentials: 'same-origin'
        }));
        if (response?.__eventDataError) throw response.__eventDataError;
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
    jagalchi: true,
    haeundae: true,
    lotteBusan: true,
    busanTower: true,
    cinemaCenter: true
};

// 실제 지리를 바탕으로 서로 가까운 장소는 시각적으로 조금 벌린 지도 좌표입니다.
// 하나의 4:5 마스터 맵을 두고 화면 비율에 따라 카메라만 달리 움직입니다.
const BUSAN_MAP_SCENES = [
    { key: 'gamcheon', x: 165, y: 770 },
    { key: 'lotteBusan', x: 390, y: 360 },
    { key: 'busanTower', x: 365, y: 575 },
    { key: 'jagalchi', x: 375, y: 785 },
    { key: 'huinnyeoul', x: 480, y: 985 },
    { key: 'gwangan', x: 635, y: 715 },
    { key: 'cinemaCenter', x: 710, y: 395 },
    { key: 'nurimaru', x: 835, y: 820 },
    { key: 'haeundae', x: 900, y: 565 }
];

const BUSAN_MAP_POINT_BY_SCENE = Object.fromEntries(
    BUSAN_MAP_SCENES.map((scene) => [scene.key, scene])
);

function chooseRandomBusanScene() {
    const keys = Object.keys(BUSAN_SCENES);
    const previewScene = new URLSearchParams(window.location.search).get('scene');
    if (previewScene && BUSAN_SCENES[previewScene]) return previewScene;

    // 한 장소가 연속으로 뽑히지 않고, 아홉 장소를 모두 본 뒤 다시 섞습니다.
    try {
        const bagKey = 'busan-scene-bag-v3';
        const lastKey = 'busan-scene-last-v3';
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
        <rect y="126" width="400" height="74" fill="var(--scene-sea-top)"/>
        <path d="M0 164q82-14 164 0t164 0t164 0v36H0Z" fill="var(--scene-sea-bottom)"/>
        <g class="scene-landmark gwangan-landmark scene-kitsch">
            <path class="kitsch-shadow" d="M0 137h400v8H0Z"/>
            <g class="kitsch-main" fill="var(--scene-house)">
                <path d="M126 130V60h18v70ZM256 130V60h18v70Z"/>
                <path d="M121 66h28l-14-17ZM251 66h28l-14-17Z" fill="var(--scene-pop-2)"/>
            </g>
            <g fill="none" stroke="var(--scene-line)" stroke-width="3" stroke-linecap="round">
                <path d="M6 128Q67 113 135 58Q200 119 265 58Q333 113 394 128"/>
                <path d="M135 59Q200 119 265 59" stroke="var(--scene-house)" stroke-width="4.6"/>
            </g>
            <path class="bridge-led-flow" d="M7 127Q69 112 135 58Q200 118 265 58Q331 112 393 127" fill="none" stroke="var(--scene-light)" stroke-width="2.2" stroke-dasharray="3 14"/>
            <g class="kitsch-detail" opacity=".76"><path d="M86 112v17M108 91v38M157 81v48M178 101v28M200 112v17M222 101v28M243 81v48M292 91v38M314 112v17"/></g>
            <path d="M0 127H400V139H0Z" fill="var(--scene-ink)"/>
            <path d="M0 128H400" fill="none" stroke="var(--scene-pop-1)" stroke-width="3"/>
            <g class="bridge-piers kitsch-main" fill="var(--scene-structure)"><path d="M126 137h18l-3 31h-12ZM256 137h18l-3 31h-12Z"/><path d="M122 165h26v6h-26ZM252 165h26v6h-26Z" fill="var(--scene-ink)"/></g>
            <g class="scene-night-lights" fill="var(--scene-light)"><circle cx="135" cy="49" r="3"/><circle cx="168" cy="92" r="2.2"/><circle cx="200" cy="111" r="2.4"/><circle cx="232" cy="92" r="2.2"/><circle cx="265" cy="49" r="3"/></g>
            <g class="bridge-traffic" stroke-linecap="round" stroke-width="3"><path d="M18 125h44" stroke="var(--scene-light)"/><path d="M338 136h43" stroke="var(--scene-pop-1)"/></g>
        </g>
        <g class="gwangan-reflection" fill="var(--scene-light)" opacity=".13"><path d="M122 140h29l12 56h-54Z"/><path d="M250 140h29l14 56h-57Z"/></g>
        <g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".72"><path d="M-30 157q45-7 90 0t90 0t90 0t90 0t90 0M-60 181q58-8 116 0t116 0t116 0t116 0"/></g>`;
}

function createGamcheonSceneSvg() {
    return `
        <path d="M0 112Q64 66 129 88Q198 38 258 76Q329 42 400 79V200H0Z" fill="var(--scene-hill)"/>
        <path d="M0 159Q87 122 169 137Q271 100 400 119V200H0Z" fill="var(--scene-ink)" opacity=".11"/>
        <path class="gamcheon-cloud-shadow" d="M-100 102q42-22 88-5q41 15 86-2q39-14 77 5q-35 21-98 12q-69-10-153 8Z" fill="var(--scene-ink)" opacity=".08"/>
        <g class="scene-landmark gamcheon-landmark scene-kitsch">
            <g class="gamcheon-upper-row kitsch-main">
                <path d="M57 109V83h43v26Z" fill="var(--scene-house)"/>
                <path d="M113 96V62h48v34Z" fill="var(--scene-pop-1)"/>
                <path d="M179 109V76h49v33Z" fill="var(--scene-pop-2)"/>
                <path d="M249 94V58h48v36Z" fill="var(--scene-house)"/>
                <path d="M316 107V73h50v34Z" fill="var(--scene-pop-3)"/>
            </g>
            <g class="gamcheon-lower-row kitsch-main">
                <path d="M17 154v-35h58v35Z" fill="var(--scene-pop-1)"/>
                <path d="M88 145v-37h62v37Z" fill="var(--scene-pop-2)"/>
                <path d="M166 160v-38h64v38Z" fill="var(--scene-pop-3)"/>
                <path d="M246 143v-36h65v36Z" fill="var(--scene-pop-2)"/>
                <path d="M326 154v-36h64v36Z" fill="var(--scene-house)"/>
                <path d="M0 200v-34h83v34ZM95 200v-42h86v42ZM194 200v-30h86v30ZM292 200v-39h108v39Z" fill="var(--scene-pop-3)"/>
            </g>
            <g fill="none" stroke="var(--scene-line)" stroke-width="4"><path d="M55 83h47M111 62h52M177 76h53M247 58h52M314 73h54M15 119h62M86 108h66M164 122h68M244 107h69M324 118h68"/></g>
            <g class="scene-night-lights gamcheon-window-glow" fill="var(--scene-window)"><path d="M69 93h9v8h-9zM128 75h10v9h-10zM194 88h10v9h-10zM264 70h10v9h-10zM333 86h10v9h-10zM34 133h11v10H34zM106 121h11v10h-11zM185 136h11v10h-11zM266 120h11v10h-11zM347 131h11v10h-11zM23 177h12v10H23zM124 172h12v10h-12zM220 180h12v10h-12zM337 174h12v10h-12z"/></g>
            <g class="gamcheon-bunting kitsch-detail"><path d="M112 56q25 8 50 0" fill="none"/><path d="M120 58l8 2l-5 8ZM135 59l8 1l-4 9ZM150 58l8-2l-2 9Z" fill="var(--scene-light)" stroke="var(--scene-ink)"/></g>
            <g class="gamcheon-lookout" fill="var(--scene-ink)"><circle cx="278" cy="51" r="4"/><path d="M275 55h6v8h-6zM266 61h11v3h-11z"/></g>
        </g>`;
}

function createNurimaruSceneSvg() {
    return `
        <rect y="130" width="400" height="70" fill="var(--scene-sea-top)"/><path d="M0 173q98-17 196 0t204 0v27H0Z" fill="var(--scene-sea-bottom)"/>
        <path d="M0 145Q65 93 140 115q67 20 128 4q70-19 132 7v35H0Z" fill="var(--scene-hill)"/>
        <g class="scene-landmark nurimaru-landmark scene-kitsch">
            <g class="dongbaek-pines" fill="var(--scene-ink)" stroke="var(--scene-ink)" stroke-linecap="round"><path d="M29 137V77M55 140V95M367 138V81M389 140V99" fill="none" stroke-width="4"/><path d="M7 103q22-23 46-4q-17 5-24 22q-7-12-22-18ZM37 119q18-22 38-5q-14 5-20 18q-6-9-18-13ZM344 108q22-25 46-5q-17 6-24 22q-7-11-22-17ZM370 123q17-21 30-5q-9 5-13 17q-6-9-17-12Z"/></g>
            <path class="nurimaru-roof-shadow" d="M78 111Q198 24 323 102Q259 79 201 88Q138 96 78 122Z" fill="var(--scene-ink)" opacity=".34"/>
            <path class="nurimaru-roof kitsch-main" d="M84 103Q197 31 316 94Q258 80 201 88Q140 95 84 114Z" fill="var(--scene-house)"/>
            <path d="M101 106Q197 52 299 96" fill="none" stroke="var(--scene-pop-2)" stroke-width="7" stroke-linecap="round"/>
            <path class="kitsch-main" d="M118 108Q198 82 282 102V153H118Z" fill="var(--scene-glass)"/>
            <g class="kitsch-detail" opacity=".82"><path d="M135 104v48M157 97v55M180 92v60M203 89v63M226 91v61M249 95v57M270 100v52"/></g>
            <path class="nurimaru-glass-shimmer" d="M142 109l31-11l38 54h-31Z" fill="var(--scene-line)" opacity=".16"/>
            <path class="nurimaru-light-sweep scene-night-lights" d="M134 139q66 14 132-3" fill="none" stroke="var(--scene-light)" stroke-width="4" stroke-linecap="round"/>
            <path d="M101 152h197l17 13H84Z" fill="var(--scene-ink)"/><path d="M119 156h162" stroke="var(--scene-pop-1)" stroke-width="3"/>
            <g class="nurimaru-distant-lights scene-night-lights" fill="var(--scene-light)"><circle cx="323" cy="113" r="2"/><circle cx="343" cy="121" r="1.7"/><circle cx="363" cy="112" r="2"/></g>
        </g>
        <g class="scene-water-lines nurimaru-reflection" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".72"><path d="M44 173q52-7 104 0t104 0t104 0M89 190q40-6 80 0t80 0t80 0"/></g>`;
}

function createHuinnyeoulSceneSvg() {
    return `
        <rect y="92" width="400" height="108" fill="var(--scene-sea-top)"/><path d="M214 160q86-18 172 0t172 0v40H214Z" fill="var(--scene-sea-bottom)"/>
        <path d="M0 54Q91 48 156 81Q207 107 260 165L228 200H0Z" fill="var(--scene-hill)"/>
        <g class="scene-landmark huinnyeoul-landmark scene-kitsch">
            <path d="M0 143q108-9 177 28l36 29H0Z" fill="var(--scene-ink)" opacity=".12"/>
            <g class="white-cliff-houses kitsch-main">
                <path d="M8 64h59v38H8ZM74 72h61v43H74ZM17 111h66v43H17ZM91 124h62v43H91ZM7 160h78v40H7Z" fill="var(--scene-house)"/>
                <path d="M3 58h69v10H3ZM69 66h71v10H69ZM12 105h76v10H12ZM86 118h72v10H86ZM2 154h88v10H2Z" fill="var(--scene-pop-2)"/>
            </g>
            <g class="scene-night-lights" fill="var(--scene-window)"><path d="M23 77h12v10H23zM91 86h12v10H91zM35 124h13v11H35zM110 138h13v11h-13zM28 174h13v11H28z"/></g>
            <g class="coastal-promenade">
                <path class="kitsch-main" d="M166 111Q207 127 255 166L240 185Q196 145 158 131Z" fill="var(--scene-house)"/>
                <path d="M160 108Q207 124 260 165" fill="none" stroke="var(--scene-line)" stroke-width="4"/>
                <path class="coastal-route-line" d="M170 120Q207 136 247 173" fill="none" stroke="var(--scene-pop-1)" stroke-width="5" stroke-dasharray="13 7"/>
                <g class="huinnyeoul-walker" fill="var(--scene-ink)"><circle cx="211" cy="143" r="4"/><path d="M207 148h8l2 13l-6 7l-6-8Z"/></g>
            </g>
            <path class="huinnyeoul-tunnel" d="M196 200v-18a18 18 0 0 1 36 0v18Z" fill="var(--scene-ink)"/><path d="M204 200v-17a10 10 0 0 1 20 0v17Z" fill="var(--scene-sky-bottom)" opacity=".48"/>
            <g class="huinnyeoul-seagulls" fill="none" stroke="var(--scene-ink-soft)" stroke-width="2.2" stroke-linecap="round"><path d="M249 65q9-10 18 0q9-10 18 0M291 84q6-7 12 0q6-7 12 0"/></g>
            <g class="huinnyeoul-boat kitsch-main"><path d="M300 148h65l-13 17h-39Z" fill="var(--scene-pop-1)"/><path d="M332 148v-28" fill="none"/><path d="M335 122l22 13h-22Z" fill="var(--scene-light)"/></g>
        </g>
        <g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".72"><path d="M258 116q49-7 98 0t98 0M247 184q55-8 110 0t110 0"/></g>`;
}

function createJagalchiSceneSvg() {
    return `
        <rect y="143" width="400" height="57" fill="var(--scene-sea-top)"/><path d="M0 179q99-14 198 0t202 0v21H0Z" fill="var(--scene-sea-bottom)"/>
        <g class="scene-landmark jagalchi-landmark scene-kitsch">
            <g class="harbor-crane kitsch-detail"><path d="M369 85v58M329 86h65M369 86l23 22M392 108v16" fill="none"/><path class="jagalchi-crane-hook" d="M392 122v10q0 7 6 7" fill="none"/></g>
            <path class="kitsch-main" d="M95 69h198v88H95Z" fill="var(--scene-structure)"/>
            <path class="jagalchi-wave-roof kitsch-main" d="M79 76Q127 29 189 60Q245 88 314 39Q307 63 291 82Q242 105 183 76Q132 51 92 91Z" fill="var(--scene-house)"/>
            <path d="M91 73Q133 43 184 66Q240 91 300 51" fill="none" stroke="var(--scene-pop-2)" stroke-width="8" stroke-linecap="round"/>
            <path class="kitsch-main" d="M111 91h166v57H111Z" fill="var(--scene-glass)"/>
            <g class="kitsch-detail" opacity=".75"><path d="M135 91v57M159 91v57M183 91v57M207 91v57M231 91v57M255 91v57M111 111h166M111 130h166"/></g>
            <g class="scene-night-lights" fill="var(--scene-light)"><path d="M117 97h13v10h-13zM143 116h13v10h-13zM237 97h13v10h-13zM260 116h12v10h-12z"/></g>
            <rect x="143" y="116" width="103" height="23" rx="5" fill="var(--scene-pop-1)" stroke="var(--scene-ink)" stroke-width="2"/>
            <g class="market-fish-mark" fill="var(--scene-ink)"><path d="M158 128q9-8 19 0q-10 8-19 0Zm-7 0l8-6v12ZM190 128q9-8 19 0q-10 8-19 0Zm-7 0l8-6v12ZM222 128q7-7 15 0q-8 7-15 0Zm-6 0l7-5v10Z"/></g>
            <g class="market-awnings kitsch-main"><path d="M294 139h96v13h-96Z" fill="var(--scene-house)"/><path class="market-awning-stripes" d="M294 139h14v13h-14zM322 139h14v13h-14zM350 139h14v13h-14zM378 139h12v13h-12z" fill="var(--scene-pop-1)"/><path d="M302 152h25v22h-25ZM332 152h25v22h-25ZM362 152h24v22h-24Z" fill="var(--scene-pop-3)"/></g>
            <g class="jagalchi-boat kitsch-main"><path d="M12 160h82l-14 19H31Z" fill="var(--scene-pop-3)"/><path d="M42 160v-27h37v27" fill="var(--scene-house)"/><path d="M61 133v-21" fill="none"/><path d="M64 115l23 12H64Z" fill="var(--scene-light)"/><path d="M22 154h68" fill="none" stroke="var(--scene-pop-1)" stroke-width="4"/></g>
            <g class="jagalchi-harbor-gulls" fill="none" stroke="var(--scene-ink-soft)" stroke-width="2" stroke-linecap="round"><path d="M21 78q7-8 14 0q7-8 14 0M53 96q5-6 10 0q5-6 10 0"/></g>
        </g>
        <g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".72"><path d="M-20 180q46-6 92 0t92 0t92 0t92 0t92 0M70 193q43-5 86 0t86 0t86 0"/></g>`;
}

function createHaeundaeSceneSvg() {
    return `
        <rect y="144" width="400" height="56" fill="var(--scene-sea-top)"/><path d="M0 178q96-14 192 0t208 0v22H0Z" fill="var(--scene-sea-bottom)"/>
        <path d="M0 137q95-14 190 0t210-2v20H0Z" fill="var(--scene-house)"/>
        <g class="scene-landmark haeundae-landmark scene-kitsch">
            <g class="marine-city-buildings kitsch-main">
                <path d="M19 137V93h31v44ZM55 137V70h37v67ZM98 137V84h33v53ZM137 137V57h41v80ZM184 137V77h34v60ZM224 137V67h35v70Z" fill="var(--scene-glass)"/>
                <path d="M28 101h13v36H28ZM66 78h15v59H66ZM108 92h13v45h-13ZM149 66h17v71h-17ZM195 85h13v52h-13ZM235 75h14v62h-14Z" fill="var(--scene-structure)" opacity=".38"/>
                <g class="kitsch-detail" opacity=".65"><path d="M19 109h31M55 91h37M55 115h37M98 105h33M137 83h41M137 110h41M184 98h34M224 90h35M224 114h35"/></g>
            </g>
            <g class="lct-cluster kitsch-main">
                <path d="M270 137V47l13-15l13 15v90Z" fill="var(--scene-structure)"/>
                <path d="M301 137V23l15-17l15 17v114Z" fill="var(--scene-glass)"/>
                <path d="M338 137V50l13-14l14 14v87Z" fill="var(--scene-structure)"/>
                <path d="M278 52h10v85h-10ZM310 30h12v107h-12ZM346 56h10v81h-10Z" fill="var(--scene-pop-2)" opacity=".58"/>
                <g class="haeundae-window-lights scene-night-lights" fill="var(--scene-light)"><path d="M280 64h5v6h-5zM280 86h5v6h-5zM280 110h5v6h-5zM313 43h6v7h-6zM313 68h6v7h-6zM313 94h6v7h-6zM313 119h6v7h-6zM348 69h5v6h-5zM348 94h5v6h-5zM348 117h5v6h-5z"/></g>
            </g>
            <path d="M0 137Q99 126 198 138T400 136" fill="none" stroke="var(--scene-pop-3)" stroke-width="5"/>
            <g class="beach-parasols kitsch-main"><path d="M72 143q14-19 28 0Z" fill="var(--scene-pop-1)"/><path d="M86 143v14" fill="none"/><path d="M157 143q14-19 28 0Z" fill="var(--scene-pop-3)"/><path d="M171 143v14" fill="none"/><path d="M369 143q11-15 22 0Z" fill="var(--scene-light)"/><path d="M380 143v14" fill="none"/></g>
            <g class="haeundae-yacht kitsch-main"><path d="M13 162h61l-11 14H27Z" fill="var(--scene-pop-1)"/><path d="M45 162v-22" fill="none"/><path d="M49 142l18 11H49Z" fill="var(--scene-light)"/></g>
        </g>
        <g class="scene-water-lines haeundae-reflection" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".72"><path d="M86 164q49-6 98 0t98 0t98 0M40 190q55-7 110 0t110 0t110 0"/></g>`;
}

function createLotteBusanSceneSvg() {
    return `
        <path d="M0 141V96h43v45V73h31v68V103h36v38V84h34v57H0Z" fill="var(--scene-ink)" opacity=".18"/>
        <rect y="161" width="400" height="39" fill="var(--scene-ink)"/><path d="M0 176h400" stroke="var(--scene-line)" stroke-width="2" stroke-dasharray="23 14" opacity=".58"/>
        <g class="scene-landmark lotte-busan-landmark scene-kitsch">
            <path class="kitsch-shadow" d="M41 158h290v8H41Z"/>
            <path class="kitsch-main" d="M48 157V50h235v107Z" fill="var(--scene-house)"/>
            <path class="kitsch-main" d="M267 157V28h65v129Z" fill="var(--scene-glass)"/>
            <g class="lotte-facade-slats" stroke="var(--scene-light)" stroke-width="4" opacity=".8"><path d="M62 53v101M77 53v101M92 53v101M107 53v101M122 53v101M137 53v101M152 53v101M167 53v101M182 53v101M197 53v101M212 53v101M227 53v101M242 53v101M257 53v101M272 53v101"/></g>
            <path class="kitsch-main" d="M132 78h112v57H132Z" fill="var(--scene-glass)"/>
            <g class="lotte-screen"><path d="M141 87h94v39h-94Z" fill="var(--scene-pop-3)"/><path class="lotte-screen-scan" d="M146 92h29v29h-29Z" fill="var(--scene-light)" opacity=".7"/><path d="M182 98h44M182 109h34M182 119h41" stroke="var(--scene-line)" stroke-width="3" stroke-linecap="round"/></g>
            <g class="lotte-roundel"><circle cx="77" cy="74" r="13" fill="var(--scene-pop-1)"/><circle cx="77" cy="74" r="6" fill="var(--scene-house)"/></g>
            <g class="lotte-hotel-windows scene-night-lights" fill="var(--scene-light)"><path d="M278 44h9v8h-9zM300 44h9v8h-9zM320 44h8v8h-8zM278 66h9v8h-9zM300 66h9v8h-9zM320 66h8v8h-8zM278 90h9v8h-9zM300 90h9v8h-9zM320 90h8v8h-8zM278 116h9v8h-9zM300 116h9v8h-9zM320 116h8v8h-8z"/></g>
            <path class="lotte-facade-glint" d="M100 55l31-2l48 102h-33Z" fill="var(--scene-line)" opacity=".13"/>
            <g class="seomyeon-traffic"><path d="M17 178h52l9 14H8Z" fill="var(--scene-pop-1)"/><circle cx="22" cy="193" r="5" fill="var(--scene-structure)"/><circle cx="64" cy="193" r="5" fill="var(--scene-structure)"/><path d="M314 176h62l11 16h-82Z" fill="var(--scene-pop-3)"/><circle cx="320" cy="193" r="5" fill="var(--scene-structure)"/><circle cx="371" cy="193" r="5" fill="var(--scene-structure)"/></g>
        </g>`;
}

function createBusanTowerSceneSvg() {
    return `
        <path d="M0 145q63-31 128-12q72-31 145 0q65-24 127 8v59H0Z" fill="var(--scene-hill)"/>
        <path d="M0 174q92-20 184 1q104-27 216 1v24H0Z" fill="var(--scene-ink)" opacity=".17"/>
        <g class="scene-landmark busan-tower-landmark scene-kitsch">
            <g class="yongdusan-pavilion kitsch-main"><path d="M25 127q58-34 116 0q-58-13-116 0Z" fill="var(--scene-pop-2)"/><path d="M33 128h100v13H33Z" fill="var(--scene-pop-1)"/><path d="M45 141h76v31H45Z" fill="var(--scene-house)"/><path d="M56 142v30M83 142v30M110 142v30" fill="none"/></g>
            <g class="busan-tower kitsch-main">
                <path d="M188 153l8-76h22l8 76Z" fill="var(--scene-structure)"/>
                <path d="M178 77l10-21h39l11 21l-15 14h-31Z" fill="var(--scene-house)"/>
                <path d="M184 62h48" fill="none" stroke="var(--scene-pop-1)" stroke-width="7"/>
                <path d="M198 55V31h18v24Z" fill="var(--scene-glass)"/>
                <path d="M207 31V11" fill="none" stroke-width="4"/>
                <circle class="busan-tower-beacon" cx="207" cy="9" r="4" fill="var(--scene-light)" stroke="none"/>
                <g class="tower-light-ring scene-night-lights" fill="var(--scene-light)"><path d="M187 68h46v6h-46Z"/></g>
            </g>
            <g class="park-trees" fill="var(--scene-ink)"><path d="M8 177q5-36 26-49q20 14 23 49ZM129 177q5-39 27-53q21 15 24 53ZM274 177q5-41 29-56q22 16 26 56ZM340 177q5-34 24-47q19 13 22 47Z"/></g>
            <g class="tower-city-lights scene-night-lights" fill="var(--scene-light)"><circle cx="251" cy="150" r="2.4"/><circle cx="264" cy="158" r="2"/><circle cx="343" cy="150" r="2.4"/><circle cx="370" cy="157" r="2"/></g>
        </g>`;
}

function createCinemaCenterSceneSvg() {
    return `
        <path d="M0 157H400V200H0Z" fill="var(--scene-ink)"/><path d="M0 181H400" stroke="var(--scene-line)" stroke-width="2" opacity=".48"/>
        <g class="scene-landmark cinema-center-landmark scene-kitsch">
            <path class="cinema-projector" d="M78 83h262l43 76H31Z" fill="var(--scene-pop-3)" opacity=".1"/>
            <path class="kitsch-main" d="M42 101h129v57H42Z" fill="var(--scene-structure)"/>
            <path class="kitsch-main" d="M55 113h101v32H55Z" fill="var(--scene-glass)"/>
            <g class="kitsch-detail" opacity=".72"><path d="M79 113v32M105 113v32M131 113v32"/></g>
            <path class="kitsch-main" d="M276 106h81v52h-81Z" fill="var(--scene-structure)"/>
            <path class="kitsch-main" d="M287 117h58v29h-58Z" fill="var(--scene-glass)"/>
            <path class="cinema-big-roof kitsch-main" d="M19 49L344 32L394 49L364 64L39 82L6 68Z" fill="var(--scene-structure)"/>
            <path class="kitsch-main" d="M39 70L364 53L375 64L47 84Z" fill="var(--scene-pop-3)"/>
            <path d="M48 73L362 57" fill="none" stroke="var(--scene-pop-2)" stroke-width="6" stroke-linecap="round"/>
            <g class="cinema-roof-leds scene-night-lights" fill="var(--scene-light)"><circle cx="61" cy="72" r="2.4"/><circle cx="93" cy="70" r="2.4"/><circle cx="125" cy="68" r="2.4"/><circle cx="158" cy="67" r="2.4"/><circle cx="191" cy="65" r="2.4"/><circle cx="224" cy="63" r="2.4"/><circle cx="257" cy="62" r="2.4"/><circle cx="291" cy="60" r="2.4"/><circle cx="325" cy="59" r="2.4"/><circle cx="354" cy="57" r="2.4"/></g>
            <g class="cinema-double-cone kitsch-main">
                <path d="M207 82h63l-25 37h-18Z" fill="var(--scene-glass)"/>
                <path d="M227 118h18l29 40h-76Z" fill="var(--scene-structure)"/>
                <path d="M220 86h38l-20 28Z" fill="var(--scene-pop-3)" opacity=".58"/>
                <path d="M219 156h35" fill="none" stroke="var(--scene-pop-1)" stroke-width="6"/>
            </g>
            <path d="M23 158H377" stroke="var(--scene-pop-1)" stroke-width="5"/>
            <g class="cinema-people" fill="var(--scene-light)"><circle cx="91" cy="151" r="3.5"/><path d="M87 155h8v11h-8Z"/><circle cx="309" cy="151" r="3.5"/><path d="M305 155h8v11h-8Z"/></g>
        </g>`;
}

function createBusanMapLandmarkArtwork(sceneKey) {
    const artwork = {
        gwangan: `
            <path class="map-water" d="M-82 38q40-12 82 0t82 0v28H-82Z"/>
            <g class="map-bridge" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M-76 37Q-42 24-23-18Q0 28 23-18Q45 24 77 37" stroke="var(--map-light)" stroke-width="4"/>
                <path d="M-27 40V-20M-19 40V-20M19 40V-20M27 40V-20" stroke="var(--map-structure)" stroke-width="5"/>
                <path d="M-82 39H82" stroke="var(--map-ink)" stroke-width="9"/>
                <path d="M-82 35H82" stroke="var(--map-pop)" stroke-width="3"/>
            </g>`,
        gamcheon: `
            <path class="map-hill" d="M-86 46Q-48 5-13 20Q18-22 52 8Q72-3 88 12V65H-86Z"/>
            <g class="map-houses" stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-73 17h37v31h-37ZM-29-7h40v34h-40ZM18 7h42v36H18ZM-54 40h44v29h-44ZM-2 31h48v38H-2ZM52 29h35v40H52Z"/>
                <path d="M-76 13h43M-32-11h46M15 3h48M-57 36h50M-5 27h54M49 25h41" fill="none" stroke="var(--map-light)" stroke-width="5"/>
            </g>`,
        nurimaru: `
            <path class="map-water" d="M-88 35q43-10 88 0t88 0v31H-88Z"/>
            <path class="map-hill" d="M-91 43Q-48 2-14 26Q24 2 91 35v20H-91Z"/>
            <g stroke="var(--map-ink)" stroke-linejoin="round">
                <path d="M-62 8Q0-45 69 0Q32-13 1-8Q-30-2-62 18Z" fill="var(--map-paper)" stroke-width="4"/>
                <path d="M-46 13Q0-10 50 5V43H-46Z" fill="var(--map-glass)" stroke-width="4"/>
                <path d="M-47 15Q0-8 51 7" fill="none" stroke="var(--map-pop)" stroke-width="6"/>
                <path d="M-59 44H61l12 14H-70Z" fill="var(--map-ink)" stroke-width="2"/>
            </g>`,
        huinnyeoul: `
            <path class="map-water" d="M-4 8h94v61H-4Z"/>
            <path class="map-hill" d="M-92-47Q-35-42 2-5Q26 18 39 69H-92Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-86-34h43v32h-43ZM-40-23H2v34h-42ZM-82 2h46v36h-46ZM-32 16H9v36h-41ZM-84 40h55v29h-55Z" fill="var(--map-paper)"/>
                <path d="M-89-38h49M-43-27H5M-85-2h52M-35 12H12M-87 36h61" stroke="var(--map-pop)" stroke-width="5"/>
                <path d="M4 5Q32 17 62 55L49 67Q24 31-2 21Z" fill="var(--map-paper)"/>
                <path d="M6 12Q32 25 54 58" fill="none" stroke="var(--map-light)" stroke-width="5" stroke-dasharray="9 6"/>
            </g>`,
        jagalchi: `
            <path class="map-water" d="M-88 38q42-9 84 0t92 0v31H-88Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-54-25H49v80H-54Z" fill="var(--map-structure)"/>
                <path d="M-62-18Q-26-48 7-26Q38-5 62-41Q59-20 48-5Q15 9-10-9Q-33-25-54-1Z" fill="var(--map-paper)"/>
                <path d="M-56-18Q-24-37 7-20Q35-5 54-30" fill="none" stroke="var(--map-pop)" stroke-width="8"/>
                <path d="M-37 8H33V35H-37Z" fill="var(--map-glass)"/>
                <path d="M-23 21q8-7 17 0q-9 7-17 0Zm-6 0l7-6v12ZM10 21q8-7 17 0q-9 7-17 0Zm-6 0l7-6v12Z" fill="var(--map-ink)" stroke="none"/>
            </g>`,
        haeundae: `
            <path class="map-water" d="M-90 46q43-9 86 0t94 0v24H-90Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-78 44v-48h28v48ZM-43 44v-70h32v70ZM-3 44v-55h29v55Z" fill="var(--map-glass)"/>
                <path d="M33 44v-82l12-15l12 15v82ZM61 44v-107l13-15l13 15V44Z" fill="var(--map-structure)"/>
                <path d="M40-30h9v74h-9ZM68-53h11v97H68Z" fill="var(--map-pop)" stroke="none" opacity=".7"/>
                <path d="M-88 45H90" stroke="var(--map-paper)" stroke-width="7"/>
            </g>`,
        lotteBusan: `
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-76 58V-43H47V58Z" fill="var(--map-paper)"/>
                <path d="M42 58V-68H81V58Z" fill="var(--map-glass)"/>
                <g stroke="var(--map-light)" stroke-width="5"><path d="M-62-39v93M-47-39v93M-32-39v93M-17-39v93M-2-39v93M13-39v93M28-39v93M43-39v93"/></g>
                <path d="M-22-13h51v41h-51Z" fill="var(--map-pop)"/>
                <circle cx="-50" cy="-18" r="10" fill="var(--map-pop)"/>
            </g>`,
        busanTower: `
            <path class="map-hill" d="M-90 43q46-32 92-8q43-25 88 8v28H-90Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-13 51l7-70H8l7 70Z" fill="var(--map-structure)"/>
                <path d="M-24-22l9-18h32l10 18l-12 12h-28Z" fill="var(--map-paper)"/>
                <path d="M-17-34h38" stroke="var(--map-pop)" stroke-width="6"/>
                <path d="M-5-43v-23H9v23ZM2-66v-15" fill="var(--map-glass)" stroke-width="4"/>
                <circle cx="2" cy="-84" r="5" fill="var(--map-light)" stroke="none"/>
                <path d="M-79 27h50v34h-50ZM29 30h47v31H29Z" fill="var(--map-paper)"/>
            </g>`,
        cinemaCenter: `
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-90-47H59L90-33L64-15H-78L-97-32Z" fill="var(--map-paper)"/>
                <path d="M-78-26H70" stroke="var(--map-pop)" stroke-width="8"/>
                <path d="M-15-13h36l16 70h-69Z" fill="var(--map-glass)"/>
                <path d="M-77-5h58v62h-58ZM30-3h48v60H30Z" fill="var(--map-structure)"/>
                <g fill="var(--map-light)" stroke="none"><circle cx="-65" cy="-36" r="3"/><circle cx="-35" cy="-29" r="3"/><circle cx="-4" cy="-37" r="3"/><circle cx="27" cy="-29" r="3"/><circle cx="57" cy="-36" r="3"/></g>
            </g>`
    };

    return artwork[sceneKey] || artwork.gwangan;
}

function createBusanMapIntroSvg(selectedScene) {
    const landmarks = BUSAN_MAP_SCENES.map(({ key, x, y }, index) => `
        <g class="map-landmark ${key === selectedScene ? 'is-selected' : ''}" data-map-scene="${key}" transform="translate(${x} ${y})" style="--map-order:${index}">
            <circle class="map-focus-ring" r="92"/>
            <g class="map-landmark-motion">
                <path class="map-landmark-shadow" d="M-88 61q88 18 176 0v16q-88 22-176 0Z"/>
                ${createBusanMapLandmarkArtwork(key)}
            </g>
        </g>
    `).join('');

    return `
        <svg class="busan-map-svg" viewBox="0 0 1000 1250" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id="mapSeaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop stop-color="var(--map-sea-top)"/><stop offset="1" stop-color="var(--map-sea-bottom)"/>
                </linearGradient>
                <linearGradient id="mapLandGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="var(--map-land-top)"/><stop offset="1" stop-color="var(--map-land-bottom)"/>
                </linearGradient>
            </defs>
            <rect class="map-ocean" width="1000" height="1250" rx="48" fill="url(#mapSeaGradient)"/>
            <g class="map-time-atmosphere">
                <g class="map-time-layer map-morning-layer"><circle cx="128" cy="164" r="52"/><path d="M39 230q75-35 154 0t156 0"/></g>
                <g class="map-time-layer map-day-layer"><circle cx="864" cy="139" r="43"/><g><path d="M864 71V40M864 238v-31M796 139h-31M963 139h-31M816 91l-23-23M912 187l23 23M912 91l23-23M816 187l-23 23"/></g></g>
                <g class="map-time-layer map-sunset-layer"><circle cx="842" cy="406" r="65"/><path d="M768 406h148l67 265H700Z"/></g>
                <g class="map-time-layer map-night-layer"><path d="M116 122a49 49 0 1 0 47 75a43 43 0 1 1-47-75Z"/><g><circle cx="225" cy="92" r="4"/><circle cx="330" cy="147" r="3"/><circle cx="578" cy="89" r="4"/><circle cx="749" cy="178" r="3"/><circle cx="914" cy="88" r="4"/></g></g>
            </g>
            <g class="map-clouds" fill="var(--map-cloud)"><path d="M87 326q12-30 48-25q25 3 31 25q34-20 61 10H62q3-12 25-10Z"/><path d="M743 272q11-27 42-23q23 3 29 23q31-17 55 9H721q3-11 22-9Z"/></g>
            <g class="map-world-art">
                <path class="map-mainland" d="M92 213Q164 119 295 138Q405 60 531 142Q660 87 771 172Q897 153 956 264Q984 352 927 428Q993 496 926 570Q963 652 873 704Q850 790 763 810Q712 900 622 872Q565 950 491 900Q417 936 365 870Q284 893 245 821Q140 816 126 724Q44 674 91 587Q39 514 96 444Q49 340 116 290Z" fill="url(#mapLandGradient)"/>
                <path class="map-river" d="M279 145Q224 264 255 372Q274 469 208 559Q158 632 190 718Q205 768 245 821"/>
                <path class="map-coast-highlight" d="M130 725Q218 761 291 733Q366 702 434 757Q512 817 581 755Q653 691 721 725Q792 759 858 687Q912 628 923 555"/>
                <g class="map-islands">
                    <path d="M350 855q57-38 119 6q42 32 33 109q-63 63-147 3q-43-49-5-118Z"/>
                    <path d="M205 932q34-25 70 4q20 28-4 58q-43 18-72-15q-13-29 6-47ZM656 982q29-23 58 1q20 29-8 52q-36 12-58-17q-11-22 8-36Z"/>
                </g>
                <g class="map-district-lines" fill="none"><path d="M159 306Q288 324 390 360T635 715M281 180Q347 257 390 360T365 575T375 785M531 151Q603 272 710 395T900 565M926 428Q821 439 710 395T635 715M165 770Q273 688 365 575M375 785Q422 858 480 985M635 715Q730 742 835 820"/></g>
                <g class="map-route-dots"><circle cx="165" cy="770" r="4"/><circle cx="390" cy="360" r="4"/><circle cx="365" cy="575" r="4"/><circle cx="375" cy="785" r="4"/><circle cx="480" cy="985" r="4"/><circle cx="635" cy="715" r="4"/><circle cx="710" cy="395" r="4"/><circle cx="835" cy="820" r="4"/><circle cx="900" cy="565" r="4"/></g>
                ${landmarks}
            </g>
            <g class="map-wave-lines" fill="none"><path d="M48 1066q92-22 184 0t184 0t184 0t184 0t184 0"/><path d="M-35 1140q120-26 240 0t240 0t240 0t240 0t240 0"/><path d="M85 1199q77-18 154 0t154 0t154 0t154 0t154 0"/></g>
        </svg>`;
}

function createBusanSceneIllustrationSvg(sceneKey, idSuffix = '') {
    const safeSceneKey = BUSAN_SCENES[sceneKey] ? sceneKey : 'gwangan';
    const artworkByScene = {
        gwangan: createGwanganSceneSvg,
        gamcheon: createGamcheonSceneSvg,
        nurimaru: createNurimaruSceneSvg,
        huinnyeoul: createHuinnyeoulSceneSvg,
        jagalchi: createJagalchiSceneSvg,
        haeundae: createHaeundaeSceneSvg,
        lotteBusan: createLotteBusanSceneSvg,
        busanTower: createBusanTowerSceneSvg,
        cinemaCenter: createCinemaCenterSceneSvg
    };
    const gradientId = `busanSceneSky${idSuffix || 'Header'}`;

    return `
    <div class="bridge-illustration-card busan-scene-card scene-${safeSceneKey}" data-scene="${safeSceneKey}">
        <svg class="gwangan-bridge-svg busan-scene-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--scene-sky-top)"/><stop offset="1" stop-color="var(--scene-sky-bottom)"/></linearGradient></defs>
            <rect width="400" height="200" fill="url(#${gradientId})"/>
            ${createAtmosphereSvg()}${artworkByScene[safeSceneKey]()}
        </svg>
        <div class="hero-sticker" aria-hidden="true"><strong>BUSAN</strong></div>
    </div>`;
}

function createCinematicIntro(data, target, sceneKey) {
    const overlay = document.createElement('div');
    overlay.className = 'cinematic-intro busan-map-intro';
    overlay.dataset.selectedScene = sceneKey;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="busan-map-stage">
            <div class="busan-map-world">
                ${createBusanMapIntroSvg(sceneKey)}
            </div>
        </div>
        <div class="map-intro-grain"></div>
    `;
    document.body.appendChild(overlay);

    return overlay;
}

function waitForIntro(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function playBusanMapIntro(overlay, sceneKey, performanceMode) {
    const mapWorld = overlay?.querySelector('.busan-map-world');
    const selectedLandmark = overlay?.querySelector('.map-landmark.is-selected .map-landmark-motion');
    const point = BUSAN_MAP_POINT_BY_SCENE[sceneKey] || BUSAN_MAP_POINT_BY_SCENE.gwangan;
    const litePerformance = performanceMode === 'lite';
    const balancedPerformance = performanceMode === 'balanced';

    if (!overlay || !mapWorld || typeof mapWorld.animate !== 'function') return;

    await waitForIntro(litePerformance ? 360 : balancedPerformance ? 680 : 980);
    if (overlay.dataset.cancelled === 'true' || !overlay.isConnected) return;

    overlay.classList.add('is-focusing');
    const worldRect = mapWorld.getBoundingClientRect();
    const focusX = worldRect.left + (point.x / 1000) * worldRect.width;
    const focusY = worldRect.top + (point.y / 1250) * worldRect.height;
    const isPortrait = window.innerHeight > window.innerWidth;
    const targetX = window.innerWidth / 2;
    const targetY = window.innerHeight * (isPortrait ? 0.43 : 0.46);
    const zoomScale = isPortrait
        ? litePerformance ? 2.25 : balancedPerformance ? 2.45 : 2.6
        : litePerformance ? 2.05 : balancedPerformance ? 2.2 : 2.3;
    const landmarkScale = isPortrait
        ? litePerformance ? 1.18 : balancedPerformance ? 1.34 : 1.3
        : litePerformance ? 1.08 : balancedPerformance ? 1.2 : 1.16;
    const translateX = targetX - focusX;
    const translateY = targetY - focusY;
    const zoomDuration = litePerformance ? 980 : balancedPerformance ? 1650 : 2250;

    mapWorld.style.transformOrigin = `${(point.x / 1000) * 100}% ${(point.y / 1250) * 100}%`;
    const mapAnimation = mapWorld.animate([
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        { transform: `translate3d(${translateX * 0.18}px, ${translateY * 0.18}px, 0) scale(1.08)`, opacity: 1, offset: 0.22 },
        { transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoomScale})`, opacity: 1 }
    ], {
        duration: zoomDuration,
        easing: 'cubic-bezier(0.68, 0, 0.22, 1)',
        fill: 'forwards'
    });

    const landmarkAnimation = selectedLandmark?.animate([
        { transform: 'translate3d(0, 0, 0) scale(1)' },
        { transform: `translate3d(0, -4px, 0) scale(${landmarkScale})` }
    ], {
        duration: zoomDuration,
        easing: 'cubic-bezier(0.68, 0, 0.22, 1)',
        fill: 'forwards'
    });

    await Promise.allSettled([
        mapAnimation.finished,
        landmarkAnimation?.finished || Promise.resolve()
    ]);
    if (overlay.dataset.cancelled === 'true' || !overlay.isConnected) return;
    await waitForIntro(litePerformance ? 60 : 180);
}

function collapseCinematicIntro(overlay, target, duration) {
    if (!overlay || !target || typeof overlay.animate !== 'function') {
        overlay?.remove();
        return Promise.resolve();
    }

    const backdropAnimation = overlay.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
    });

    return Promise.allSettled([backdropAnimation.finished])
        .finally(() => overlay.remove());
}

function initSceneVisibilityOptimization() {
    const sceneCards = [...document.querySelectorAll('.hero-cover .busan-scene-card')];
    if (sceneCards.length === 0) return;

    const syncDocumentVisibility = () => {
        sceneCards.forEach((card) => {
            card.classList.toggle('is-document-hidden', document.hidden);
        });
    };

    document.addEventListener('visibilitychange', syncDocumentVisibility, { passive: true });
    syncDocumentVisibility();

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle('is-scene-paused', !entry.isIntersecting);
        });
    }, { rootMargin: '80px 0px', threshold: 0.01 });

    sceneCards.forEach((card) => observer.observe(card));
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
            <div class="hero-cover">
                ${createBusanSceneIllustrationSvg(sceneKey)}
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
            </div>
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
        const userOS = getMobileOS();
        const stepFragment = document.createDocumentFragment();

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

            stepFragment.appendChild(stepElement);
        });

        stepContainer.replaceChildren(stepFragment);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const performanceMode = document.documentElement.dataset.performance || 'full';
    const litePerformance = performanceMode === 'lite';
    const balancedPerformance = performanceMode === 'balanced';
    const bridgeTarget = headerContainer?.querySelector('.bridge-illustration-card');
    const cinematicIntro = reduceMotion ? null : createCinematicIntro(data, bridgeTarget, sceneKey);
    initSceneVisibilityOptimization();

    function revealPage() {
        if (!appContainer) return;
        appContainer.classList.remove('is-intro');
        appContainer.classList.add('is-ready');
    }

    if (reduceMotion || !cinematicIntro || !bridgeTarget || !appContainer) {
        revealPage();
        cinematicIntro?.remove();
        document.body.classList.remove('is-intro');
        return;
    }

    let introFinished = false;
    let skipInProgress = false;

    function finishIntro() {
        if (introFinished) return;
        introFinished = true;
        window.removeEventListener('pointerdown', handleUserSkip);
        document.body.classList.remove('is-intro');
    }

    // 지도를 보는 중 화면을 누르면 현재 확대 상태에서 바로 본문으로 이동합니다.
    function handleUserSkip() {
        if (introFinished || skipInProgress || !cinematicIntro.isConnected) return;
        skipInProgress = true;
        cinematicIntro.dataset.cancelled = 'true';
        cinematicIntro.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
        const mapWorld = cinematicIntro.querySelector('.busan-map-world');
        if (mapWorld) mapWorld.style.opacity = '1';
        revealPage();
        collapseCinematicIntro(cinematicIntro, bridgeTarget, litePerformance ? 280 : 420)
            .finally(finishIntro);
    }

    window.addEventListener('pointerdown', handleUserSkip, { once: true, passive: true });

    // 전체 지도 감상 -> 선택 지역 줌인 -> 실제 페이지 순서로 바로 연결합니다.
    playBusanMapIntro(cinematicIntro, sceneKey, performanceMode)
        .then(() => {
            if (cinematicIntro.dataset.cancelled === 'true' || !cinematicIntro.isConnected) return;
            revealPage();
            return collapseCinematicIntro(
                cinematicIntro,
                bridgeTarget,
                litePerformance ? 420 : balancedPerformance ? 560 : 720
            );
        })
        .finally(() => {
            if (!skipInProgress) finishIntro();
        });
}
