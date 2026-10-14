const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({
    Intl, Date,
    document: { addEventListener() {} }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8'), context);
const monthly = { validFrom: '2026-11-01', validUntil: '2026-11-30' };
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-10-31T14:59:59Z')), false);
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-10-31T15:00:00Z')), true);
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-11-30T14:59:59Z')), true);
assert.equal(context.isGiftOfferActive(monthly, new Date('2026-11-30T15:00:00Z')), false);
assert.equal(context.isGiftOfferActive({}, new Date()), true); // Legacy manual offers.
assert.equal(context.escapeCouponHtml('<img src=x onerror="x">'), '&lt;img src=x onerror=&quot;x&quot;&gt;');

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
console.log('Coupon visibility, Korean midnight boundaries, and HTML escaping passed.');
