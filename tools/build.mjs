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

// Form đặt hoa đang bật hay tạm ẩn (config.js → ORDER_FORM_ENABLED)
const FORM_ON = C.ORDER_FORM_ENABLED === true;

/* ---- Dải chữ chạy trên cùng: lưu ý đặt hàng + 10 câu chúc (chủ web sửa / thêm / bớt câu tại đây) ---- */
const NOTICE_QUOTES = [
  'Mỗi bó hoa là một lời chưa kịp nói thành câu',
  'Chúc bạn một ngày dịu dàng như cánh hoa vừa nở',
  'Gửi một bó hoa, gửi cả sự quan tâm',
  'Hoa rồi sẽ tàn, yêu thương thì ở lại',
  'Điều nhẹ nhàng thường là điều được nhớ lâu',
  'Chúc bạn luôn có một lý do để mỉm cười',
  'Một nhành hoa nhỏ cũng đủ làm ấm một ngày dài',
  'Yêu thương không cần lớn lao, chỉ cần đúng lúc',
  'Chúc mọi dịp đặc biệt của bạn đều trọn vẹn',
  'Hoa nói thay những điều bạn ngại nói',
];
function noticeItems(copy) {
  const tel = `<a href="tel:${C.PHONE}"${copy ? ' tabindex="-1"' : ''}>${C.PHONE_DISPLAY}</a>`;
  const notice = `Hoa thiết kế theo yêu cầu vui lòng đặt trước <b>4–5 ngày</b> <i>·</i> Mẫu có sẵn tại tiệm có thể nhận <b>ngay trong ngày</b> <i>·</i> Liên hệ ${tel}`;
  const quotes = NOTICE_QUOTES.map((q) => `<span class="notice__quote">${esc(q)}</span>`);
  // Lưu ý đặt hàng xuất hiện 2 lần trong mỗi vòng (đầu vòng và giữa vòng) để khách không phải chờ lâu
  const half = Math.ceil(quotes.length / 2);
  return [notice, ...quotes.slice(0, half), notice.replace(`<a href="tel:${C.PHONE}">`, `<a href="tel:${C.PHONE}" tabindex="-1">`), ...quotes.slice(half)].join(' <i class="notice__sep">✦</i> ') + ' <i class="notice__sep">✦</i>';
}

/* ---- FAQ (giữ nguyên nội dung mục 5.5) ---- */
const FAQ = [
  ['Tôi cần đặt hoa trước bao lâu?', 'Với mẫu thiết kế theo yêu cầu, bạn vui lòng đặt trước 4–5 ngày để tiệm chuẩn bị hoa và vật liệu. Với mẫu có sẵn tại tiệm, bạn có thể nhận ngay trong ngày.'],
  ['Hoa nhận được có giống hình không?', 'Tiệm làm sát với mẫu đã thống nhất cùng bạn. Nếu loại hoa nào tạm hết, tiệm sẽ báo trước và cùng bạn chọn phương án thay thế trước khi làm.'],
  ['Vì sao trên web không ghi giá?', `Giá phụ thuộc vào loại hoa, số lượng và mùa hoa. Bạn nhắn Zalo ${C.PHONE_DISPLAY} để được báo giá theo đúng mẫu và ngân sách của mình.`],
  ['Tôi chưa biết chọn hoa gì cho dịp của mình?', 'Bạn chỉ cần cho tiệm biết dịp, người nhận và ngân sách — tiệm sẽ gợi ý vài mẫu phù hợp để bạn chọn.'],
  ['Nếu mẫu tôi chọn không hợp với dịp thì sao?', 'Tiệm sẽ góp ý thẳng thắn và có thể từ chối làm mẫu chưa phù hợp, sau đó đề xuất lựa chọn khác hợp với dịp của bạn hơn.'],
  ['Tiệm ở đâu?', `${C.ADDRESS_FULL} (khu vực Thủ Dầu Một – Bình Dương cũ).`],
  ['Tôi liên hệ tiệm bằng cách nào?', FORM_ON
    ? `Gọi hoặc nhắn Zalo ${C.PHONE_DISPLAY}, gửi form trên website, hoặc nhắn qua TikTok, Facebook, Instagram của tiệm.`
    : `Gọi hoặc nhắn Zalo ${C.PHONE_DISPLAY}, hoặc nhắn qua TikTok, Facebook, Instagram của tiệm.`],
];
const FAQ_ITEMS = FAQ.map(([q, a]) =>
  `      <details class="qa reveal"><summary><h3>${esc(q)}</h3><span class="qa__ic" aria-hidden="true"></span></summary><div class="qa__a"><p>${esc(a)}</p></div></details>`
).join('\n');

/* ---- 20 ô sản phẩm (HTML thật để Google index) ---- */
const img = (name, alt, eager) =>
  `<img src="/assets/img/products/${name}-800.webp" srcset="/assets/img/products/${name}-400.webp 400w, /assets/img/products/${name}-800.webp 800w, /assets/img/products/${name}-1200.webp 1200w" sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" width="800" height="1000" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const PRODUCT_CARDS = PRODUCTS.map((p, i) => {
  const media = p.images && p.images.length
    ? img(p.images[0], `${p.name} – ${p.size}`, false)
    : `<div class="ph${i % 3 ? ' ph--' + ((i % 3) + 1) : ''}"><svg aria-hidden="true"><use href="#i-flower"/></svg><span>Ảnh sẽ cập nhật</span></div>`;
  return `      <li class="pcard" id="${p.id}" data-cat="${p.category}">
        <a class="pcard__link" href="#${p.id}">
          <div class="pcard__media">${media}</div>
          <span class="pcard__id" aria-hidden="true">${p.id.toUpperCase().replace('SP-', 'SP ')}</span>
          <div class="pcard__info"><h2 class="pcard__name">${esc(p.name)}</h2><p class="pcard__size">${esc(p.size)}</p><p class="pcard__price">Liên hệ báo giá</p></div>
          <span class="pcard__glare" aria-hidden="true"></span>
        </a>
      </li>`;
}).join('\n');

/* ---- Các trang ---- */
const PAGES = [
  { key: 'home', path: '', name: 'Trang chủ',
    title: 'Quỳnh Như Florist – Hoa sáp, hoa tươi Thủ Dầu Một',
    desc: 'Tiệm hoa nhỏ tại Thủ Dầu Một – Bình Dương: hoa sáp, hoa tươi theo dịp, trụ hoa để bàn decor. Đặt trước 4–5 ngày, mẫu có sẵn nhận trong ngày. Zalo 0857 380 325.' },
  { key: 'gioi-thieu', path: 'gioi-thieu/', name: 'Giới thiệu',
    title: 'Giới thiệu – Quỳnh Như Florist, tiệm hoa Thủ Dầu Một',
    desc: 'Quỳnh Như Florist là tiệm hoa tươi tại khu vực Thủ Dầu Một – Bình Dương (nay thuộc TP. Hồ Chí Minh). Trong chưa tới một năm, tiệm đã gửi đi gần 500 bó hoa.' },
  { key: 'san-pham', path: 'san-pham/', name: 'Sản phẩm',
    title: 'Sản phẩm – Hoa theo dịp, trụ hoa để bàn | Quỳnh Như Florist',
    desc: 'Mẫu hoa theo dịp và trụ hoa để bàn decor của Quỳnh Như Florist tại Thủ Dầu Một – Bình Dương. Liên hệ báo giá qua Zalo 0857 380 325.' },
  { key: 'giai-phap', path: 'giai-phap/', name: 'Giải pháp',
    title: 'Giải pháp & hỏi đáp – Quỳnh Như Florist',
    desc: 'Bạn cần hoa cho dịp nào, tiệm có hướng phù hợp cho dịp đó. Quy trình đặt hoa 4 bước và câu hỏi thường gặp tại Quỳnh Như Florist.' },
  { key: 'lien-he', path: 'lien-he/', name: 'Liên hệ',
    title: 'Liên hệ đặt hoa – Quỳnh Như Florist, Thủ Dầu Một',
    desc: 'Liên hệ Quỳnh Như Florist: 324/34, Tổ 3, Khu 4, Phường Phú Lợi, TP. Hồ Chí Minh. Gọi hoặc nhắn Zalo 0857 380 325.' },
];
for (const pg of PAGES) {
  if ([...pg.title].length > 60) console.warn('⚠ Tiêu đề dài hơn 60 ký tự:', pg.title);
  if ([...pg.desc].length > 160) console.warn('⚠ Mô tả dài hơn 160 ký tự:', pg.desc);
}

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
const website = { '@type': 'WebSite', '@id': CANONICAL + '#website', url: CANONICAL, name: C.SHOP_NAME, inLanguage: 'vi', publisher: { '@id': CANONICAL + '#florist' } };
function jsonld(pg) {
  const url = CANONICAL + pg.path;
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: CANONICAL }];
  if (pg.path) crumbs.push({ '@type': 'ListItem', position: 2, name: pg.name, item: url });
  const pageType = { 'gioi-thieu': 'AboutPage', 'lien-he': 'ContactPage' }[pg.key] || 'WebPage';
  const graph = [
    florist, website,
    { '@type': pageType, '@id': url + '#webpage', url, name: pg.title, description: pg.desc, inLanguage: 'vi', isPartOf: { '@id': CANONICAL + '#website' }, about: { '@id': CANONICAL + '#florist' } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs },
  ];
  if (pg.key === 'giai-phap') graph.push({
    '@type': 'FAQPage', '@id': url + '#faq',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  });
  if (pg.key === 'san-pham') graph.push({
    '@type': 'ItemList', '@id': url + '#danh-sach', name: 'Sản phẩm – Quỳnh Như Florist',
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: url + '#' + p.id })),
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

/* ---- Ghép trang ---- */
const critical = read('assets/css/critical.css')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\.\.\/fonts\//g, '/assets/fonts/')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s*([{};,>])\s*/g, '$1');

const EMAIL_ROW = missing(C.EMAIL) ? '' : `          <div><dt>EMAIL</dt><dd><a href="mailto:${esc(C.EMAIL)}">${esc(C.EMAIL)}</a></dd></div>`;
const ver = (p) => crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, p))).digest('hex').slice(0, 8);
const v3d = ver('assets/js/intro3d.js') + ver('assets/fonts/qnf-3d.typeface.json').slice(0, 4);

const common = {
  SITE_URL: SITE,
  SITE_HOST: SITE.replace(/^https?:\/\//, ''),
  THREE_URL: `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.min.js`,
  THREE_ADDONS: `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/`,
  CRITICAL_CSS: critical,
  PRODUCT_CARDS, FAQ_ITEMS, EMAIL_ROW,
  PHONE: C.PHONE, PHONE_DISPLAY: C.PHONE_DISPLAY, ZALO_URL: C.ZALO_URL,
  ADDRESS_FULL: esc(C.ADDRESS_FULL), HOURS: esc(C.HOURS),
  TIKTOK_URL: C.TIKTOK_URL, FACEBOOK_URL: C.FACEBOOK_URL, INSTAGRAM_URL: C.INSTAGRAM_URL,
  MAPS_URL: esc(MAPS_URL),
  NOTICE_ITEMS: noticeItems(false),
  NOTICE_ITEMS_COPY: noticeItems(true),
  ORDER_FORM: FORM_ON ? read('tools/partials/order-form.html') : '',
  STEP_ONE_CHANNEL: FORM_ON ? 'qua Zalo hoặc form' : 'qua Zalo',
};
const STYLE_ASYNC = '<link rel="stylesheet" href="/assets/css/style.css" media="print" onload="this.media=\'all\'">\n<noscript><link rel="stylesheet" href="/assets/css/style.css"></noscript>';
const STYLE_BLOCK = '<link rel="stylesheet" href="/assets/css/style.css">';

for (const pg of PAGES) {
  const tokens = {
    ...common,
    PAGE: pg.key,
    TITLE: esc(pg.title), DESC: esc(pg.desc), CANONICAL: CANONICAL + pg.path,
    JSONLD: jsonld(pg),
    // Trang chủ: CSS phần dưới tải sau (hero nằm trong CSS quan trọng); trang con: tải ngay để không nháy giao diện
    STYLE_LINK: pg.key === 'home' ? STYLE_ASYNC : STYLE_BLOCK,
    HERO_PRELOAD: pg.key === 'home' ? '<link rel="preload" as="image" href="/assets/img/hero/hoa-ly-ngang-736.webp" imagesrcset="/assets/img/hero/hoa-ly-ngang-480.webp 480w, /assets/img/hero/hoa-ly-ngang-736.webp 736w" imagesizes="(min-width:1280px) 1176px, calc(100vw - 32px)" fetchpriority="high">\n' : '',
    PAGE_EXTRA: pg.key === 'san-pham' ? '\n' + read('tools/partials/product-modal.html') : '',
  };
  for (const p of PAGES) tokens['NAV_' + p.key] = p.key === pg.key ? 'class="is-active" aria-current="page"' : '';
  const raw = read('tools/partials/head.html') + read('tools/partials/top.html') + read(`tools/pages/${pg.key}.html`) + read('tools/partials/bottom.html');
  // Thay nhiều lượt: phần chèn vào (popup sản phẩm, form) cũng chứa token như {{ZALO_URL}}
  let out = raw;
  for (let pass = 0; pass < 3 && /\{\{[A-Za-z_-]+\}\}/.test(out); pass++) {
    out = out.replace(/\{\{([A-Za-z_-]+)\}\}/g, (m, k) => {
      if (!(k in tokens)) throw new Error(`Thiếu token ${k} (${pg.key})`);
      return tokens[k];
    });
  }
  if (out.includes('{{')) throw new Error(`Còn token chưa thay trong trang ${pg.key}: ` + out.match(/\{\{[^}]*\}\}/)[0]);
  // Gắn ?v=<mã> vào file tĩnh để cache dài hạn mà vẫn cập nhật ngay khi sửa
  for (const f of ['assets/css/style.css', 'assets/js/config.js', 'assets/js/products.js', 'assets/js/main.js']) {
    out = out.split(`"/${f}"`).join(`"/${f}?v=${ver(f)}"`);
  }
  out = out.replace('<html lang="vi" class="no-js">', `<html lang="vi" class="no-js" data-v="${v3d}">`);
  if (pg.path) fs.mkdirSync(path.join(ROOT, pg.path), { recursive: true });
  write(pg.path + 'index.html', out);
}

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((pg) => `  <url>
    <loc>${CANONICAL + pg.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pg.path ? '0.8' : '1.0'}</priority>
  </url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

// 404 dùng chung CSS quan trọng
const page404 = read('tools/404.template.html').replace('{{CRITICAL_CSS}}', critical).replace(/\{\{ZALO_URL\}\}/g, C.ZALO_URL).replace(/\{\{PHONE_DISPLAY\}\}/g, C.PHONE_DISPLAY);
write('404.html', page404);

if (!FORM_ON) console.log('ℹ Form đặt hoa đang TẠM ẨN (ORDER_FORM_ENABLED: false)');
if (missing(C.SITE_URL) || /example\.com/.test(C.SITE_URL)) console.warn('⚠ Chưa có tên miền thật — đang dùng', C.SITE_URL);
