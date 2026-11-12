// Chuyển font TTF sang định dạng typeface JSON cho Three.js (giống facetype.js),
// chỉ giữ các ký tự cần cho chữ 3D để file nhẹ.
// Cách dùng: node tools/make-3d-font.mjs <font.ttf> "<chữ cần>" <file-ra.json>
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const opentype = require('opentype.js');

const [, , src, text = 'Quỳnh Như Florist', out = 'assets/fonts/qnf-3d.typeface.json'] = process.argv;
const font = opentype.parse(fs.readFileSync(src).buffer);
const r = (n) => Math.round(n);
const glyphs = {};
for (const ch of new Set([...text.normalize('NFC'), ' '])) {
  const g = font.charToGlyph(ch);
  if (!g || g.index === 0) throw new Error('Font thiếu ký tự: ' + ch);
  const o = [];
  for (const c of g.path.commands) {
    if (c.type === 'M') o.push('m', r(c.x), r(c.y));
    else if (c.type === 'L') o.push('l', r(c.x), r(c.y));
    else if (c.type === 'Q') o.push('q', r(c.x), r(c.y), r(c.x1), r(c.y1));
    else if (c.type === 'C') o.push('b', r(c.x), r(c.y), r(c.x1), r(c.y1), r(c.x2), r(c.y2));
  }
  const bb = g.getBoundingBox();
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.join(' ') };
}
const head = font.tables.head;
const data = {
  glyphs,
  familyName: font.names.fontFamily?.en || 'font',
  ascender: font.ascender,
  descender: font.descender,
  underlinePosition: font.tables.post.underlinePosition,
  underlineThickness: font.tables.post.underlineThickness,
  boundingBox: { yMin: head.yMin, xMin: head.xMin, yMax: head.yMax, xMax: head.xMax },
  resolution: font.unitsPerEm,
  original_font_information: { note: 'Subset cho chữ 3D Quỳnh Như Florist' },
  cssFontWeight: 'bold',
  cssFontStyle: 'normal',
};
fs.writeFileSync(out, JSON.stringify(data));
console.log('Đã tạo', out, fs.statSync(out).size, 'bytes, ký tự:', Object.keys(glyphs).join(''));
