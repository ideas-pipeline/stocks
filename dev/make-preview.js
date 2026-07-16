// dev/make-preview.js — يحقن sample-data.json في template.html وينتج dev/preview.html للمعاينة
// الاستخدام:
//   node dev/make-preview.js                → معاينة بالعينة كما هي
//   node dev/make-preview.js --regime=هابط  → فرض نظام هابط (لقطة حقيقية من بيانات 2026-07-16 حرفياً)
//   node dev/make-preview.js --regime=محايد → فرض نظام غير هابط (تركيبي — لاختبار غياب تنبيه البيئة الضاغطة)
//   node dev/make-preview.js --regime=صاعد  → كذلك
//   (--bearish اختصار قديم لـ --regime=هابط)
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const template = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'sample-data.json'), 'utf8'));

// لقطة حقيقية حرفية من marketRegime يوم 2026-07-16 (نظام هابط) — لا نص مفبرك
const REAL_BEARISH = {
  date: '2026-07-16', indexValue: 10720.28, prevClose: 10704.51, change: 15.77,
  changePct: 0.15, sma200d: 11040.16, pctVsSma: -2.9, smaSlope: 0.21,
  advancing: 112, declining: 140, breadth: 0.8, mood: 'Bearish',
  regime: 'هابط', icon: '🔴', advice: 'بيئة ضاغطة — الأفضلية للانتظار',
};

const regimeArg = process.argv.find(a => a.startsWith('--regime='));
let forced = regimeArg ? regimeArg.split('=')[1] : (process.argv.includes('--bearish') ? 'هابط' : null);

if (forced === 'هابط') {
  data.marketRegime = data.marketRegime && data.marketRegime.regime === 'هابط'
    ? data.marketRegime // البيانات هابطة أصلاً — لا داعي للمس شيء
    : { ...data.marketRegime, ...REAL_BEARISH };
  console.log('وضع الاختبار: نظام هابط (نصوص حقيقية)');
} else if (forced === 'محايد' || forced === 'صاعد') {
  // تركيبي: الغرض إثبات "غياب" تنبيه البيئة الضاغطة، لا محاكاة نصوص إنتاج غير معروفة
  data.marketRegime = {
    ...data.marketRegime,
    regime: forced, mood: forced === 'صاعد' ? 'Bullish' : 'Neutral',
    icon: forced === 'صاعد' ? '🟢' : '🟡',
    advice: forced === 'صاعد' ? 'بيئة داعمة' : 'بيئة متوازنة',
    pctVsSma: forced === 'صاعد' ? 3.1 : 0.4,
  };
  console.log(`وضع الاختبار: نظام ${forced} (تركيبي — لاختبار غياب التنبيه)`);
} else if (forced) {
  throw new Error(`قيمة --regime غير معروفة: ${forced} (المتاح: هابط | محايد | صاعد)`);
}

if (!template.includes('__STOCKS_DATA__')) throw new Error('علامة __STOCKS_DATA__ غير موجودة في template.html');
// دالة كبديل replace — نص بديل مباشر يفسّر أنماط $ ($&, $`, $') ويفسد JSON يحوي $ بصمت
const out = template.replace('__STOCKS_DATA__', () => JSON.stringify(data));
const outPath = path.join(__dirname, 'preview.html');
fs.writeFileSync(outPath, out, 'utf8');
console.log('تم:', outPath, `— نظام السوق: ${data.marketRegime.regime}`);
