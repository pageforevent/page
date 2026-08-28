document.addEventListener('DOMContentLoaded', () => {
    initApp();
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

// 열네 장소의 실루엣은 고정하고, 네 시간대의 팔레트와 모션은 CSS로 바꿉니다.
const BUSAN_SCENES = {
    gwangan: true,
    gamcheon: true,
    nurimaru: true,
    huinnyeoul: true,
    jagalchi: true,
    haeundae: true,
    lotteBusan: true,
    busanTower: true,
    cinemaCenter: true,
    gadeokdo: true,
    eulsukdo: true,
    beomeosa: true,
    sajik: true,
    ahopsan: true
};

// 부산시·관광 포털에서 쓰는 영문 장소명과 각 랜드마크의 대표 좌표입니다.
// 좌표 문자열을 고정해 모든 기기에서 같은 정밀도(소수점 넷째 자리)로 표시합니다.
const BUSAN_SCENE_LOCATIONS = {
    gwangan: {
        name: 'GWANGANDAEGYO BRIDGE',
        coordinates: '35.1457° N · 129.1284° E',
        latitude: 35.1457,
        longitude: 129.1284
    },
    gamcheon: {
        name: 'GAMCHEON CULTURE VILLAGE',
        coordinates: '35.0963° N · 129.0088° E',
        latitude: 35.0963,
        longitude: 129.0088
    },
    nurimaru: {
        name: 'NURIMARU APEC HOUSE',
        coordinates: '35.1524° N · 129.1514° E',
        latitude: 35.1524,
        longitude: 129.1514
    },
    huinnyeoul: {
        name: 'HUINNYEOUL CULTURE VILLAGE',
        coordinates: '35.0778° N · 129.0453° E',
        latitude: 35.0778,
        longitude: 129.0453
    },
    jagalchi: {
        name: 'JAGALCHI MARKET',
        coordinates: '35.0958° N · 129.0281° E',
        latitude: 35.0958,
        longitude: 129.0281
    },
    haeundae: {
        name: 'HAEUNDAE BEACH',
        coordinates: '35.1577° N · 129.1622° E',
        latitude: 35.1577,
        longitude: 129.1622
    },
    lotteBusan: {
        name: 'LOTTE DEPARTMENT STORE BUSAN MAIN STORE',
        coordinates: '35.1568° N · 129.0565° E',
        latitude: 35.1568,
        longitude: 129.0565
    },
    busanTower: {
        name: 'BUSAN TOWER',
        coordinates: '35.1010° N · 129.0324° E',
        latitude: 35.1010,
        longitude: 129.0324
    },
    cinemaCenter: {
        name: 'BUSAN CINEMA CENTER',
        coordinates: '35.1712° N · 129.1272° E',
        latitude: 35.1712,
        longitude: 129.1272
    },
    gadeokdo: {
        name: 'GADEOKDO LIGHTHOUSE',
        coordinates: '34.9904° N · 128.8291° E',
        latitude: 34.9904,
        longitude: 128.8291
    },
    eulsukdo: {
        name: 'EULSUKDO MIGRATORY BIRD PARK',
        coordinates: '35.1063° N · 128.9573° E',
        latitude: 35.1063,
        longitude: 128.9573
    },
    beomeosa: {
        name: 'BEOMEOSA TEMPLE',
        coordinates: '35.2841° N · 129.0687° E',
        latitude: 35.2841,
        longitude: 129.0687
    },
    sajik: {
        name: 'SAJIK BASEBALL STADIUM',
        coordinates: '35.1942° N · 129.0615° E',
        latitude: 35.1942,
        longitude: 129.0615
    },
    ahopsan: {
        name: 'AHOPSAN FOREST',
        coordinates: '35.2863° N · 129.1770° E',
        latitude: 35.2863,
        longitude: 129.1770
    }
};

// 부산의 실제 경위도를 1000 × 1250 마스터 지도에 같은 비율로 투영합니다.
// 16:9와 9:16은 지도를 늘리지 않고 이 마스터 지도를 서로 다르게 크롭합니다.
const BUSAN_MAP_PROJECTION = {
    minLongitude: 128.76,
    maxLongitude: 129.32,
    minLatitude: 34.95,
    maxLatitude: 35.41,
    longitudeScale: Math.cos(35.18 * Math.PI / 180),
    maxWidth: 820,
    maxHeight: 850
};

function projectBusanCoordinate(longitude, latitude) {
    const projection = BUSAN_MAP_PROJECTION;
    const geographicWidth = (projection.maxLongitude - projection.minLongitude) * projection.longitudeScale;
    const geographicHeight = projection.maxLatitude - projection.minLatitude;
    const scale = Math.min(
        projection.maxWidth / geographicWidth,
        projection.maxHeight / geographicHeight
    );
    const renderedWidth = geographicWidth * scale;
    const renderedHeight = geographicHeight * scale;
    const startX = (1000 - renderedWidth) / 2;
    const startY = (1250 - renderedHeight) / 2;

    return {
        x: startX + (longitude - projection.minLongitude) * projection.longitudeScale * scale,
        y: startY + (projection.maxLatitude - latitude) * scale
    };
}

// 실제 핀은 경위도 위치에 고정하고, 랜드마크 그림만 연결선과 함께 조금씩 벌립니다.
const BUSAN_MAP_LANDMARK_LAYOUT = {
    gadeokdo: { x: 155, y: 880 },
    eulsukdo: { x: 180, y: 730 },
    beomeosa: { x: 480, y: 350 },
    sajik: { x: 515, y: 465 },
    ahopsan: { x: 735, y: 385 },
    gamcheon: { x: 330, y: 700 },
    lotteBusan: { x: 500, y: 580 },
    busanTower: { x: 440, y: 800 },
    jagalchi: { x: 575, y: 840 },
    huinnyeoul: { x: 320, y: 880 },
    gwangan: { x: 625, y: 720 },
    cinemaCenter: { x: 670, y: 560 },
    nurimaru: { x: 760, y: 750 },
    haeundae: { x: 835, y: 600 }
};

const BUSAN_MAP_SCENES = Object.keys(BUSAN_SCENES).map((key) => {
    const location = BUSAN_SCENE_LOCATIONS[key];
    const anchor = projectBusanCoordinate(location.longitude, location.latitude);
    const display = BUSAN_MAP_LANDMARK_LAYOUT[key];
    return { key, x: display.x, y: display.y, anchorX: anchor.x, anchorY: anchor.y };
});

const BUSAN_MAP_POINT_BY_SCENE = Object.fromEntries(
    BUSAN_MAP_SCENES.map((scene) => [scene.key, scene])
);

// Boundary geometry: geoBoundaries KOR ADM2 (2020), CC BY 3.0.
// Source: https://www.geoboundaries.org/api/current/gbOpen/KOR/ADM2/
// The coordinates are projected once and rounded to 0.1 SVG units for a small runtime footprint.
const BUSAN_DISTRICT_PATHS = [
    { name: 'Gijang-gun', d: 'M737.8 271.9L729.1 308.5L723.6 325.1L687 329.5L664.9 309.6L646 306.3L636.1 327.3L628.3 367.1L618.3 389.2L611.5 405.1L608.4 412.4L632.7 444.5L630.5 465.5L633.9 482.1L643.8 499.8L652.3 509.5L659.3 517.5L673.7 541.8L681.5 561.8L690.3 599.4L729.1 601.6L747.9 611.6L757.1 614.6L757.9 614.9L767.9 611.6L781.1 586.1L770.1 568.4L770.1 551.8L787.8 540.7L808.8 509.7L809.9 490.9L803.3 484.3L790 484.3L788.9 472.1L812.2 461.1L817.7 448.9L822.1 389.2L829.9 377L848.7 361.5L872 369.3L853.1 310.7L829.9 275.3L821 268.7L804.4 267.6L783.4 276.4L752.4 283.1L737.8 271.9Z' },
    { name: 'Haeundae-gu', d: 'M652.3 509.5L632.7 534.4L621.3 550.6L611.4 566.9L608.6 578.3L608.4 579.2L605.7 591.7L611.4 614.4L614.3 630.3L614.9 633.6L630.5 648.4L637.5 656.6L639 658.4L649 673.3L660.3 680.3L676.6 677.5L702.8 679.6L711.3 674.7L714.9 655.5L721.3 642.8L731.9 633.6L756.7 632.8L757.1 614.6L747.9 611.6L729.1 601.6L690.3 599.4L681.5 561.8L673.7 541.8L659.3 517.5L652.3 509.5Z' },
    { name: 'Geumjeong-gu', d: 'M611.5 405.1L504.2 453.9L503 481.2L504.4 505.3L510 514.5L520 518.8L521.4 544.3L526.7 546.9L532.7 549.9L541.2 549.9L563.2 543.6L571.7 562L580.2 566.9L590.8 569.1L608.4 579.2L608.6 578.3L611.4 566.9L621.3 550.6L632.7 534.4L652.3 509.5L643.8 499.8L633.9 482.1L630.5 465.5L632.7 444.5L608.4 412.4L611.5 405.1Z' },
    { name: 'Buk-gu', d: 'M462.4 462.6L454 505L447 532.7L432.9 541.4L432.9 541.7L433.3 541.4L429.3 592.6L428.9 592.8L427.9 603.8L433.4 617.1L456.7 620.4L467.7 621.5L467.8 621.5L469.5 618.9L474.4 611.6L481 596.1L517.6 576.2L526.7 546.9L521.4 544.3L520 518.8L510 514.5L504.4 505.3L503 481.2L504.2 453.9L486.8 461.8L462.4 462.6Z' },
    { name: 'Saha-gu', d: 'M447.7 804.7L456.8 807.4L455.1 784.7L449.2 776.2L452.3 767.6L453 752L445.9 738.6L445.8 738.5L440.1 739.4L430.2 742.4L415.1 742.5L414.7 742.5L408.2 741.7L396.2 734.7L387.5 733L365.6 720.8L363.3 723.5L351.5 735.6L346.7 741.9L346.7 742L355.2 744.2L354.9 748L347.1 762.1L342.7 783.7L345.4 794.3L354.1 787.2L356.3 790.2L353.9 797.6L361.2 787.2L367.2 756.1L377.8 756.4L379.2 767.9L368.8 797.8L381.3 855.6L388.7 867.6L394.1 871.7L389 883.7L393 890L393.3 882.3L399.9 880.1L401.5 874.2L409.6 875.5L396.9 864.6L403.1 859.4L404.2 861.6L411.3 861.1L415.6 863.8L415.9 853.7L402.8 851.5L402.8 845.3L407.5 845.8L420 840.1L427.9 849.6L432.2 865.7L436.9 867.3L443.9 859.4L435.3 839L433.6 796.8L438.7 803.1L443.2 804.2L440.4 798L445.9 793.1L448.4 796.3L447.7 804.7Z' },
    { name: 'Yeongdo-gu', d: 'M513.1 813.4L524.5 821L536.8 823.7L536.8 832.2L544.4 841.7L554.4 839.5L560.2 845.5L563.4 856.7L577.3 857.2L577.3 850.2L581.7 840.1L574.3 837.9L568.1 832.2L565.1 822.6L560.4 822.9L558.8 820.2L575.1 813.6L579.5 809.6L581.1 803L563.2 813.4L555.5 798.1L556.9 795.9L548.7 783.1L528.6 766L503.5 774.4L494.6 782.6L488.6 777.9L491.6 794.8L513.1 813.4Z' },
    { name: 'Dongnae-gu', d: 'M608.4 579.2L590.8 569.1L580.2 566.9L571.7 562L563.2 543.6L541.2 549.9L532.7 549.9L526.7 546.9L517.6 576.2L481 596.1L474.4 611.6L469.5 618.9L469.6 619.3L469.9 618.9L474.7 630.8L474.8 631L497 627.1L514.9 611.1L531.5 604.5L552.2 600.5L569.9 608.8L590.7 629.6L600 633.7L602.9 646.3L603.1 647.2L614.3 630.3L611.4 614.4L605.7 591.7L608.4 579.2Z' },
    { name: 'Suyeong-gu', d: 'M614.3 630.3L603.1 647.2L602.9 646.3L600.6 655.7L588.7 643L578.7 643L575.4 647L576.7 653L577.5 662.1L580.7 669L581.4 678.3L577.4 683.6L604 704.4L614 696.2L614 685.9L610.2 685.9L612.1 676.1L619.8 670.4L624.9 673.1L637.5 670.4L638.8 667.9L632 658.1L637.5 656.6L630.5 648.4L614.9 633.6L614.3 630.3Z' },
    { name: 'Yeonje-gu', d: 'M474.8 631L474.8 631.1L474.6 631.3L487.7 647L504.7 640.6L507.2 644.9L519.5 646.6L527.2 643.6L529.7 637.7L540.8 641.9L545.9 644.9L549.7 653L552.3 669.6L557.1 675L558.7 676.8L566.3 678.1L577.5 662.1L576.7 653L575.4 647L578.7 643L588.7 643L600.6 655.7L602.9 646.3L600 633.7L590.7 629.6L569.9 608.8L552.2 600.5L531.5 604.5L514.9 611.1L497 627.1L474.8 631Z' },
    { name: 'Nam-gu', d: 'M577.5 662.1L566.3 678.1L558.7 676.8L557.1 675L551.7 681.5L550.6 683.2L545.2 687.2L541.1 688.1L541.1 684.3L537 684.3L536.5 691.9L539.5 697.6L538.7 700.9L538.4 709.6L537 716.7L539.2 722.4L537 727L548.2 729.2L543.8 735.7L548.5 736.5L548.2 740.1L541.7 747.4L543.8 749.6L540.8 754L551.4 761.9L573.5 763.2L573.5 753.4L578.1 754.8L580.8 780.7L587.6 784.8L595.3 782L592.5 776.9L602.9 762.4L615.1 769.2L623 769.5L627.4 752.1L628.7 732.7L622.5 724.6L618.9 713.1L615.7 711.8L611.6 718.6L612.1 709.8L604 704.4L577.4 683.6L581.4 678.3L580.7 669L577.5 662.1Z' },
    { name: 'Jung-gu', d: 'M481.7 775.8L496.2 773.7L497.2 768.3L499.7 768L497.4 760.5L503.9 764.3L505.1 762.2L500.2 757.7L501.9 755.6L505.6 759.5L508.2 758.4L504.5 754.7L513.1 747.2L504 740.8L498.3 728.9L484.9 718.1L480.9 718.5L481.7 721.6L485.4 722L489.6 734.7L479.8 740.3L474.1 748.6L474.9 754.4L480.5 760.3L481.7 775.8Z' },
    { name: 'Seo-gu', d: 'M447.7 804.7L449.5 820L455.1 829.3L459.3 830.8L457.5 834.3L453.9 835L454 843.9L458.4 853.1L454.2 856L464.2 852.4L465.1 845.3L474 836.8L471.6 823.9L466 814.3L471.4 808.9L475 811.6L477.3 809.8L479.6 791.9L481.6 791L479.1 787.4L481.2 787.2L478.8 777.8L481.7 775.8L480.5 760.3L474.9 754.4L474.1 748.6L479.8 740.3L489.6 734.7L485.4 722L481.7 721.6L480.9 718.5L479.6 712.3L480 711.2L481.2 708.5L485 698.4L484 685.3L478.8 681.3L474.2 684.3L455.5 681.6L455.5 682.9L458.2 695.5L446.3 738.5L445.9 738.6L453 752L452.3 767.6L449.2 776.2L455.1 784.7L456.8 807.4L447.7 804.7Z' },
    { name: 'Busanjin-gu', d: 'M474.6 631.3L468.8 637.7L460.2 643.7L455.5 655L455.5 669.6L455.5 681.5L455.5 681.6L474.2 684.3L478.8 681.3L484 685.3L485 698.4L481.2 708.5L480 711.2L492.4 707.1L496.5 706.3L501.4 699L508.4 697L521.2 699.2L539.5 697.6L536.5 691.9L537 684.3L541.1 684.3L541.1 688.1L545.2 687.2L550.6 683.2L551.7 681.5L557.1 675L552.3 669.6L549.7 653L545.9 644.9L540.8 641.9L529.7 637.7L527.2 643.6L519.5 646.6L507.2 644.9L504.7 640.6L487.7 647L474.6 631.3Z' },
    { name: 'Dong-gu', d: 'M538.7 700.9L539.1 699.1L521.2 699.2L508.4 697L501.4 699L496.5 706.3L492.4 707.1L480 711.2L479.6 712.3L480.9 718.5L484.9 718.1L498.3 728.9L504 740.8L513.1 747.2L516.4 743.8L512.3 740.4L514.6 736.9L520.5 741.3L522 739.6L512.9 731.5L514.8 726L522.3 723.2L522.2 727.6L518.2 731.4L523.8 736.1L535.7 720.1L538.4 709.6L538.7 700.9Z' },
    { name: 'Gangseo-gu', d: 'M432.9 541.7L425 546.5L402.5 548.3L402.3 548.2L402 548.3L376.1 544.8L359.2 544.8L347.1 556.9L326.3 565.6L326 565.5L325.9 565.6L307.3 563.9L290 581.1L289.6 581.1L262.3 581.1L253.7 593.2L255.4 617.5L271 631.3L269.2 648.6L260.6 671.1L260.2 671.1L241.1 669.4L230.9 659.1L212.1 669.4L198.3 674.6L197.9 674.6L165.3 672.9L165 672.8L135.9 681.4L135.6 681.5L132.8 679.2L134.8 682.5L135.9 685L145.5 700.6L155.5 710.3L190.2 723.2L196.6 728L201.7 738.5L205.6 765.9L198.8 782.2L193.3 784.2L198.9 801.1L150.4 801.9L152.5 808.3L197.6 809.6L195.9 819L158.1 827.9L158.5 837.7L142.3 840.7L140.6 836.4L137.2 836.4L138.1 851.7L145.3 851.7L145.3 859L149.6 862.4L155.1 861.1L166.1 872.2L166.6 885.4L162.3 888.4L165.3 892.6L170 893.5L171.2 902.9L166.6 905L161 902.4L156.8 905.4L164.4 908L165.7 911.4L181.9 916.9L184.9 920.3L187 925.4L180.6 931L183.2 934L182.3 939.5L176.4 942.1L182.7 950.6L181.9 955.7L184.4 957.8L194.2 957.4L192.5 968.5L206.5 954L204.8 950.2L208.7 932.3L199.7 926.7L199.7 922L207.4 913.5L212.5 898.2L211.6 893.5L218.5 888.4L223.6 868.8L218.5 841.1L225.3 835.1L234.6 833L228.2 824.1L218.9 824.9L208.7 822.4L208.2 816L206.1 814.7L203.6 824.5L201 824.9L204.8 798.1L248.2 799.8L250.8 802.3L263.5 803.6L264.8 824.5L241 823.2L238.9 820.2L235 822.8L252 832.6L268.6 831.3L273.3 829.2L272 801.9L277.5 780L276.8 760.7L290.7 728.8L304.7 735.4L297.1 743.6L295 749.6L296.3 758.9L293.3 782.8L289.9 787.9L290.3 805.8L312 804.1L313.3 791.3L336.2 775.1L338.8 765.3L346.7 742L351.5 735.6L363.3 723.5L365.6 720.8L365.7 720.6L381.2 729.2L384.8 629.9L392 616.7L415.9 598.8L428.9 592.8L429.3 592.6L433.3 541.4L432.9 541.7Z' },
    { name: 'Sasang-gu', d: 'M428.9 592.8L415.9 598.8L392 616.7L384.8 629.9L381.2 729.2L396.6 734.7L408.6 741.7L415.1 742.5L430.2 742.4L440.1 739.4L445.8 738.5L446.3 738.5L458.2 695.5L455.5 682.9L455.5 669.6L455.5 655L460.2 643.7L468.8 637.7L474.6 631.3L474.8 631.1L474.7 630.8L469.9 618.9L469.6 619.3L468.2 621.5L467.7 621.5L456.7 620.4L433.4 617.1L427.9 603.8L428.9 592.8Z' }
];

function chooseRandomBusanScene() {
    const keys = Object.keys(BUSAN_SCENES);
    const previewScene = new URLSearchParams(window.location.search).get('scene');
    if (previewScene && BUSAN_SCENES[previewScene]) return previewScene;

    // 한 장소가 연속으로 뽑히지 않고, 열네 장소를 모두 본 뒤 다시 섞습니다.
    try {
        const bagKey = 'busan-scene-bag-v4';
        const lastKey = 'busan-scene-last-v4';
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

function createGadeokdoSceneSvg() {
    return `
        <rect y="126" width="400" height="74" fill="var(--scene-sea-top)"/>
        <path d="M0 171q78-13 156 0t156 0t156 0v29H0Z" fill="var(--scene-sea-bottom)"/>
        <path d="M0 117Q58 77 118 91q44 11 83 51l25 58H0Z" fill="var(--scene-hill)"/>
        <g class="gadeokdo-beam" opacity=".18">
            <path d="M248 55L400 12V78Z" fill="var(--scene-light)"/>
        </g>
        <g class="scene-landmark gadeokdo-landmark scene-kitsch">
            <path class="kitsch-shadow" d="M91 165h235v9H91Z"/>
            <g class="gadeokdo-keeper-house kitsch-main">
                <path d="M111 112h95v53h-95Z" fill="var(--scene-house)"/>
                <path d="M101 112l59-31l58 31Z" fill="var(--scene-pop-1)"/>
                <path d="M128 129h22v36h-22ZM169 127h22v19h-22Z" fill="var(--scene-glass)"/>
                <path d="M108 165h103" fill="none" stroke="var(--scene-line)" stroke-width="4"/>
            </g>
            <g class="gadeokdo-lighthouse kitsch-main">
                <path d="M222 160l9-88h36l9 88Z" fill="var(--scene-structure)"/>
                <path d="M228 100h42M225 124h48" fill="none" stroke="var(--scene-pop-2)" stroke-width="7"/>
                <path d="M226 72l7-20h32l7 20Z" fill="var(--scene-house)"/>
                <path d="M232 49h34v12h-34Z" fill="var(--scene-glass)"/>
                <path d="M225 49h48l-24-18Z" fill="var(--scene-pop-1)"/>
                <circle class="gadeokdo-beacon scene-night-lights" cx="249" cy="48" r="5" fill="var(--scene-light)" stroke="none"/>
                <path d="M249 31V18" fill="none" stroke-width="4"/>
            </g>
            <g class="gadeokdo-rocks kitsch-main" fill="var(--scene-ink)">
                <path d="M0 174l23-25l22 11l25-27l29 41ZM279 176l22-22l17 8l22-28l36 42Z"/>
            </g>
            <g class="gadeokdo-gulls" fill="none" stroke="var(--scene-ink-soft)" stroke-width="2.2" stroke-linecap="round">
                <path d="M304 87q8-9 16 0q8-9 16 0M342 105q5-6 10 0q5-6 10 0"/>
            </g>
        </g>
        <g class="scene-water-lines" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".72"><path d="M212 148q50-7 100 0t100 0M186 184q58-8 116 0t116 0"/></g>`;
}

function createEulsukdoSceneSvg() {
    return `
        <rect y="111" width="400" height="89" fill="var(--scene-sea-top)"/>
        <path d="M0 159q87-14 174 0t174 0t174 0v41H0Z" fill="var(--scene-sea-bottom)"/>
        <path d="M0 132Q67 110 128 123q67 13 132-4q71-18 140 5v30H0Z" fill="var(--scene-hill)"/>
        <g class="scene-landmark eulsukdo-landmark scene-kitsch">
            <g class="eulsukdo-reeds kitsch-detail" stroke="var(--scene-pop-3)" stroke-width="3" stroke-linecap="round">
                <path d="M18 190q5-40 0-73M29 190q-2-49 8-83M43 190q3-40 15-70M67 190q-4-45-1-77M82 190q4-39 16-65M304 190q-4-48 1-80M320 190q3-43 16-73M344 190q-2-51 7-84M369 190q2-42 14-71M389 190q-3-37-2-68"/>
                <path d="M13 122q11 0 17 9M34 111q9 2 14 11M60 119q10-1 16 8M299 116q10-1 17 8M342 112q10 1 15 10M377 124q8-1 13 7" stroke="var(--scene-light)"/>
            </g>
            <g class="eulsukdo-eco-center kitsch-main">
                <path d="M118 151V87h142v64Z" fill="var(--scene-house)"/>
                <path d="M102 91l88-42l88 42Z" fill="var(--scene-pop-2)"/>
                <path d="M135 99h109v38H135Z" fill="var(--scene-glass)"/>
                <g class="kitsch-detail" opacity=".72"><path d="M157 99v38M189 99v38M221 99v38M135 118h109"/></g>
                <path d="M107 151h166" fill="none" stroke="var(--scene-pop-1)" stroke-width="6"/>
                <path d="M174 118h31v33h-31Z" fill="var(--scene-ink)"/>
            </g>
            <g class="eulsukdo-flock" fill="none" stroke="var(--scene-ink-soft)" stroke-width="2.1" stroke-linecap="round">
                <path d="M46 57q8-8 16 0q8-8 16 0M79 41q6-7 12 0q6-7 12 0M292 59q8-9 16 0q8-9 16 0M326 42q5-6 10 0q5-6 10 0"/>
            </g>
            <path class="eulsukdo-boardwalk" d="M78 190L153 147h71l82 43" fill="none" stroke="var(--scene-house)" stroke-width="9" stroke-linecap="round"/>
            <path d="M78 190L153 147h71l82 43" fill="none" stroke="var(--scene-pop-1)" stroke-width="2" stroke-dasharray="10 8"/>
        </g>
        <g class="scene-water-lines eulsukdo-ripples" fill="none" stroke="var(--scene-water-line)" stroke-width="1.4" opacity=".7"><path d="M91 167q42-6 84 0t84 0M224 181q38-6 76 0t76 0"/></g>`;
}

function createBeomeosaSceneSvg() {
    return `
        <path d="M0 113Q54 56 112 89q54-65 111-20q55-49 110 3q34-24 67 2v126H0Z" fill="var(--scene-hill)"/>
        <path d="M0 151q81-27 162-4q94-34 238 4v49H0Z" fill="var(--scene-ink)" opacity=".16"/>
        <g class="scene-landmark beomeosa-landmark scene-kitsch">
            <g class="beomeosa-trees" fill="var(--scene-ink)"><path d="M5 174q4-58 35-83q30 24 34 83ZM324 174q5-64 39-91q31 27 35 91Z"/></g>
            <g class="beomeosa-gate kitsch-main">
                <path d="M52 101Q77 92 91 76Q137 61 183 76Q197 92 222 101Q178 95 137 95Q95 95 52 101Z" fill="var(--scene-ink)"/>
                <path d="M65 96Q137 75 209 96L218 105Q137 91 56 105Z" fill="var(--scene-pop-2)"/>
                <path d="M61 105h151v14H61Z" fill="var(--scene-house)"/>
                <path d="M78 119h118v54H78Z" fill="var(--scene-house)"/>
                <path d="M88 119h12v54H88ZM119 119h12v54h-12ZM150 119h12v54h-12ZM181 119h12v54h-12Z" fill="var(--scene-pop-1)"/>
                <path d="M91 133h92v27H91Z" fill="var(--scene-glass)"/>
                <path d="M118 108h38v16h-38Z" fill="var(--scene-ink)"/><path d="M126 113h22" fill="none" stroke="var(--scene-light)" stroke-width="3"/>
                <path d="M54 173h166" fill="none" stroke="var(--scene-pop-1)" stroke-width="6"/>
            </g>
            <g class="beomeosa-pagoda kitsch-main">
                <path d="M272 165h61v9h-61ZM282 151h41v14h-41ZM276 148h53l-9-8h-35ZM286 127h33v13h-33ZM280 124h45l-8-8h-29ZM292 98h21v18h-21ZM285 96h35l-17-12Z" fill="var(--scene-structure)"/>
            </g>
            <g class="beomeosa-lanterns scene-night-lights" fill="var(--scene-light)">
                <circle cx="103" cy="128" r="5"/><circle cx="170" cy="128" r="5"/><circle cx="238" cy="144" r="4"/>
            </g>
            <g class="beomeosa-leaves" fill="var(--scene-pop-1)"><path d="M46 64q10-8 16 4q-11 7-16-4ZM231 69q9-8 15 3q-10 8-15-3ZM354 54q10-7 15 5q-11 6-15-5Z"/></g>
            <path class="beomeosa-path" d="M111 200q26-38 52-38h37q31 8 54 38Z" fill="var(--scene-house)" opacity=".72"/>
        </g>`;
}

function createSajikSceneSvg() {
    return `
        <path d="M0 159H400V200H0Z" fill="var(--scene-ink)"/>
        <path d="M0 183q95-13 190 0t210 0v17H0Z" fill="var(--scene-hill)" opacity=".75"/>
        <g class="scene-landmark sajik-landmark scene-kitsch">
            <g class="sajik-light-towers kitsch-detail"><path d="M38 151V48M29 49h37M51 49v102M337 151V48M328 49h37M350 49v102" fill="none"/><g fill="var(--scene-light)" stroke="none"><circle cx="34" cy="49" r="4"/><circle cx="47" cy="49" r="4"/><circle cx="61" cy="49" r="4"/><circle cx="333" cy="49" r="4"/><circle cx="347" cy="49" r="4"/><circle cx="361" cy="49" r="4"/></g></g>
            <g class="sajik-stadium kitsch-main">
                <path d="M54 99Q200 31 346 99L326 170H74Z" fill="var(--scene-structure)"/>
                <path d="M71 103Q200 52 329 103l-15 39H86Z" fill="var(--scene-pop-3)"/>
                <path d="M99 111Q200 76 301 111l-10 35H109Z" fill="var(--scene-glass)"/>
                <path d="M127 131Q200 104 273 131l-19 32H146Z" fill="var(--scene-hill)"/>
                <path d="M54 100Q200 31 346 100" fill="none" stroke="var(--scene-pop-1)" stroke-width="7"/>
            </g>
            <g class="sajik-scoreboard kitsch-main">
                <path d="M163 61h74v44h-74Z" fill="var(--scene-ink)"/>
                <path class="sajik-scoreboard-glow" d="M172 70h56v25h-56Z" fill="var(--scene-light)" stroke="none"/>
                <path d="M182 78h10v10h-10ZM208 78h10v10h-10Z" fill="var(--scene-pop-1)" stroke="none"/>
            </g>
            <g class="sajik-crowd" fill="var(--scene-light)"><circle cx="96" cy="110" r="3"/><circle cx="116" cy="101" r="3"/><circle cx="139" cy="94" r="3"/><circle cx="261" cy="94" r="3"/><circle cx="284" cy="101" r="3"/><circle cx="304" cy="110" r="3"/></g>
            <path class="sajik-cheer-streamer" d="M88 121q53-24 106 0t112 0" fill="none" stroke="var(--scene-light)" stroke-width="3" stroke-dasharray="9 8"/>
            <path d="M23 170H377" stroke="var(--scene-pop-2)" stroke-width="5"/>
        </g>`;
}

function createAhopsanSceneSvg() {
    return `
        <path d="M0 118Q69 57 133 85q63-39 124 0q72-31 143 24v91H0Z" fill="var(--scene-hill)"/>
        <path class="ahopsan-path" d="M151 200q28-77 53-101q23 28 53 101Z" fill="var(--scene-house)" opacity=".78"/>
        <g class="scene-landmark ahopsan-landmark scene-kitsch">
            <g class="ahopsan-light-shafts" fill="var(--scene-light)" opacity=".12"><path d="M61 0h30l79 200h-47ZM290 0h26l-42 200h-50Z"/></g>
            <g class="ahopsan-bamboo ahopsan-bamboo-left kitsch-main" fill="var(--scene-pop-2)">
                <path d="M25 200L42 15h18L49 200ZM80 200L92 31h17l-4 169ZM126 200l5-151h16l4 151Z"/>
                <g class="kitsch-detail"><path d="M35 83h20M32 125h20M87 88h19M84 132h20M128 96h20M128 139h21"/></g>
                <g fill="var(--scene-hill)" stroke="none"><path d="M47 54q-34-18-39 10q27 12 39-10ZM55 76q33-20 43 6q-27 15-43-6ZM97 60q-31-20-40 6q25 16 40-6ZM104 96q29-18 40 6q-23 15-40-6ZM139 73q-24-14-32 7q20 12 32-7Z"/></g>
            </g>
            <g class="ahopsan-bamboo ahopsan-bamboo-right kitsch-main" fill="var(--scene-pop-2)">
                <path d="M351 200L340 19h18l16 181ZM301 200l-7-165h17l15 165ZM258 200l-1-148h16l10 148Z"/>
                <g class="kitsch-detail"><path d="M343 81h20M347 124h20M294 91h20M298 134h21M256 98h19M259 141h19"/></g>
                <g fill="var(--scene-hill)" stroke="none"><path d="M350 54q32-20 41 7q-25 16-41-7ZM341 82q-31-18-41 7q25 14 41-7ZM304 62q28-18 39 6q-22 15-39-6ZM298 102q-28-17-38 7q23 14 38-7ZM265 76q24-15 33 6q-19 12-33-6Z"/></g>
            </g>
            <g class="ahopsan-fireflies scene-night-lights" fill="var(--scene-light)"><circle cx="173" cy="91" r="2.8"/><circle cx="223" cy="76" r="2.2"/><circle cx="187" cy="133" r="2.4"/><circle cx="237" cy="148" r="2.7"/><circle cx="207" cy="112" r="1.8"/></g>
            <g class="ahopsan-walker" fill="var(--scene-ink)"><circle cx="204" cy="133" r="5"/><path d="M199 139h10l3 21l-8 12l-8-12Z"/></g>
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
            </g>`,
        gadeokdo: `
            <path class="map-water" d="M-90 38q44-10 88 0t92 0v31H-90Z"/>
            <path class="map-hill" d="M-91 45Q-62 5-25 23Q2 38 19 69H-91Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M3 58L12-31H45L54 58Z" fill="var(--map-structure)"/>
                <path d="M8-31l7-18h27l7 18Z" fill="var(--map-paper)"/>
                <path d="M11-52h35L28-69Z" fill="var(--map-pop)"/>
                <path d="M8 4h41" stroke="var(--map-light)" stroke-width="7"/>
                <path d="M-64 22h63v43h-63Z" fill="var(--map-paper)"/>
                <path d="M-71 22l39-24L7 22Z" fill="var(--map-pop)"/>
            </g>`,
        eulsukdo: `
            <path class="map-water" d="M-91 20q45-10 90 0t91 0v49H-91Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-58 43V-17H57V43Z" fill="var(--map-paper)"/>
                <path d="M-69-14L0-52L69-14Z" fill="var(--map-pop)"/>
                <path d="M-43-5H42V27H-43Z" fill="var(--map-glass)"/>
                <path d="M-88 65L-38 40H37L88 65" fill="none" stroke="var(--map-light)" stroke-width="7"/>
                <path d="M-82-43q8-8 16 0q8-8 16 0M46-37q7-8 14 0q7-8 14 0" fill="none" stroke="var(--map-paper)"/>
            </g>`,
        beomeosa: `
            <path class="map-hill" d="M-92 29Q-45-33 0 5Q40-39 92 18V69H-92Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-72-4Q0-58 72-4Q0-22-72-4Z" fill="var(--map-pop)"/>
                <path d="M-79 2H79V17H-79Z" fill="var(--map-paper)"/>
                <path d="M-62 17H62V63H-62Z" fill="var(--map-structure)"/>
                <path d="M-45 18v45M-15 18v45M15 18v45M45 18v45" fill="none" stroke="var(--map-light)"/>
                <path d="M-88 64H88" stroke="var(--map-pop)" stroke-width="7"/>
            </g>`,
        sajik: `
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-88-5Q0-58 88-5L72 57H-72Z" fill="var(--map-structure)"/>
                <path d="M-70 0Q0-35 70 0L58 34H-58Z" fill="var(--map-pop)"/>
                <path d="M-42 18Q0-5 42 18L28 50H-28Z" fill="var(--map-glass)"/>
                <path d="M-25-47h50v35h-50Z" fill="var(--map-ink)"/>
                <path d="M-17-39h34v18h-34Z" fill="var(--map-light)" stroke="none"/>
                <path d="M-88-4Q0-58 88-4" fill="none" stroke="var(--map-paper)" stroke-width="6"/>
            </g>`,
        ahopsan: `
            <path class="map-hill" d="M-92 17Q-44-25 0 6Q43-31 92 12V69H-92Z"/>
            <g stroke="var(--map-ink)" stroke-width="3" stroke-linejoin="round">
                <path d="M-72 67L-58-67h18L-47 67ZM-30 67L-23-54h17L-7 67ZM49 67L39-62h18L70 67ZM9 67L8-49h17l4 116Z" fill="var(--map-glass)"/>
                <path d="M-53-38q-31-17-37 9q25 14 37-9ZM-45-10q31-18 39 7q-25 13-39-7ZM50-32q30-18 39 7q-24 14-39-7ZM43 1q-28-17-37 6q23 14 37-6Z" fill="var(--map-pop)" stroke="none"/>
                <path d="M-19 69Q0 8 18 69Z" fill="var(--map-paper)"/>
            </g>`
    };

    return artwork[sceneKey] || artwork.gwangan;
}

function createBusanMapIntroSvg(selectedScene) {
    const landscapeMap = window.matchMedia('(min-aspect-ratio: 4 / 3)').matches;
    const mapViewBox = landscapeMap ? '-120 220 1240 770' : '0 0 1000 1250';
    const districtGeometry = BUSAN_DISTRICT_PATHS.map(({ name, d }) =>
        `<path data-district="${name}" d="${d}"/>`
    ).join('');
    const locationGuides = BUSAN_MAP_SCENES.map(({ key, x, y, anchorX, anchorY }) => `
        <g class="map-location-guide ${key === selectedScene ? 'is-selected' : ''}" data-guide-scene="${key}">
            <path d="M${anchorX.toFixed(1)} ${anchorY.toFixed(1)}L${x} ${y}"/>
            <circle cx="${anchorX.toFixed(1)}" cy="${anchorY.toFixed(1)}" r="5"/>
            <circle class="map-location-pin-core" cx="${anchorX.toFixed(1)}" cy="${anchorY.toFixed(1)}" r="2"/>
        </g>
    `).join('');
    const landmarks = BUSAN_MAP_SCENES.map(({ key, x, y }, index) => `
        <g class="map-landmark ${key === selectedScene ? 'is-selected' : ''}" data-map-scene="${key}" transform="translate(${x} ${y})" style="--map-order:${index}">
            <rect class="map-focus-ring" x="-66" y="-58" width="132" height="116" rx="25"/>
            <rect class="map-landmark-badge" x="-58" y="-50" width="116" height="100" rx="20"/>
            <g class="map-landmark-motion">
                <g class="map-landmark-art" transform="scale(0.5)">
                    <path class="map-landmark-shadow" d="M-88 61q88 18 176 0v16q-88 22-176 0Z"/>
                    ${createBusanMapLandmarkArtwork(key)}
                </g>
            </g>
        </g>
    `).join('');

    return `
        <svg class="busan-map-svg" viewBox="${mapViewBox}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id="mapLandGradient" gradientUnits="userSpaceOnUse" x1="120" y1="260" x2="880" y2="950">
                    <stop stop-color="var(--map-land-top)"/><stop offset="1" stop-color="var(--map-land-bottom)"/>
                </linearGradient>
            </defs>
            <g class="map-world-art">
                <!-- The 16 district polygons share one fill and no internal stroke, reading as one Busan silhouette. -->
                <g class="map-district-geometry" fill="url(#mapLandGradient)">${districtGeometry}</g>
                <g class="map-location-guides">${locationGuides}</g>
                ${landmarks}
            </g>
        </svg>`;
}

function createBusanSceneIllustrationSvg(sceneKey, idSuffix = '') {
    const safeSceneKey = BUSAN_SCENES[sceneKey] ? sceneKey : 'gwangan';
    const sceneLocation = BUSAN_SCENE_LOCATIONS[safeSceneKey];
    const artworkByScene = {
        gwangan: createGwanganSceneSvg,
        gamcheon: createGamcheonSceneSvg,
        nurimaru: createNurimaruSceneSvg,
        huinnyeoul: createHuinnyeoulSceneSvg,
        jagalchi: createJagalchiSceneSvg,
        haeundae: createHaeundaeSceneSvg,
        lotteBusan: createLotteBusanSceneSvg,
        busanTower: createBusanTowerSceneSvg,
        cinemaCenter: createCinemaCenterSceneSvg,
        gadeokdo: createGadeokdoSceneSvg,
        eulsukdo: createEulsukdoSceneSvg,
        beomeosa: createBeomeosaSceneSvg,
        sajik: createSajikSceneSvg,
        ahopsan: createAhopsanSceneSvg
    };
    const gradientId = `busanSceneSky${idSuffix || 'Header'}`;

    return `
    <div class="bridge-illustration-card busan-scene-card scene-${safeSceneKey}" data-scene="${safeSceneKey}">
        <svg class="gwangan-bridge-svg busan-scene-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--scene-sky-top)"/><stop offset="1" stop-color="var(--scene-sky-bottom)"/></linearGradient></defs>
            <rect width="400" height="200" fill="url(#${gradientId})"/>
            ${createAtmosphereSvg()}${artworkByScene[safeSceneKey]()}
        </svg>
        <div class="hero-sticker scene-location-stamp">
            <strong>${sceneLocation.name}</strong>
            <span>${sceneLocation.coordinates}</span>
        </div>
    </div>`;
}

function createCinematicIntro(sceneKey) {
    const overlay = document.createElement('div');
    const safeSceneKey = BUSAN_SCENES[sceneKey] ? sceneKey : 'gwangan';
    const sceneLocation = BUSAN_SCENE_LOCATIONS[safeSceneKey] || BUSAN_SCENE_LOCATIONS.gwangan;
    overlay.className = 'cinematic-intro busan-map-intro';
    overlay.dataset.selectedScene = safeSceneKey;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="busan-map-stage">
            <div class="busan-map-world">
                ${createBusanMapIntroSvg(safeSceneKey)}
            </div>
            <div class="map-selected-caption">
                <strong>${sceneLocation.name}</strong>
                <span>${sceneLocation.coordinates}</span>
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
    const mapSvg = overlay?.querySelector('.busan-map-svg');
    const selectedLandmark = overlay?.querySelector('.map-landmark.is-selected .map-landmark-motion');
    const point = BUSAN_MAP_POINT_BY_SCENE[sceneKey] || BUSAN_MAP_POINT_BY_SCENE.gwangan;
    const litePerformance = performanceMode === 'lite';
    const balancedPerformance = performanceMode === 'balanced';

    if (!overlay || !mapWorld || !mapSvg || typeof mapWorld.animate !== 'function') return;

    // 전체 지도를 충분히 감상할 수 있도록 여유 있는 시각 제공 (~1.2초)
    await waitForIntro(litePerformance ? 750 : balancedPerformance ? 1000 : 1200);
    if (overlay.dataset.cancelled === 'true' || !overlay.isConnected) return;

    overlay.classList.add('is-focusing');
    const worldRect = mapWorld.getBoundingClientRect();
    const viewBox = mapSvg.viewBox.baseVal;
    const pointRatioX = (point.x - viewBox.x) / viewBox.width;
    const pointRatioY = (point.y - viewBox.y) / viewBox.height;
    const focusX = worldRect.left + pointRatioX * worldRect.width;
    const focusY = worldRect.top + pointRatioY * worldRect.height;
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

    // 부드럽고 매끄럽게 슥- 미끄러지는 시네마틱 글라이드 줌 (~1.1초)
    const zoomDuration = litePerformance ? 750 : balancedPerformance ? 950 : 1100;

    mapWorld.style.transformOrigin = `${pointRatioX * 100}% ${pointRatioY * 100}%`;
    const mapAnimation = mapWorld.animate([
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        { transform: `translate3d(${translateX * 0.18}px, ${translateY * 0.18}px, 0) scale(1.09)`, opacity: 1, offset: 0.28 },
        { transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoomScale})`, opacity: 1 }
    ], {
        duration: zoomDuration,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
    });

    const landmarkAnimation = selectedLandmark?.animate([
        { transform: 'translate3d(0, 0, 0) scale(1)' },
        { transform: `translate3d(0, -4px, 0) scale(${landmarkScale})` }
    ], {
        duration: zoomDuration,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
    });

    await Promise.allSettled([
        mapAnimation.finished,
        landmarkAnimation?.finished || Promise.resolve()
    ]);
    if (overlay.dataset.cancelled === 'true' || !overlay.isConnected) return;
    await waitForIntro(litePerformance ? 40 : 90);
}

function collapseCinematicIntro(overlay, target, duration) {
    if (!overlay || typeof overlay.animate !== 'function') {
        overlay?.remove();
        return Promise.resolve();
    }

    const backdropAnimation = overlay.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration,
        easing: 'cubic-bezier(0.25, 1, 0.35, 1)',
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

// 이벤트 데이터 로드 (인트로와 병렬 실행)
async function loadEventDataPromise(sceneKey) {
    try {
        const response = await (window.__eventDataPromise || fetch('data.json', {
            cache: 'no-cache',
            credentials: 'same-origin'
        }));
        if (response?.__eventDataError) throw response.__eventDataError;
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        renderPageContent(data, sceneKey);
        return data;
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

// 본문 헤더 및 스텝 카드 렌더링
function renderPageContent(data, sceneKey) {
    document.title = data.pageTitle;
    const currentDate = getCurrentDateDisplay();

    // 헤더 영역 렌더링
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="hero-cover" id="hero-cover-swipe" tabindex="0" role="region" aria-label="부산 랜드마크 갤러리 (좌우로 스와이프하여 탐색)">
                <div class="hero-scene-viewport">
                    <div class="hero-scene-stage" id="hero-scene-stage">
                        ${createBusanSceneIllustrationSvg(sceneKey, 'Header')}
                    </div>
                </div>
                <div class="hero-swipe-hint" aria-label="랜드마크 넘기기">
                    <button class="swipe-arrow-btn swipe-arrow-left" type="button" aria-label="이전 랜드마크">‹</button>
                    <span class="swipe-counter"><strong id="hero-scene-counter-current">01</strong> / <span id="hero-scene-counter-total">14</span></span>
                    <button class="swipe-arrow-btn swipe-arrow-right" type="button" aria-label="다음 랜드마크">›</button>
                </div>
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
        initHeroSwipeCarousel(sceneKey);
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
            stepElement.style.setProperty('--step-delay', `${0.06 + index * 0.06}s`);
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

    initSceneVisibilityOptimization();
}

// 상단 랜드마크 일러스트 좌우 스와이프 제어
function initHeroSwipeCarousel(initialSceneKey) {
    const heroCover = document.getElementById('hero-cover-swipe');
    const stage = document.getElementById('hero-scene-stage');
    const counterCurrent = document.getElementById('hero-scene-counter-current');
    const counterTotal = document.getElementById('hero-scene-counter-total');
    if (!heroCover || !stage) return;

    const scenes = Object.keys(BUSAN_SCENES);
    if (counterTotal) counterTotal.textContent = String(scenes.length).padStart(2, '0');

    let currentIndex = scenes.indexOf(initialSceneKey);
    if (currentIndex === -1) currentIndex = 0;

    function updateCounter() {
        if (counterCurrent) {
            counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
        }
    }
    updateCounter();

    let isAnimating = false;
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let diffX = 0;
    let diffY = 0;
    let isHorizontalSwipe = false;

    function switchScene(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const nextIndex = (currentIndex + direction + scenes.length) % scenes.length;
        const nextSceneKey = scenes[nextIndex];
        currentIndex = nextIndex;
        updateCounter();

        // 실시간 테마 컬러 및 메타 데이터 동기화
        document.documentElement.dataset.sceneTheme = nextSceneKey;

        const currentCard = stage.querySelector('.busan-scene-card:not(.is-sliding-in)');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createBusanSceneIllustrationSvg(nextSceneKey, 'Slide_' + Date.now());
        const nextCard = tempDiv.firstElementChild;
        if (!nextCard || !currentCard) {
            isAnimating = false;
            return;
        }

        nextCard.classList.add('is-sliding-in');
        stage.appendChild(nextCard);

        const duration = 320;
        const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

        const outAnim = currentCard.animate([
            { transform: 'translate3d(0, 0, 0)', opacity: 1 },
            { transform: `translate3d(${-direction * 100}%, 0, 0)`, opacity: 0.2 }
        ], { duration, easing, fill: 'forwards' });

        const inAnim = nextCard.animate([
            { transform: `translate3d(${direction * 100}%, 0, 0)`, opacity: 0.4 },
            { transform: 'translate3d(0, 0, 0)', opacity: 1 }
        ], { duration, easing, fill: 'forwards' });

        Promise.allSettled([outAnim.finished, inAnim.finished]).then(() => {
            currentCard.remove();
            nextCard.classList.remove('is-sliding-in');
            nextCard.style.transform = '';
            isAnimating = false;
            initSceneVisibilityOptimization();
        });
    }

    heroCover.addEventListener('pointerdown', (e) => {
        if (isAnimating || e.button !== 0) return;
        isPointerDown = true;
        startX = e.clientX;
        startY = e.clientY;
        diffX = 0;
        diffY = 0;
        isHorizontalSwipe = false;
        try {
            heroCover.setPointerCapture(e.pointerId);
        } catch (err) {}
    }, { passive: true });

    heroCover.addEventListener('pointermove', (e) => {
        if (!isPointerDown) return;
        diffX = e.clientX - startX;
        diffY = e.clientY - startY;

        if (!isHorizontalSwipe) {
            if (Math.abs(diffX) > 8 && Math.abs(diffX) > Math.abs(diffY)) {
                isHorizontalSwipe = true;
            }
        }

        if (isHorizontalSwipe) {
            const currentCard = stage.querySelector('.busan-scene-card:not(.is-sliding-in)');
            if (currentCard) {
                currentCard.style.transform = `translate3d(${diffX * 0.35}px, 0, 0)`;
            }
        }
    }, { passive: true });

    const handlePointerEnd = (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        try {
            if (heroCover.hasPointerCapture(e.pointerId)) {
                heroCover.releasePointerCapture(e.pointerId);
            }
        } catch (err) {}

        const currentCard = stage.querySelector('.busan-scene-card:not(.is-sliding-in)');
        if (currentCard && !isAnimating) {
            currentCard.style.transition = 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
            currentCard.style.transform = 'translate3d(0, 0, 0)';
            setTimeout(() => {
                if (currentCard) currentCard.style.transition = '';
            }, 220);
        }

        if (isHorizontalSwipe && Math.abs(diffX) >= 38) {
            if (diffX < 0) {
                switchScene(1); // Swipe Left -> Next
            } else {
                switchScene(-1); // Swipe Right -> Prev
            }
        }
    };

    heroCover.addEventListener('pointerup', handlePointerEnd, { passive: true });
    heroCover.addEventListener('pointercancel', handlePointerEnd, { passive: true });

    // 키보드 좌우 방향키 탐색 지원
    heroCover.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            switchScene(1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            switchScene(-1);
        }
    });

    // 힌트 화살표 클릭 지원
    const btnPrev = heroCover.querySelector('.swipe-arrow-left');
    const btnNext = heroCover.querySelector('.swipe-arrow-right');
    btnPrev?.addEventListener('click', (e) => {
        e.stopPropagation();
        switchScene(-1);
    });
    btnNext?.addEventListener('click', (e) => {
        e.stopPropagation();
        switchScene(1);
    });
}

// 앱 시작 및 인트로-데이터 병렬 실행 제어
function initApp() {
    const sceneKey = chooseRandomBusanScene();
    document.documentElement.dataset.sceneTheme = sceneKey;
    initTimeTheme();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const performanceMode = document.documentElement.dataset.performance || 'full';
    const litePerformance = performanceMode === 'lite';
    const balancedPerformance = performanceMode === 'balanced';

    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.classList.add('is-intro');
        document.body.classList.add('is-intro');
    }

    // 1. 인트로 오버레이 즉시 생성 (0ms 진입)
    const cinematicIntro = reduceMotion ? null : createCinematicIntro(sceneKey);

    // 2. 데이터 가져오기 병렬 시작
    const dataPromise = loadEventDataPromise(sceneKey);

    function revealPage() {
        if (!appContainer) return;
        appContainer.classList.remove('is-intro');
        appContainer.classList.add('is-ready');
    }

    if (reduceMotion || !cinematicIntro || !appContainer) {
        dataPromise.then(() => {
            revealPage();
            cinematicIntro?.remove();
            document.body.classList.remove('is-intro');
        });
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

    // 화면 터치 시 즉각 본문 전환 (100ms 반응)
    function handleUserSkip() {
        if (introFinished || skipInProgress || !cinematicIntro.isConnected) return;
        skipInProgress = true;
        cinematicIntro.dataset.cancelled = 'true';
        cinematicIntro.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
        const mapWorld = cinematicIntro.querySelector('.busan-map-world');
        if (mapWorld) mapWorld.style.opacity = '1';

        dataPromise.then(() => {
            revealPage();
            const bridgeTarget = document.querySelector('.hero-cover .bridge-illustration-card');
            collapseCinematicIntro(cinematicIntro, bridgeTarget, litePerformance ? 80 : 110)
                .finally(finishIntro);
        });
    }

    window.addEventListener('pointerdown', handleUserSkip, { once: true, passive: true });

    // 지도 줌인과 데이터 준비를 동시에 진행
    Promise.all([
        playBusanMapIntro(cinematicIntro, sceneKey, performanceMode),
        dataPromise
    ]).then(() => {
        if (cinematicIntro.dataset.cancelled === 'true' || !cinematicIntro.isConnected) return;
        revealPage();
        const bridgeTarget = document.querySelector('.hero-cover .bridge-illustration-card');
        return collapseCinematicIntro(
            cinematicIntro,
            bridgeTarget,
            litePerformance ? 220 : balancedPerformance ? 280 : 320
        );
    }).finally(() => {
        if (!skipInProgress) finishIntro();
    });
}
