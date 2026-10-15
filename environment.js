/* One shared climate for every illustration: Busan Bujeon-dong, Asia/Seoul. */
const SceneEnvironment = (() => {
    const seasons = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
    const weatherLabels = { clear: '맑음', cloudy: '구름 많음', overcast: '흐림',
        rain: '비', snow: '눈', sleet: '비·눈', storm: '뇌우', unknown: '날씨 정보 없음' };
    let snapshot = null;
    let fetching = false;
    let started = false;

    function seasonAt(date) {
        const month = Number(new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Seoul', month: 'numeric'
        }).format(date));
        return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer'
            : month >= 9 && month <= 11 ? 'autumn' : 'winter';
    }

    function stateAt(date = new Date(), data = snapshot, search = window.location.search) {
        const params = new URLSearchParams(search);
        const forcedSeason = params.get('season');
        const forcedWeather = params.get('weather');
        const season = Object.hasOwn(seasons, forcedSeason) ? forcedSeason : seasonAt(date);
        const age = data?.observedAt ? date.getTime() - Date.parse(data.observedAt) : Infinity;
        const fresh = Number.isFinite(age) && age >= -60 * 60 * 1000 && age <= 3 * 60 * 60 * 1000;
        const validWeather = fresh && Object.hasOwn(weatherLabels, data?.condition);
        const weather = Object.hasOwn(weatherLabels, forcedWeather) ? forcedWeather
            : validWeather ? data.condition : 'unknown';
        const wind = params.get('wind') === 'strong' || (validWeather && data.windSpeed >= 5);
        const temperature = validWeather && Number.isFinite(data.temperature) ? data.temperature : null;
        return { season, weather, wind, temperature, fresh, preview: Boolean(forcedSeason || forcedWeather || params.has('wind')) };
    }

    function apply(date = new Date()) {
        const state = stateAt(date);
        const settings = typeof SiteConfig !== 'undefined' ? SiteConfig.settings(window.__siteData) : {};
        const root = document.documentElement;
        root.dataset.season = settings.season === false ? 'summer' : state.season;
        root.dataset.weather = settings.weather === false ? 'unknown' : state.weather;
        root.dataset.wind = settings.weather === false ? 'normal' : state.wind ? 'strong' : 'normal';
        const time = snapshot?.observedAt && state.fresh ? new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date(snapshot.observedAt)) : '';
        const label = `${state.preview ? '미리보기 · ' : ''}부전동 기준 · ${seasons[state.season]} · ${weatherLabels[state.weather]}`
            + (state.temperature !== null ? ` ${Math.round(state.temperature)}°C` : '')
            + (state.wind ? ' · 바람' : '') + (time && !state.preview ? ` · ${time} 기준` : '');
        document.querySelectorAll('[data-environment-label]').forEach((element) => { element.textContent = label; });
        document.querySelectorAll('.hero-brand time').forEach((element) => {
            const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(date);
            const get = (type) => parts.find((p) => p.type === type).value;
            const iso = `${get('year')}-${get('month')}-${get('day')}`;
            const weekday = new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Seoul', weekday: 'short'}).format(date).toUpperCase();
            element.dateTime = iso;
            element.textContent = `${iso.replaceAll('-', '.')} · ${weekday}`;
        });
        return state;
    }

    async function refresh() {
        if (fetching) return;
        fetching = true;
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch('weather.json', { cache: 'no-cache', credentials: 'same-origin', signal: controller.signal });
            if (!response.ok) throw new Error('Weather unavailable');
            const data = await response.json();
            if (data.location !== '부산 부전동' || data.timezone !== 'Asia/Seoul') throw new Error('Wrong weather location');
            snapshot = data;
        } catch (error) {
            // Retain a fresh snapshot on transient failure; stale data becomes unknown.
            console.warn('부전동 날씨를 갱신하지 못했습니다.');
        } finally {
            window.clearTimeout(timeout);
            fetching = false;
            apply();
        }
    }

    function init() {
        if (started) return;
        started = true;
        apply();
        refresh();
        window.setInterval(refresh, 15 * 60 * 1000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    }

    function createWeatherSvg(width = 400, height = 200) {
        // The same 160 × 120 pixel grid is scaled for the full-screen intro.
        const r = (x,y,w,h,fill,style='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${style}/>`;
        const rain = Array.from({length: 20}, (_,i) => r((i*31)%160,(i*23)%120,1,4,'var(--weather-rain)',`style="--particle-delay:${-i*.13}s"`)).join('');
        const snow = Array.from({length: 16}, (_,i) => r((i*31)%160,(i*19)%120,2,2,'#fffdf1',`style="--particle-delay:${-i*.37}s"`)).join('');
        const clouds = [4,63,123].map((x,i)=>r(x,14+i*6,29,5,'var(--weather-cloud)')+r(x+4,10+i*6,19,4,'var(--weather-cloud)')+r(x+9,8+i*6,9,2,'var(--weather-cloud)')).join('');
        return `<g shape-rendering="crispEdges" transform="scale(${width/160} ${height/120})">
            <g class="weather-clouds">${clouds}</g><g class="weather-rain">${rain}</g><g class="weather-snow">${snow}</g>
            <g class="weather-lightning">${r(111,30,5,10,'#fff490')+r(107,40,7,4,'#fff490')+r(111,44,3,8,'#fff490')}</g>
            <g class="weather-wind">${r(6,38,26,1,'#e3e8ee')+r(103,69,32,1,'#e3e8ee')+r(48,96,22,1,'#e3e8ee')}</g></g>`;
    }

    function createSeasonSvg(width = 400, height = 200) {
        const r=(x,y,w,h,c,style='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${style}/>`;
        const petals=Array.from({length:6},(_,i)=>{const x=12+i*27,y=18+(i%3)*22;return r(x,y,3,1,'#ff9abd')+r(x+1,y-1,1,3,'#ff9abd');}).join('');
        const leaves=Array.from({length:6},(_,i)=>r(12+i*27,18+(i%4)*22,3,2,'#f7a345',`style="--particle-delay:${-i*.55}s"`)).join('');
        return `<g shape-rendering="crispEdges" transform="scale(${width/160} ${height/120})">
            <g class="season-spring-petals">${petals}</g>
            <g class="season-summer-leaves">${r(0,114,9,3,'#54c99a')+r(151,114,9,3,'#54c99a')}</g>
            <g class="season-autumn-leaves">${leaves}</g>
            <g class="season-winter-branches">${r(0,118,12,2,'#fff0d6')+r(148,118,12,2,'#fff0d6')}</g></g>`;
    }
    return { init, apply, seasonAt, stateAt, createWeatherSvg, createSeasonSvg };
})();
