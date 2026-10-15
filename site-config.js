/* Shared content rules for the visitor page and its editor. */
const SiteConfig = (() => {
    const defaults = {
        eventEnabled: true, closedMessage: '현재 행사가 종료되었습니다. 다음 행사를 기다려 주세요.',
        intro: true, gallery: true, randomScene: true, scene: 'gwangan',
        animation: true, weather: true, season: true, autoCoupons: true, autoWeather: true,
        heroTitle: 'EVENT GUIDE', overline: 'EVENT GUIDE / 이용 안내',
        emptyMessage: '현재 진행 중인 사은 혜택이 없습니다.'
    };
    const settings = data => ({...defaults, ...data?.settings});
    function offers(gift = {}) {
        if (Array.isArray(gift.offers)) return gift.offers;
        return [['primaryOffer', 'monthly'], ['secondaryOffer', 'sports']]
            .filter(([key]) => gift[key]).map(([key, source]) => ({
                id: source, source, enabled: true, ...gift[key]
            }));
    }
    function today(date = new Date()) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
        }).formatToParts(date);
        return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type).value).join('-');
    }
    function status(offer, date = new Date()) {
        if (offer.enabled === false) return '사용 안 함';
        if (!offer.title || !offer.link) return '내용 미완성';
        const day = today(date);
        if (offer.validFrom && day < offer.validFrom) return '예약';
        if (offer.validUntil && day > offer.validUntil) return '종료';
        return '진행 중';
    }
    function safeLink(value) {
        if (!value) return '';
        try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
        catch { return ''; }
    }
    function imageSource(value) {
        if (safeLink(value)) return value;
        return /^media\/[a-zA-Z0-9_./%-]+$/.test(value || '') && !value.includes('..') ? value : '';
    }
    function couponMode(offer) {
        return ['monthly', 'sports'].includes(offer.source) && !offer.manualOverride ? 'auto' : 'manual';
    }
    // Merge unrelated concurrent changes; conflicting fields never overwrite silently.
    function merge(base, local, remote, path = 'data') {
        const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        if (same(local, base)) return remote;
        if (same(remote, base) || same(local, remote)) return local;
        if ([base, local, remote].every(v => v && !Array.isArray(v) && typeof v === 'object')) {
            const result = {};
            for (const key of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
                const value = merge(base[key], local[key], remote[key], `${path}.${key}`);
                if (value !== undefined) result[key] = value;
            }
            return result;
        }
        if ([base, local, remote].every(v => Array.isArray(v) && v.every(x => x && typeof x.id === 'string'))) {
            const ids = list => list.map(x => x.id);
            const baseOrder = ids(base), localOrder = ids(local), remoteOrder = ids(remote);
            const order = same(localOrder, baseOrder) ? remoteOrder : same(remoteOrder, baseOrder) || same(localOrder, remoteOrder)
                ? localOrder : null;
            if (!order) throw new Error(`동시에 목록 순서가 변경되었습니다 (${path}). 입력 내용은 유지됩니다. 초안을 내려받고 최신 내용을 확인해 주세요.`);
            const merged = new Map([...new Set([...baseOrder, ...localOrder, ...remoteOrder])].map(id => [id,
                merge(base.find(x => x.id === id), local.find(x => x.id === id), remote.find(x => x.id === id), `${path}.${id}`)]));
            return order.map(id => merged.get(id)).filter(x => x !== undefined);
        }
        throw new Error(`같은 항목이 다른 곳에서도 수정되었습니다 (${path}). 입력 내용은 유지됩니다. 초안을 내려받고 최신 내용을 확인해 주세요.`);
    }
    return {defaults, settings, offers, today, status, safeLink, imageSource, couponMode, merge};
})();

// A preview receives only draft content, never authentication information.
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('adminPreview') === '1' && window.parent !== window) {
    window.__eventDataPromise = new Promise(resolve => {
        window.addEventListener('message', event => {
            if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'event-guide-preview') return;
            const data = event.data.data;
            if (!data || !Array.isArray(data.steps)) return;
            resolve({ok: true, json: async () => data});
        });
    });
}
