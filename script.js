document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

const TIME_THEMES = {
    morning: {
        label: '아침',
        themeColor: '#F6C98D'
    },
    day: {
        label: '낮',
        themeColor: '#2474E8'
    },
    sunset: {
        label: '해질녘',
        themeColor: '#D95462'
    },
    night: {
        label: '밤',
        themeColor: '#07091A'
    }
};

function resolveTimeTheme(date = new Date()) {
    const forcedTheme = new URLSearchParams(window.location.search).get('theme');
    if (forcedTheme && TIME_THEMES[forcedTheme]) return forcedTheme;

    const hour = Number(new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Seoul', hour: '2-digit', hourCycle: 'h23'
    }).format(date));
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
        timeZone: 'Asia/Seoul',
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
    if (typeof SceneEnvironment !== 'undefined') SceneEnvironment.apply(now);
    refreshGiftOfferVisibility(now);
}

function escapeCouponHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function isGiftOfferActive(offer, date = new Date()) {
    if (offer.enabled === false) return false;
    // Coupon periods use Korean calendar dates, regardless of the visitor's timezone.
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type).value;
    const today = `${get('year')}-${get('month')}-${get('day')}`;
    return (!offer.validFrom || today >= offer.validFrom)
        && (!offer.validUntil || today <= offer.validUntil);
}

function refreshGiftOfferVisibility(date = new Date()) {
    document.querySelectorAll('.gift-offer-list').forEach((list) => {
        const rows = [...list.querySelectorAll('.gift-offer-row')];
        rows.forEach((row) => { row.hidden = !isGiftOfferActive(row.dataset, date); });
        const count = rows.filter((row) => !row.hidden).length;
        list.classList.toggle('is-single', count === 1);
        list.classList.toggle('is-double', count > 1);
        const empty = list.querySelector('.gift-offer-empty');
        if (empty) empty.hidden = count > 0;
    });
}

function initTimeTheme() {
    applyTimeTheme();
    window.setInterval(applyTimeTheme, 60 * 1000);
}

function getCurrentDateDisplay(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type).value;
    const year = get('year');
    const month = get('month');
    const day = get('day');
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Seoul' })
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
const BUSAN_SCENES = {
    gwangan: true,
    gamcheon: true,
    nurimaru: true,
    huinnyeoul: true,
    jagalchi: true,
    haeundae: true,
    busanTower: true,
    cinemaCenter: true,
    beomeosa: true,
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
    seomyeon: {
        name: 'SEOMYEON CITY',
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
    seomyeon: { x: 500, y: 580 },
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
    const settings = SiteConfig.settings(window.__siteData);
    if (!settings.randomScene && BUSAN_SCENES[settings.scene]) return settings.scene;

    // 한 장소가 연속으로 뽑히지 않고, 열 곳을 모두 본 뒤 다시 섞습니다.
    try {
        const bagKey = 'busan-scene-bag-v5';
        const lastKey = 'busan-scene-last-v5';
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

function createBusanMapLandmarkArtwork(sceneKey) {
    return LandmarkArt[sceneKey]?.map() || LandmarkArt.gwangan.map();
}

function createPixelUiIcon(kind) {
    const sprites = {
        phone: [[5,2,6,1],[4,3,1,10],[11,3,1,10],[5,13,6,1],[6,4,4,6],[7,11,2,1]],
        chat: [[3,3,10,1],[2,4,1,6],[13,4,1,6],[3,10,10,1],[3,11,2,2],[5,11,2,1],[5,6,1,1],[7,6,1,1],[9,6,1,1]],
        gift: [[2,6,12,1],[2,7,1,2],[13,7,1,2],[3,9,10,1],[3,10,1,4],[12,10,1,4],[4,13,8,1],[7,6,2,8],[4,3,3,1],[3,4,1,2],[4,5,3,1],[9,3,3,1],[12,4,1,2],[9,5,3,1],[7,4,2,2]],
        arrow: [[2,7,10,2],[8,3,2,2],[10,5,2,2],[12,7,2,2],[10,9,2,2],[8,11,2,2]]
    };
    if (kind === 'smile') {
        return '<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="#22201f" d="M4 1H12V2H14V4H15V12H14V14H12V15H4V14H2V12H1V4H2V2H4Z"/><path fill="#ddff69" d="M4 2H12V3H13V4H14V12H13V13H12V14H4V13H3V12H2V4H3V3H4Z"/><path fill="#22201f" d="M5 5h2v2H5ZM9 5h2v2H9ZM4 9h2v2H4ZM6 11h4v1H6ZM10 9h2v2H10Z"/></svg>';
    }
    const cells = sprites[kind] || sprites.arrow;
    return `<svg class="pixel-ui-icon" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${cells.map(([x,y,w,h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</svg>`;
}

function createPixelEventTitle() {
    const title = SiteConfig.settings(window.__siteData).heroTitle;
    if (title !== 'EVENT GUIDE') return `<span class="custom-hero-title">${escapeCouponHtml(title)}</span>`;
    const glyphs = {
        E:['11111','10000','10000','11110','10000','10000','11111'],
        V:['10001','10001','10001','10001','10001','01010','00100'],
        N:['10001','11001','11001','10101','10011','10011','10001'],
        T:['11111','00100','00100','00100','00100','00100','00100'],
        G:['01111','10000','10000','10111','10001','10001','01111'],
        U:['10001','10001','10001','10001','10001','10001','01110'],
        I:['11111','00100','00100','00100','00100','00100','11111'],
        D:['11110','10001','10001','10001','10001','10001','11110']
    };
    const rows = ['EVENT','GUIDE'].map((word,row) => {
        const cells = [...word].flatMap((letter,column) => glyphs[letter].flatMap((line,y) =>
            [...line].flatMap((cell,x) => cell === '1' ? [`M${column*6+x} ${row*9+y}h1v1h-1Z`] : [])
        )).join('');
        return `<path fill="${row ? '#7956e7' : '#22201f'}" d="${cells}"/>`;
    }).join('');
    return `<svg class="pixel-event-title" viewBox="-1 -1 31 18" role="img" aria-label="EVENT GUIDE" shape-rendering="crispEdges"><g stroke="#fff9ec" stroke-width=".7" stroke-linejoin="miter" paint-order="stroke fill">${rows}</g></svg>`;
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
            <path class="map-focus-ring" d="M-58-58H58V-50H66V50H58V58H-58V50H-66V-50H-58Z"/>
            <path class="map-landmark-badge" d="M-50-50H50V-42H58V42H50V50H-50V42H-58V-42H-50Z"/>
            <g class="map-landmark-motion">
                <g class="map-landmark-art" transform="scale(0.5)">
                    <rect class="map-landmark-shadow" x="-88" y="61" width="176" height="8"/>
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
    const redesign = LandmarkArt[safeSceneKey];
    const sceneHeight = redesign.height;

    return `
    <div class="bridge-illustration-card busan-scene-card scene-${safeSceneKey}" data-scene="${safeSceneKey}">
        <svg class="gwangan-bridge-svg busan-scene-svg" viewBox="${redesign.viewBox}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            ${redesign.render()}
            ${typeof SceneEnvironment !== 'undefined' ? SceneEnvironment.createSeasonSvg(redesign?.width || 400, sceneHeight) + SceneEnvironment.createWeatherSvg(redesign?.width || 400, sceneHeight) : ''}
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
        <div class="intro-copy">
            <span class="intro-eyebrow">EVENT GUIDE</span>
            <strong class="intro-headline">사은<br><em>행사 안내</em></strong>
            <span class="intro-sticker">MONTHLY<br>GUIDE ✳</span>
        </div>
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
        <svg class="intro-environment-art" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${typeof SceneEnvironment !== 'undefined' ? SceneEnvironment.createSeasonSvg() + SceneEnvironment.createWeatherSvg() : ''}</svg>
        <div class="intro-bottom"><span>사은 행사 안내</span><span>터치하거나 Enter를 눌러 시작 ↗</span></div>
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
    await waitForIntro(litePerformance ? 250 : balancedPerformance ? 400 : 500);
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
    const zoomDuration = litePerformance ? 350 : balancedPerformance ? 500 : 600;

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

let sceneVisibilityObserver = null;
let sceneVisibilityListenerInstalled = false;
function initSceneVisibilityOptimization() {
    const sceneCards = [...document.querySelectorAll('.hero-cover .busan-scene-card')];
    if (sceneCards.length === 0) return;

    const syncDocumentVisibility = () => {
        document.querySelectorAll('.hero-cover .busan-scene-card').forEach((card) => {
            card.classList.toggle('is-document-hidden', document.hidden);
        });
    };

    if (!sceneVisibilityListenerInstalled) {
        document.addEventListener('visibilitychange', syncDocumentVisibility, { passive: true });
        sceneVisibilityListenerInstalled = true;
    }
    syncDocumentVisibility();

    if (!('IntersectionObserver' in window)) return;

    sceneVisibilityObserver?.disconnect();
    sceneVisibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle('is-scene-paused', !entry.isIntersecting);
        });
    }, { rootMargin: '80px 0px', threshold: 0.01 });

    sceneCards.forEach((card) => sceneVisibilityObserver.observe(card));
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
    const settings = SiteConfig.settings(data);
    document.title = data.pageTitle;
    const currentDate = getCurrentDateDisplay();

    // 헤더 영역 렌더링
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="hero-cover" id="hero-cover-swipe" tabindex="0" role="region" aria-label="부산 랜드마크 갤러리 (좌우로 스와이프하여 탐색)">
                <div class="hero-collage-copy">${createPixelEventTitle()}</div>
                <span class="hero-smile" aria-hidden="true">${createPixelUiIcon('smile')}</span>
                <div class="hero-scene-viewport">
                    <div class="hero-scene-stage" id="hero-scene-stage">
                        ${createBusanSceneIllustrationSvg(sceneKey, 'Header')}
                    </div>
                </div>
                <div class="hero-swipe-hint" aria-label="랜드마크 넘기기">
                    <button class="swipe-arrow-btn swipe-arrow-left" type="button" aria-label="이전 랜드마크">${createPixelUiIcon('arrow')}</button>
                    <span class="swipe-counter"><strong id="hero-scene-counter-current">01</strong> / <span id="hero-scene-counter-total">${Object.keys(BUSAN_SCENES).length}</span></span>
                    <button class="swipe-arrow-btn swipe-arrow-right" type="button" aria-label="다음 랜드마크">${createPixelUiIcon('arrow')}</button>
                </div>
                <div class="hero-toolbar">
                    <span class="hero-brand">
                        <span class="brand-spark" aria-hidden="true">✦</span>
                        <time datetime="${currentDate.iso}">${currentDate.label}</time>
                    </span>
                    <span class="time-chip" aria-label="현재 시간대 테마">
                        <span class="time-dot" aria-hidden="true"></span>
                        <span id="time-period-label">부산 시간</span>
                        <span class="time-divider" aria-hidden="true"></span>
                        <time id="time-label">--:--</time>
                    </span>
                </div>
            </div>
            <div class="header-content">
                <span class="title-overline">${escapeCouponHtml(settings.overline)}</span>
                <div class="title-row">
                    <h1 class="festival-title">${escapeCouponHtml(data.headerTitle)}</h1>
                    <span class="title-kitsch-mark" aria-hidden="true">✳</span>
                </div>
                <p class="festival-subtitle">${escapeCouponHtml(data.subtitle)}</p>
            </div>
            <div class="club-strip" aria-hidden="true"><span>앱 설치 ↗</span><span>채널 추가 ↗</span><span>혜택 확인 ✳</span></div>
        `;
        applyTimeTheme();
        initHeroSwipeCarousel(sceneKey);
    }

    // 스텝 카드 영역 렌더링
    const stepContainer = document.getElementById('step-container');
    if (stepContainer) {
        const userOS = getMobileOS();
        const stepFragment = document.createDocumentFragment();

        const stepsToRender = (settings.eventEnabled ? [...(data.steps || []), data.giftStep].filter(Boolean) : [])
            .filter(step => step.enabled !== false)
            .sort((a,b) => (a.order ?? ({step1:1,step2:2,step3:3}[a.id])) - (b.order ?? ({step1:1,step2:2,step3:3}[b.id])));

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

            const isGiftStep = step.id === 'step3';
            if (isGiftStep) stepElement.classList.add('gift-step-card');

            const visibleGiftOffers = isGiftStep
                ? SiteConfig.offers(step).filter(offer => offer.enabled !== false && offer?.title && SiteConfig.safeLink(offer.link))
                : [];

            const actionMarkup = isGiftStep
                ? `
                    <div class="gift-offer-list ${visibleGiftOffers.length === 1 ? 'is-single' : 'is-double'}">
                        ${visibleGiftOffers.map((offer, offerIndex) => `
                            <article class="gift-offer-row" data-offer-number="${String(offerIndex + 1).padStart(2, '0')}" data-valid-from="${escapeCouponHtml(offer.validFrom)}" data-valid-until="${escapeCouponHtml(offer.validUntil)}" ${isGiftOfferActive(offer) ? '' : 'hidden'}>
                                <div class="gift-offer-copy">
                                    <span class="gift-offer-label">
                                        <strong>${String(offerIndex + 1).padStart(2, '0')}</strong>
                                        <span>GIFT BENEFIT</span>
                                    </span>
                                    <h3>${escapeCouponHtml(offer.title)}</h3>
                                    ${offer.validFrom || offer.validUntil ? `<p class="gift-offer-period">${escapeCouponHtml(offer.validFrom || '상시')} ~ ${escapeCouponHtml(offer.validUntil || '종료일 없음')}</p>` : ''}
                                    ${offer.description ? `<p class="gift-offer-description">${escapeCouponHtml(offer.description)}</p>` : ''}
                                </div>
                                <a href="${escapeCouponHtml(offer.link)}" class="gift-offer-link" target="${step.target || '_blank'}" rel="noopener noreferrer" aria-label="${escapeCouponHtml(offer.title)}: ${escapeCouponHtml(offer.buttonText || '바로가기')}">
                                    <span>${escapeCouponHtml(offer.buttonText || '바로가기')}</span>
                                    ${createPixelUiIcon('arrow')}
                                </a>
                            </article>
                        `).join('')}
                        <p class="gift-offer-empty" hidden>${escapeCouponHtml(settings.emptyMessage)}</p>
                    </div>
                `
                : `
                    <div class="card-action">
                        <a href="${escapeCouponHtml(SiteConfig.safeLink(finalLink) || '#')}" class="btn-action" target="_blank" rel="noopener noreferrer" aria-label="${escapeCouponHtml(step.title)}: ${escapeCouponHtml(step.buttonText)}">
                            <span class="btn-label">${escapeCouponHtml(step.buttonText)}</span>
                            <span class="btn-icon" aria-hidden="true">
                                ${createPixelUiIcon('arrow')}
                            </span>
                        </a>
                    </div>
                `;

            stepElement.innerHTML = `
                <div class="card-glow-bg"></div>
                <div class="card-header-row">
                    <span class="step-num-pill">${escapeCouponHtml(step.stepNum || `STEP 0${index + 1}`)}</span>
                    <div class="card-meta-right">
                        ${osBadgeText}
                        <span class="card-tagline">${escapeCouponHtml(step.tagline || `SPECIAL 0${index + 1}`)}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="icon-avatar">
                        <div class="icon-pulse"></div>
                        <div class="icon-inner">
                            ${createPixelUiIcon(step.id === 'step1' ? 'phone' : step.id === 'step2' ? 'chat' : 'gift')}
                        </div>
                    </div>
                    <div class="card-text-group">
                        <h2 class="step-heading">${escapeCouponHtml(step.title)}</h2>
                        <p class="step-desc">${escapeCouponHtml(step.description)}</p>
                    </div>
                </div>
                ${actionMarkup}
            `;

            stepFragment.appendChild(stepElement);
        });

        if (!settings.eventEnabled) {
            const notice = document.createElement('p');
            notice.className = 'event-closed-message';
            notice.textContent = settings.closedMessage;
            stepFragment.appendChild(notice);
        }
        stepContainer.replaceChildren(stepFragment);
    }

    const banner = document.getElementById('footer-banner');
    if (banner) {
        const config = data.footerBanner || {};
        const source = config.enabled && SiteConfig.imageSource(config.image);
        const link = SiteConfig.safeLink(config.link);
        banner.hidden = !source;
        const artwork = source ? `<img src="${escapeCouponHtml(source)}" alt="${escapeCouponHtml(config.alt || '행사 안내 이미지')}" width="1200" height="600" loading="lazy" decoding="async">` : '';
        banner.innerHTML = link && source ? `<a href="${escapeCouponHtml(link)}" target="_blank" rel="noopener noreferrer">${artwork}</a>` : artwork;
    }
    initSceneVisibilityOptimization();
    refreshGiftOfferVisibility();
}

// 상단 랜드마크 일러스트 좌우 스와이프 제어
function initHeroSwipeCarousel(initialSceneKey) {
    if (!SiteConfig.settings(window.__siteData).gallery) return;
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

        const duration = !SiteConfig.settings(window.__siteData).animation || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320;
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
        if (e.target.closest('button, a')) return;
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
async function initApp() {
    try {
        const response = await (window.__eventDataPromise || fetch('data.json', {cache: 'no-cache'}));
        if (!response.ok) throw new Error('데이터를 읽지 못했습니다.');
        window.__siteData = await response.json();
        window.__eventDataPromise = Promise.resolve({ok:true, json: async () => window.__siteData});
    } catch (error) {
        document.querySelector('.app-container')?.classList.remove('is-intro');
        document.querySelector('.app-container')?.classList.add('is-ready');
        document.body.classList.remove('is-intro');
        const header = document.getElementById('header-container');
        if (header) header.innerHTML = '<p>데이터를 불러오지 못했습니다.</p><button onclick="location.reload()">다시 시도</button>';
        return;
    }
    const settings = SiteConfig.settings(window.__siteData);
    const root = document.documentElement;
    root.dataset.animation = settings.animation ? 'on' : 'off';
    root.dataset.gallery = settings.gallery ? 'on' : 'off';
    root.dataset.weatherEffect = settings.weather ? 'on' : 'off';
    root.dataset.seasonEffect = settings.season ? 'on' : 'off';
    const sceneKey = chooseRandomBusanScene();
    document.documentElement.dataset.sceneTheme = sceneKey;
    if (typeof SceneEnvironment !== 'undefined') SceneEnvironment.init();
    initTimeTheme();

    const reduceMotion = !settings.intro || !settings.animation || !settings.eventEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        window.removeEventListener('keydown', handleKeyboardSkip);
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
    function handleKeyboardSkip(event) {
        if (event.key === 'Enter' || event.key === 'Escape') handleUserSkip();
    }
    window.addEventListener('keydown', handleKeyboardSkip);

    // Design preview: keep the intro open until a touch/Enter, without changing normal entry.
    if (new URLSearchParams(window.location.search).get('intro') === 'preview') return;

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
