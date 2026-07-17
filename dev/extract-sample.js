// dev/extract-sample.js — يستخرج كائن DATA من index.html ويبني sample-data.json
// عينة 20-30 سهماً تغطي: التصنيفات السبعة، أسهماً بلا details، قطاعات متنوعة.
// الاستخدام: node dev/extract-sample.js
'use strict';
const fs = require('fs');
const path = require('path');
const { extractFromIndex } = require('./lib-extract');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'sample-data.json');

const data = extractFromIndex(path.join(ROOT, 'index.html'));
const stocks = data.stocks;

// إحصاء توزيع التصنيفات وحالات غياب details
const byClass = {};
const noDetails = [];
for (const s of stocks) {
  const cc = (s.investmentScore && s.investmentScore.classCode) || 'NO_SCORE';
  (byClass[cc] = byClass[cc] || []).push(s);
  if (!s.investmentScore || !s.investmentScore.details) noDetails.push(s);
}
console.log('إجمالي الأسهم:', stocks.length);
console.log('التوزيع:', Object.fromEntries(Object.entries(byClass).map(([k, v]) => [k, v.length])));
console.log('بلا details:', noDetails.length, '—', noDetails.map(s => s.symbol).join(', '));

// بناء العينة: حتى 4 أسهم من كل تصنيف بأقصى تنوع قطاعي + أسهم بلا sector (فخ فلتر القطاع)
const classOf = (s) => (s.investmentScore && s.investmentScore.classCode) || 'NO_SCORE';
const sectorOf = (s) => s.sector || '__بلا_قطاع__';
const picked = new Map();
const pick = (s) => {
  if (s && !picked.has(s.symbol) && picked.size < 30) { picked.set(s.symbol, s); return true; }
  return false;
};

// 1) أسهم بلا sector — يجب أن يواجهها فلتر القطاع محلياً قبل الإنتاج: حتى 4 متنوعة التصنيف
const sectorless = stocks.filter((s) => !s.sector);
console.log('بلا sector في البيانات الكاملة:', sectorless.length, '—',
  sectorless.map((s) => s.symbol + ':' + classOf(s)).join(', '));
{
  const seenClasses = new Set();
  for (const s of sectorless) {
    if ([...picked.values()].filter((x) => !x.sector).length >= 4) break;
    if (!seenClasses.has(classOf(s))) { pick(s); seenClasses.add(classOf(s)); }
  }
}

// 2) لكل تصنيف: أكمل حتى 4 — جولة أولى بقطاعات غير مكررة (مع احتساب المختارين مسبقاً)، ثم أكمل العدد
for (const [cc, list] of Object.entries(byClass)) {
  const chosen = () => [...picked.values()].filter((s) => classOf(s) === cc);
  const seen = new Set(chosen().map(sectorOf));
  const sorted = [...list].sort((a, b) =>
    ((b.investmentScore && b.investmentScore.total) || 0) - ((a.investmentScore && a.investmentScore.total) || 0));
  for (const s of sorted) {
    if (chosen().length >= 4) break;
    if (!seen.has(sectorOf(s)) && pick(s)) seen.add(sectorOf(s));
  }
  for (const s of sorted) {
    if (chosen().length >= 4) break;
    pick(s);
  }
}

const sample = { ...data, stocks: [...picked.values()] };
fs.writeFileSync(OUT, JSON.stringify(sample, null, 2), 'utf8');

const cover = {};
for (const s of picked.values()) {
  const cc = (s.investmentScore && s.investmentScore.classCode) || 'NO_SCORE';
  cover[cc] = (cover[cc] || 0) + 1;
}
console.log('\nالعينة:', picked.size, 'سهماً →', OUT);
console.log('تغطية التصنيفات:', cover);
console.log('قطاعات العينة:', new Set([...picked.values()].filter(s => s.sector).map(s => s.sector)).size);
console.log('بلا sector في العينة:', [...picked.values()].filter(s => !s.sector).length);
console.log('قطاعات filtered في العينة:',
  [...new Set([...picked.values()].filter(s => classOf(s) === 'filtered').map(sectorOf))].join(', '));
console.log('marketRegime الحالي:', data.marketRegime && data.marketRegime.regime);
