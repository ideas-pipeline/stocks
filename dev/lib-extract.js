// dev/lib-extract.js — استخراج كائن DATA من index.html (مشترك بين extract-sample و make-preview)
// مسح بعدّاد أقواس واعٍ بالنصوص — الكائن (~2MB) أضخم من أن يُلتقط بـ regex
'use strict';
const fs = require('fs');

function extractFromIndex(indexPath) {
  const html = fs.readFileSync(indexPath, 'utf8');
  const marker = 'const DATA = ';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error('لم أجد علامة const DATA في ' + indexPath);

  const jsonStart = start + marker.length;
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = jsonStart; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
  }
  if (end === -1) throw new Error('فشل تحديد نهاية كائن DATA');
  return JSON.parse(html.slice(jsonStart, end));
}

module.exports = { extractFromIndex };
