const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const storage = new Map();
const root = { dataset: {} };
const label = {};
const context = vm.createContext({Intl, Date, URLSearchParams, AbortController,
    window: { location: {search: ''}, matchMedia: () => ({matches: false}),
        localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)} },
    document: {addEventListener() {}, documentElement: root,
        querySelectorAll: selector => selector === '[data-environment-label]' ? [label] : []}
});
for (const file of ['environment.js', 'landmark-art.js', 'script.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const environment = vm.runInContext('SceneEnvironment', context);
assert.match(context.createBusanSceneIllustrationSvg('gwangan'), /pixel-art px-gwangan/);
assert.match(context.createBusanSceneIllustrationSvg('gwangan'), /viewBox="0 0 160 120"/);
assert.match(context.createBusanMapLandmarkArtwork('gwangan'), /map-pixel-art px-gwangan/);
const scenes = vm.runInContext('Object.keys(BUSAN_SCENES)', context);
assert.equal(scenes.length, 10);
assert.equal(vm.runInContext('BUSAN_MAP_SCENES.length', context), 10);
assert.equal(scenes.includes('seomyeon'), false);
assert.equal(context.resolveTimeTheme(new Date('2026-10-14T16:00:00Z')), 'night');
assert.equal(context.getCurrentDateDisplay(new Date('2026-10-14T16:00:00Z')).iso, '2026-10-15');
assert.equal(environment.seasonAt(new Date('2026-02-28T14:59:59Z')), 'winter');
assert.equal(environment.seasonAt(new Date('2026-02-28T15:00:00Z')), 'spring');
assert.equal(environment.seasonAt(new Date('2026-05-31T15:00:00Z')), 'summer');
assert.equal(environment.seasonAt(new Date('2026-08-31T15:00:00Z')), 'autumn');
assert.equal(environment.seasonAt(new Date('2026-11-30T15:00:00Z')), 'winter');
const now = new Date('2026-10-14T07:20:00Z');
const snapshot = {observedAt:'2026-10-14T15:00:00+09:00', condition:'rain', windSpeed:6, temperature:19};
let state = environment.stateAt(now, snapshot, '');
assert.equal(state.weather, 'rain');
assert.equal(state.wind, true);
assert.equal(state.season, 'autumn');
assert.equal(environment.stateAt(new Date('2026-10-14T11:00:00Z'), snapshot, '').weather, 'unknown');
assert.equal(environment.stateAt(now, null, '').weather, 'unknown');
assert.equal(environment.stateAt(now, snapshot, '?weather=snow&season=winter').weather, 'snow');
assert.equal(environment.stateAt(now, snapshot, '?weather=invalid&season=invalid').weather, 'rain');
for (const scene of scenes) {
    const svg = context.createBusanSceneIllustrationSvg(scene, scene);
    const art = vm.runInContext(`LandmarkArt['${scene}'].render()`, context);
    assert.match(art, /shape-rendering="crispEdges"/);
    assert.doesNotMatch(art, /<image|<circle|<ellipse/);
    for (const pixelPath of art.matchAll(/<path fill="[^"]+" d="([^"]+)"/g)) {
        assert.doesNotMatch(pixelPath[1], /[CQASTL.]/i);
        assert.match(pixelPath[1], /^M-?\d+ -?\d+h\d+v\d+h-\d+Z/);
    }
    const walkers = (art.match(/class="px-person"/g) || []).length;
    if (walkers) assert.ok(walkers >= 3, `${scene} needs several pedestrians`);
    assert.doesNotMatch(art, /NaN|Infinity/);
    for (const season of ['spring','summer','autumn','winter']) {
        assert.match(art, new RegExp(`class="px-season-${season}"`));
    }
    for (const rect of art.matchAll(/<rect ([^>]+)/g)) {
        for (const coordinate of rect[1].matchAll(/(?:x|y|width|height)="([^"]+)"/g)) {
            assert.equal(Number.isInteger(Number(coordinate[1])), true);
        }
    }
    assert.match(svg, new RegExp(`data-scene="${scene}"`));
    assert.match(svg, /weather-rain/);
    assert.match(svg, /season-autumn-leaves/);
    assert.doesNotMatch(svg, /undefined|LOTTE|부산본점/);
}
assert.equal((context.createBusanMapIntroSvg('gwangan').match(/data-map-scene=/g) || []).length, 10);
const drawn = Array.from({length:10}, () => context.chooseRandomBusanScene());
assert.equal(new Set(drawn).size, 10);
assert.notEqual(context.chooseRandomBusanScene(), drawn[9]);
environment.apply(now);
assert.equal(root.dataset.season, 'autumn');
assert.equal(root.dataset.weather, 'unknown');
assert.match(label.textContent, /부전동 기준/);
console.log('Ten scenes, KST midnight, four seasons, fresh/stale weather, preview and SVG layers passed.');
