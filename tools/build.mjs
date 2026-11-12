// Tạo index.html, robots.txt, sitemap.xml từ:
//   tools/index.template.html · assets/css/critical.css · assets/js/config.js · assets/js/products.js
// Chạy: node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.writeFileSync(path.join(ROOT, p), s); console.log('✓', p); };

const sandbox = { window: {} };
vm.runInNewContext(read('assets/js/config.js'), sandbox);
vm.runInNewContext(read('assets/js/products.js'), sandbox);
const C = sandbox.window.QNF_CONFIG;
const PRODUCTS = sandbox.window.QNF_PRODUCTS;
const missing = (v) => !v || String(v).startsWith('[CHƯA CÓ');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const THREE_VERSION = '0.160.0';
const SITE = C.SITE_URL.replace(/\/+$/, '');
const CANONICAL = SITE + '/';
const MAPS_URL = missing(C.MAPS_URL)
  ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${C.ADDRESS_STREET}, ${C.ADDRESS_WARD}, ${C.ADDRESS_CITY}`)
  : C.MAPS_URL;
const CAT = { occasion: 'Hoa theo dịp', table: 'Trụ hoa để bàn decor' };

if (PRODUCTS.length !== 20) console.warn('⚠ Số sản phẩm hiện là', PRODUCTS.length, '(yêu cầu 20)');

/* ---- FAQ (giữ nguyên nội dung mục 5.5) ---- */
const FAQ = [
  ['Tôi cần đặt hoa trước bao lâu?', 'Với mẫu thiết kế theo yêu cầu, bạn vui lòng đặt trước 4–5 ngày để tiệm chuẩn bị hoa và vật liệu. Với mẫu có sẵn tại tiệm, bạn có thể nhận ngay trong ngày.'],
  ['Hoa nhận được có giống hình không?', 'Tiệm làm sát với mẫu đã thống nhất cùng bạn. Nếu loại hoa nào tạm hết, tiệm sẽ báo trước và cùng bạn chọn phương án thay thế trước khi làm.'],
  ['Vì sao trên web không ghi giá?', `Giá phụ thuộc vào loại hoa, số lượng và mùa hoa. Bạn nhắn Zalo ${C.PHONE_DISPLAY} để được báo giá theo đúng mẫu và ngân sách của mình.`],
  ['Tôi chưa biết chọn hoa gì cho dịp của mình?', 'Bạn chỉ cần cho tiệm biết dịp, người nhận và ngân sách — tiệm sẽ gợi ý vài mẫu phù hợp để bạn chọn.'],
  ['Nếu mẫu tôi chọn không hợp với dịp thì sao?', 'Tiệm sẽ góp ý thẳng thắn và có thể từ chối làm mẫu chưa phù hợp, sau đó đề xuất lựa chọn khác hợp với dịp của bạn hơn.'],
  ['Tiệm ở đâu?', `${C.ADDRESS_FULL} (khu vực Thủ Dầu Một – Bình Dương cũ).`],
  ['Tôi liên hệ tiệm bằng cách nào?', `Gọi hoặc nhắn Zalo ${C.PHONE_DISPLAY}, gửi form trên website, hoặc nhắn qua TikTok, Facebook, Instagram của tiệm.`],
];
const FAQ_ITEMS = FAQ.map(([q, a]) =>
  `      <details class="qa reveal"><summary><h3>${esc(q)}</h3><span class="qa__ic" aria-hidden="true"></span></summary><div class="qa__a"><p>${esc(a)}</p></div></details>`
).join('\n');

/* ---- 20 ô sản phẩm (HTML thật để Google index) ---- */
const img = (name, alt, eager) =>
  `<img src="assets/img/products/${name}-800.webp" srcset="assets/img/products/${name}-400.webp 400w, assets/img/products/${name}-800.webp 800w, assets/img/products/${name}-1200.webp 1200w" sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" width="800" height="1000" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const PRODUCT_CARDS = PRODUCTS.map((p, i) => {
  const media = p.images && p.images.length
    ? img(p.images[0], `${p.name} – ${p.size}`, false)
    : `<div class="ph${i % 3 ? ' ph--' + ((i % 3) + 1) : ''}"><svg aria-hidden="true"><use href="#i-flower"/></svg><span>Ảnh sẽ cập nhật</span></div>`;
  return `      <li class="pcard" id="${p.id}" data-cat="${p.category}">
        <a class="pcard__link" href="#${p.id}">
          <div class="pcard__media">${media}</div>
          <span class="pcard__id" aria-hidden="true">${p.id.toUpperCase().replace('SP-', 'SP ')}</span>
          <div class="pcard__info"><h3 class="pcard__name">${esc(p.name)}</h3><p class="pcard__size">${esc(p.size)}</p><p class="pcard__price">Liên hệ báo giá</p></div>
          <span class="pcard__glare" aria-hidden="true"></span>
        </a>
      </li>`;
}).join('\n');

/* ---- JSON-LD ---- */
const sameAs = [C.TIKTOK_URL, C.FACEBOOK_URL, C.INSTAGRAM_URL];
const florist = {
  '@type': 'Florist',
  '@id': CANONICAL + '#florist',
  name: C.SHOP_NAME,
  url: CANONICAL,
  image: SITE + '/assets/img/og-cover.jpg',
  logo: SITE + '/apple-touch-icon.png',
  telephone: C.PHONE_INTL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: C.ADDRESS_STREET,
    addressLocality: C.ADDRESS_WARD,
    addressRegion: C.ADDRESS_CITY,
    addressCountry: 'VN',
  },
  areaServed: ['Thủ Dầu Một', 'Bình Dương', 'Thành phố Hồ Chí Minh'],
  sameAs,
  hasMap: MAPS_URL,
};
if (!missing(C.EMAIL)) florist.email = C.EMAIL;
const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    florist,
    { '@type': 'WebSite', '@id': CANONICAL + '#website', url: CANONICAL, name: C.SHOP_NAME, inLanguage: 'vi', publisher: { '@id': CANONICAL + '#florist' } },
    {
      '@type': 'FAQPage', '@id': CANONICAL + '#faq',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    {
      '@type': 'ItemList', '@id': CANONICAL + '#san-pham', name: 'Sản phẩm – Quỳnh Như Florist',
      numberOfItems: PRODUCTS.length,
      itemListElement: PRODUCTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: CANONICAL + '#' + p.id })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: CANONICAL }],
    },
  ],
};

/* ---- Ghép trang ---- */
const critical = read('assets/css/critical.css')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\.\.\/fonts\//g, 'assets/fonts/')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s*([{};,>])\s*/g, '$1');

const EMAIL_ROW = missing(C.EMAIL) ? '' : `          <div><dt>EMAIL</dt><dd><a href="mailto:${esc(C.EMAIL)}">${esc(C.EMAIL)}</a></dd></div>`;

const tokens = {
  SITE_URL: SITE, CANONICAL,
  THREE_URL: `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.min.js`,
  THREE_ADDONS: `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/`,
  CRITICAL_CSS: critical,
  JSONLD: JSON.stringify(JSONLD).replace(/</g, '\\u003c'),
  PRODUCT_CARDS, FAQ_ITEMS, EMAIL_ROW,
  PHONE: C.PHONE, PHONE_DISPLAY: C.PHONE_DISPLAY, ZALO_URL: C.ZALO_URL,
  ADDRESS_FULL: esc(C.ADDRESS_FULL), HOURS: esc(C.HOURS),
  TIKTOK_URL: C.TIKTOK_URL, FACEBOOK_URL: C.FACEBOOK_URL, INSTAGRAM_URL: C.INSTAGRAM_URL,
  MAPS_URL: esc(MAPS_URL),
};
let out = read('tools/index.template.html').replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
  if (!(k in tokens)) throw new Error('Thiếu token ' + k);
  return tokens[k];
});
// Gắn ?v=<mã> vào file tĩnh để cache dài hạn mà vẫn cập nhật ngay khi sửa
const ver = (p) => crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, p))).digest('hex').slice(0, 8);
for (const f of ['assets/css/style.css', 'assets/js/config.js', 'assets/js/products.js', 'assets/js/main.js']) {
  out = out.split(`"${f}"`).join(`"${f}?v=${ver(f)}"`);
}
const v3d = ver('assets/js/intro3d.js') + ver('assets/fonts/qnf-3d.typeface.json').slice(0, 4);
out = out.replace('<html lang="vi" class="no-js">', `<html lang="vi" class="no-js" data-v="${v3d}">`);
write('index.html', out);

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

// 404 dùng chung CSS quan trọng
const page404 = read('tools/404.template.html').replace('{{CRITICAL_CSS}}', critical).replace(/\{\{ZALO_URL\}\}/g, C.ZALO_URL).replace(/\{\{PHONE_DISPLAY\}\}/g, C.PHONE_DISPLAY);
write('404.html', page404);

if (missing(C.SITE_URL) || /example\.com/.test(C.SITE_URL)) console.warn('⚠ Chưa có tên miền thật — đang dùng', C.SITE_URL);
