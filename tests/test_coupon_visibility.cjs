const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({
    Intl, Date, URL,
    document: { addEventListener() {} }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../site-config.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8'), context);
const monthly = { validFrom: '2026-11-01', validUntil: '2026-11-30' };
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-10-31T14:59:59Z')), false);
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-10-31T15:00:00Z')), true);
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-11-30T14:59:59Z')), true);
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-11-30T15:00:00Z')), false);
assert.equal(context.isGiftOfferActive({}, new Date()), true); // Legacy manual offers.
assert.equal(context.isGiftOfferActive({validFrom: '2026-11-01'}, new Date('2026-10-31T15:00:00Z')), true);
assert.equal(context.isGiftOfferActive({validUntil: '2026-11-01'}, new Date('2026-11-01T15:00:00Z')), false);
assert.equal(context.escapeCouponHtml('<img src=x onerror="x">'), '&lt;img src=x onerror=&quot;x&quot;&gt;');
const periodOffer = {validFrom:'2026-10-01', validUntil:'2026-10-31'};
assert.equal(context.couponDescription({...periodOffer, description:'사용기한 : 10.1(목) - 10.31(토)'}), '');
assert.equal(context.couponDescription({...periodOffer, description:'기간 : 2026.10.09~2026.10.11\n\n참여브랜드를 확인하세요.'}), '참여브랜드를 확인하세요.');
assert.equal(context.couponDescription({...periodOffer, description:'2026-10-01 ~ 2026-10-31'}), '');
assert.equal(context.couponDescription({...periodOffer, description:'기간 : 2026년 10월 1일 ~ 2026년 10월 31일'}), '');
assert.equal(context.couponDescription({...periodOffer, description:'10.9~10.11 일부 브랜드 제외'}), '10.9~10.11 일부 브랜드 제외');
assert.equal(context.couponDescription({description:'사용기한 : 10.1(목) - 10.31(토)'}), '사용기한 : 10.1(목) - 10.31(토)');

const rows = [
    { dataset: monthly },
    { dataset: { validFrom: '2026-10-09', validUntil: '2026-10-11' } }
];
const empty = { hidden: true };
const classes = {};
context.document.querySelectorAll = () => [{
    querySelectorAll: () => rows,
    querySelector: () => empty,
    classList: { toggle: (name, value) => { classes[name] = value; } }
}];
context.refreshGiftOfferVisibility(new Date('2026-11-01T00:00:00Z'));
assert.equal(rows[0].hidden, false);
assert.equal(rows[1].hidden, true);
assert.equal(classes['is-single'], true);
assert.equal(empty.hidden, true);
context.refreshGiftOfferVisibility(new Date('2026-12-01T00:00:00Z'));
assert.equal(rows[0].hidden, true);
assert.equal(empty.hidden, false);
// Legacy showSecondOffer=false must no longer suppress a scheduled second coupon.
const rendered = [];
context.window = {};
context.navigator = {userAgent: ''};
context.document.getElementById = id => id === 'step-container'
    ? {replaceChildren() {}} : null;
context.document.querySelectorAll = () => [];
context.document.createDocumentFragment = () => ({appendChild: element => rendered.push(element.innerHTML)});
context.document.createElement = () => ({style: {setProperty() {}}, dataset: {}, classList: {add() {}}});
context.renderPageContent({steps: [], giftStep: {
    id: 'step3', showSecondOffer: false,
    primaryOffer: {title: 'first', link: 'https://example.com/first'},
    secondaryOffer: {title: 'second', link: 'https://example.com/second', ...monthly}
}}, 'gwangan');
assert.match(rendered[0], /https:\/\/example.com\/second/);
assert.match(rendered[0], /data-valid-from="2026-11-01" data-valid-until="2026-11-30"/);
console.log('Coupon periods, Korean midnight boundaries, second-coupon rendering, and HTML escaping passed.');
