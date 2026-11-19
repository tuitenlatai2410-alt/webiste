// Tạo các trang HTML, sitemap.xml, robots.txt, 404.html, _redirects từ:
//   tools/partials/* · tools/pages/* · tools/content/* · tools/i18n/vi.json
//   assets/css/critical.css · assets/js/config.js · assets/js/products.js
// Chạy: node tools/build.mjs
//
// Luật của web (build tự kiểm):
// - Chữ giữ chỗ "[CHƯA CÓ – …]" KHÔNG BAO GIỜ hiện cho khách: khối / câu hỏi / mục chính sách
//   nào còn chữ này thì bị ẩn cả khối và bỏ khỏi schema. Cuối mỗi lần build in danh sách khối đang ẩn.
// - Không dựng giao diện rỗng: cột menu, nút lọc chưa có dữ liệu thì không xuất.
// - HTML xuất ra không được chứa "[CHƯA CÓ", "Đang cập nhật", "hoa tươi" hay từ cấm → build báo lỗi.
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
const OCC = sandbox.window.QNF_OCCASIONS || {};
const missing = (v) => !v || String(v).startsWith('[CHƯA CÓ');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const slug = (s) => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---- Chữ dùng chung (tiếng Việt). Thêm thứ tiếng: tools/i18n/<lang>.json cùng khóa ---- */
// vi: bản chính. en: bản dịch, đang noindex (chưa có tên miền thật, chưa có người soát).
const LANGS = ['vi', 'en'];
const NOINDEX_LANGS = ['en'];
const I18N = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(read(`tools/i18n/${l}.json`))]));
const T = I18N.vi;
const tTokensOf = (TT) => Object.fromEntries(Object.entries(TT).filter(([k]) => !k.startsWith('_')).map(([k, v]) => ['T_' + k, v]));

/* ---- Khối bị ẩn vì thiếu thông tin ---- */
const HIDDEN = [];
const hasPlaceholder = (...xs) => xs.some((x) => /\[CHƯA CÓ/.test(String(x)));
function shown(label, ...texts) {
  if (hasPlaceholder(...texts)) { HIDDEN.push(label); return false; }
  return true;
}

// Ảnh bó hoa xanh ở hero (dùng chung cho thẻ preload và thẻ img); sizes khớp bề rộng hiển thị thật
const HERO_SRCSET = ['400', '800', '1200'].map((w) => `/assets/img/products/sp-01-a-${w}.webp ${w}w`).join(', ');
const HERO_SIZES = '(min-width:1024px) 55vw, 100vw';
const SITE = C.SITE_URL.replace(/\/+$/, '');
const CANONICAL = SITE + '/';
const MAPS_URL = missing(C.MAPS_URL)
  ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${C.ADDRESS_STREET}, ${C.ADDRESS_WARD}, ${C.ADDRESS_CITY}`)
  : C.MAPS_URL;

if (PRODUCTS.length !== 20) console.warn('⚠ Số sản phẩm hiện là', PRODUCTS.length, '(yêu cầu 20)');

// Form đặt hoa đang bật hay tạm ẩn (config.js → ORDER_FORM_ENABLED)
const FORM_ON = C.ORDER_FORM_ENABLED === true;

/* ---- Mẫu thật (có ảnh) và mẫu tham khảo ---- */
const isReal = (p) => !!(p.images && p.images.length);
const REAL = PRODUCTS.filter(isReal);
const HAS_REAL_PRODUCTS = REAL.length > 0;
// Tim yêu thích chỉ bật khi có mẫu thật
const WISH_ON = HAS_REAL_PRODUCTS;
// Trang Feedback mở ở đợt 2 (khi có ít nhất 3 ảnh tin nhắn khách đạt yêu cầu)
const FEEDBACK_ON = false;

/* ---- Giờ làm việc ---- */
const HOURS_ON = !missing(C.HOURS);
const HOURS_M = HOURS_ON && String(C.HOURS).match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);

/* ---- Lời chúc hôm nay (khối tĩnh trên chân trang ở trang chủ) ---- */
// Kho lời chúc: assets/data/loi-chuc.json. Mỗi ngày (giờ Việt Nam) 1 câu.
// Lúc build ghi sẵn câu của ngày build; trình duyệt tự đổi sang câu của hôm nay (main.js → initQuote).
const LOI_CHUC = JSON.parse(read('assets/data/loi-chuc.json'));
const dayIndex = (ms) => Math.floor((ms + 7 * 3600e3) / 864e5) % LOI_CHUC.length;
const TODAY_QUOTE = LOI_CHUC[dayIndex(Date.now())];

/* ---- Trợ giúp: 30 câu hỏi (tools/content/tro-giup.mjs) ---- */
const FAQ_GROUPS = (await import('./content/tro-giup.mjs')).default({ C, FORM_ON })
  .map((g) => ({ ...g, items: g.items.filter(([q, a]) => shown(`Trợ giúp › ${g.title} › ${q}`, q, a)) }))
  .filter((g) => g.items.length);
const FAQ = FAQ_GROUPS.flatMap((g) => g.items);
const FAQ_ITEMS = FAQ_GROUPS.map((g) => `    <div class="faq__group" id="hd-${g.id}">
      <h3 class="faq__gh">${esc(g.title)}</h3>
      <div class="faq__list">
${g.items.map(([q, a]) => `        <details class="qa reveal"><summary><h4>${esc(q)}</h4><span class="qa__ic" aria-hidden="true"></span></summary><div class="qa__a"><p>${esc(a)}</p></div></details>`).join('\n')}
      </div>
    </div>`).join('\n');

/* ---- Chính sách (tools/content/chinh-sach.mjs) ---- */
const POLICY = (await import('./content/chinh-sach.mjs')).default({ C, FORM_ON, WISH_ON })
  .filter((s) => shown(`Chính sách › ${s.title}`, ...s.paras));
const POLICY_ON = POLICY.length > 0;
const POLICY_TOC = POLICY.length > 1
  ? `    <ul class="policy__toc">${POLICY.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ul>`
  : '';
const POLICY_SECTIONS = POLICY.map((s) => `    <section class="policy__sec reveal" id="${s.id}" aria-labelledby="${s.id}-h">
      <h2 class="policy__h" id="${s.id}-h">${esc(s.title)}</h2>
${s.paras.map((t) => `      <p>${esc(t)}</p>`).join('\n')}
    </section>`).join('\n');

/* ---- Bộ lọc sản phẩm: chỉ xuất nút có dữ liệu ---- */
const occUsed = Object.keys(OCC).filter((k) => PRODUCTS.some((p) => (p.occasions || []).includes(k)));
const colorsReal = [...new Set(REAL.flatMap((p) => p.colors || []))];
const tagLabel = { hot: T.tag_hot, 'ban-chay': T.tag_ban_chay };
const tagsReal = Object.keys(tagLabel).filter((k) => REAL.some((p) => (p.tags || []).includes(k)));
const LOAI = [['hoa-theo-dip', 'occasion', 'Hoa theo dịp'], ['tru-hoa-de-ban', 'table', 'Trụ hoa để bàn decor']]
  .filter(([, cat]) => PRODUCTS.some((p) => p.category === cat));
const TYPES_USED = PRODUCTS.map((p) => p.category);
const cap = (c) => c.charAt(0).toUpperCase() + c.slice(1);
function chipGroup(key, title, allLabel, items) {
  return `      <div class="chips" role="group" aria-label="${esc(title)}">
        <span class="chips__h" aria-hidden="true">${esc(title)}</span>
        <button type="button" class="chip" data-k="${key}" data-v="" aria-pressed="true">${esc(allLabel)}</button>
${items.map(([v, label]) => `        <button type="button" class="chip" data-k="${key}" data-v="${v}" aria-pressed="false">${esc(label)}</button>`).join('\n')}
      </div>`;
}
// Kiểu sản phẩm (suy từ tên mẫu và từ khóa): bó hoa, túi hoa, kèm gấu bông
const KIEU_LABEL = { 'bo-hoa': 'Bó hoa', 'tui-hoa': 'Túi hoa', 'kem-gau': 'Kèm gấu bông' };
const kieuOf = (p) => [
  ...(/^Bó\s/.test(p.name) ? ['bo-hoa'] : []), ...(/^Túi\s/.test(p.name) ? ['tui-hoa'] : []),
  ...((p.keywords || []).some((k) => /gấu bông|thú bông|thỏ bông/.test(k)) ? ['kem-gau'] : []),
];
const kieuUsed = Object.keys(KIEU_LABEL).filter((k) => REAL.some((p) => kieuOf(p).includes(k)));
const FILTERS = `    <div class="filters" id="filters">
${[
  kieuUsed.length ? chipGroup('kieu', 'Kiểu', 'Tất cả', kieuUsed.map((k) => [k, KIEU_LABEL[k]])) : '',
  LOAI.length > 1 ? chipGroup('loai', 'Loại', 'Tất cả', LOAI.map(([v, , l]) => [v, l])) : '',
  occUsed.length ? chipGroup('dip', 'Dịp', 'Mọi dịp', occUsed.map((k) => [k, OCC[k]])) : '',
  colorsReal.length ? chipGroup('mau', 'Màu', 'Mọi màu', colorsReal.map((c) => [slug(c), cap(c)])) : '',
  tagsReal.length ? chipGroup('nb', 'Nổi bật', 'Tất cả', tagsReal.map((k) => [k, tagLabel[k]])) : '',
].filter(Boolean).join('\n')}
    </div>`;

/* ---- Phần dùng chung theo ngôn ngữ: thanh tiện ích, menu, chân trang… ---- */
function chromeFor(L) {
const T = I18N[L];
const U = (key) => urlOf(L, key);
/* ---- Liên kết tiện ích (thanh trên cùng, cuối menu điện thoại, chân trang) ---- */
const UTIL_LINKS = [
  [U('lien-he') + '#ban-do', T.ubar_map],
  [U('tro-giup'), T.ubar_help],
  [U('lien-he'), T.ubar_contact],
  ...(POLICY_ON ? [[U('chinh-sach'), T.ubar_policy]] : []),
];
const utilLis = UTIL_LINKS.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('');
const UBAR = `<div class="ubar" role="region" aria-label="${esc(T.ubar_label)}">
  <div class="ubar__in">
    <p class="ubar__info">${HOURS_ON ? `<svg aria-hidden="true"><use href="#i-clock"/></svg><span>${esc(T.ubar_hours)} <b>${esc(C.HOURS)}</b></span><span class="ubar__note"><i aria-hidden="true">·</i>${esc(T.ubar_note)}</span>` : `<span>${esc(T.ubar_note)}</span>`}</p>
    <ul class="ubar__links">${utilLis}</ul>
  </div>
</div>`;
const NAV_UTIL = `      <ul class="nav__util">${utilLis}</ul>`;

/* ---- Menu chính + menu thả xuống ---- */
function navItems(cur) {
  const items = [
    ['home', U('home'), T.nav_home, ''],
    ['gioi-thieu', U('gioi-thieu'), T.nav_about, 'gioi-thieu'],
    ...(FEEDBACK_ON ? [['feedback', U('feedback'), T.nav_feedback, '']] : []),
    // Bản dịch chưa có trang Sản phẩm: link về bản tiếng Việt, không mở menu thả xuống
    ['san-pham', U('san-pham'), T.nav_products, L === 'vi' ? 'san-pham' : ''],
  ];
  return items.map(([k, h, t, mega]) => `        <li${mega ? ` data-mega="${mega}"` : ''}><a href="${h}"${k === cur ? ' class="is-active" aria-current="page"' : ''}>${esc(t)}</a></li>`).join('\n');
}
const megaCol = (h, links, wide) => `            <div class="mega__col${wide ? ' mega__col--2' : ''}"><p class="mega__h">${esc(h)}</p>
              <ul>
${links.map(([href, t]) => `                <li><a href="${href}">${esc(t)}</a></li>`).join('\n')}
              </ul>
            </div>`;
const MEGA_PANELS = `          <details class="mega__panel" data-panel="gioi-thieu"><summary>${esc(T.nav_about)}</summary>
            <div class="mega__cols">
${megaCol(T.mega_about_h, [[U('gioi-thieu'), T.mega_about_1], [U('gioi-thieu') + '#triet-ly', T.mega_about_2]])}
            </div>
          </details>
          <details class="mega__panel" data-panel="san-pham"><summary>${esc(T.nav_products)}</summary>
            <div class="mega__cols">
${[
  megaCol(T.mega_type_h, [['/san-pham/', T.mega_type_all], ...(TYPES_USED.includes('occasion') ? [['/san-pham/?loai=hoa-theo-dip', T.mega_type_occasion]] : []), ...(TYPES_USED.includes('table') ? [['/san-pham/?loai=tru-hoa-de-ban', T.mega_type_table]] : [])]),
  occUsed.length ? megaCol(T.mega_occ_h, occUsed.map((k) => [`/san-pham/?dip=${k}`, OCC[k]]), occUsed.length > 4) : '',
  colorsReal.length ? megaCol(T.mega_color_h, colorsReal.map((c) => [`/san-pham/?mau=${slug(c)}`, cap(c)])) : '',
  tagsReal.length ? megaCol(T.mega_tag_h, tagsReal.map((k) => [`/san-pham/?nb=${k}`, tagLabel[k]])) : '',
].filter(Boolean).join('\n')}
            </div>
          </details>`;

/* ---- Tim yêu thích (chỉ khi có mẫu thật) ---- */
const WISH_BTN = WISH_ON
  ? `      <button type="button" class="nav__wish" aria-haspopup="dialog" aria-controls="wish" aria-label="${esc(T.wish_btn)}"><svg aria-hidden="true"><use href="#i-heart"/></svg><span class="nav__wish-n" aria-hidden="true">0</span></button>`
  : '';
const WISH_PANEL = WISH_ON ? `<dialog class="wish" id="wish" aria-labelledby="wish-title">
  <div class="wish__in">
    <div class="wish__head"><h2 class="wish__title" id="wish-title">${esc(T.wish_title)}</h2><button type="button" class="wish__x" aria-label="${esc(T.wish_close)}">×</button></div>
    <p class="wish__empty">${esc(T.wish_empty)}</p>
    <ul class="wish__list"></ul>
    <div class="wish__foot">
      <button type="button" class="btn btn--dark btn--sm wish__copy">${esc(T.wish_copy)}</button>
      <p class="wish__ok" role="status" hidden>${esc(T.wish_copied)} <a class="wish__zalo" href="${C.ZALO_URL}" target="_blank" rel="noopener">${esc(T.wish_zalo)}</a></p>
    </div>
  </div>
</dialog>` : '';

/* ---- Chân trang ---- */
const FOOT_MENU = [
  ['/', T.nav_home], ['/gioi-thieu/', T.nav_about], ...(FEEDBACK_ON ? [['/feedback/', T.nav_feedback]] : []),
  ['/san-pham/', T.nav_products], ['/tro-giup/', T.foot_help], [U('lien-he'), T.ubar_contact],
  ...(POLICY_ON ? [['/chinh-sach/', T.foot_policy]] : []),
].map(([h, t]) => `        <li><a href="${h}">${esc(t)}</a></li>`).join('\n');
const FOOT_HOURS = HOURS_ON ? `        <span class="footer__row"><svg aria-hidden="true"><use href="#i-clock"/></svg><span>${esc(T.ubar_hours)}: ${esc(C.HOURS)}</span></span>\n` : '';
const CONTACT_HOURS = HOURS_ON ? `          <div><dt>${esc(T.hours_dt)}</dt><dd>${esc(C.HOURS)}</dd></div>\n` : '';


const otherLangs = LANGS.filter((x) => x !== L);
return { T, U, UBAR, NAV_UTIL, navItems, MEGA_PANELS, WISH_BTN, WISH_PANEL, FOOT_MENU, FOOT_HOURS, CONTACT_HOURS };
}

/* ---- Ô sản phẩm (HTML thật để Google index) ---- */
const img = (name, alt, eager) =>
  `<img src="/assets/img/products/${name}-800.webp" srcset="${[400, 800, 1200].filter((w) => fs.existsSync(path.join(ROOT, `assets/img/products/${name}-${w}.webp`))).map((w) => `/assets/img/products/${name}-${w}.webp ${w}w`).join(', ')}" sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" width="800" height="1000" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
for (const p of REAL) if (missing(p.size)) HIDDEN.push(`Sản phẩm ${p.id.toUpperCase()}: kích thước (tên "${p.name}" là tên tạm)`);
const PRODUCT_CARDS = PRODUCTS.map((p, i) => {
  // Mẫu tham khảo (chưa có ảnh thật): không hiện kích thước, không có nút tim
  const real = isReal(p);
  const media = real
    ? img(p.images[0], `${p.name}: ${p.look || ''} – Quỳnh Như Florist`, false)
    : `<div class="ph${i % 3 ? ' ph--' + ((i % 3) + 1) : ''}"><svg aria-hidden="true"><use href="#i-flower"/></svg></div>`;
  const data = [
    `data-cat="${p.category}"`,
    `data-kieu="${real ? kieuOf(p).join(' ') : ''}"`,
    `data-dip="${(p.occasions || []).join(' ')}"`,
    `data-mau="${real ? (p.colors || []).map(slug).join(' ') : ''}"`,
    `data-nb="${real ? (p.tags || []).join(' ') : ''}"`,
  ].join(' ');
  const wish = real && WISH_ON
    ? `\n        <button type="button" class="pcard__wish" data-wish="${p.id}" aria-pressed="false" aria-label="Lưu “${esc(p.name)}” vào mẫu yêu thích"><svg aria-hidden="true"><use href="#i-heart"/></svg></button>`
    : '';
  return `      <li class="pcard" id="${p.id}" ${data}>
        <a class="pcard__link" href="#${p.id}">
          <div class="pcard__media">${media}</div>
          <span class="pcard__id" aria-hidden="true">${p.id.toUpperCase().replace('SP-', 'SP ')}</span>
          <div class="pcard__info"><h2 class="pcard__name">${esc(p.name)}</h2>${real && !missing(p.size) ? `<p class="pcard__size">${esc(p.size)}</p>` : ''}<p class="pcard__price">Liên hệ báo giá</p></div>
          <span class="pcard__glare" aria-hidden="true"></span>
        </a>${wish}
      </li>`;
}).join('\n');

/* ---- Blog (tools/posts/*.json). Bài có "draft": true thì chưa xuất ---- */
const POSTS_ALL = fs.readdirSync(path.join(ROOT, 'tools/posts')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(read('tools/posts/' + f)));
for (const p of POSTS_ALL) if (p.draft) HIDDEN.push(`Blog › bản nháp chờ duyệt: ${p.title}`);
// Checklist SEO 8 bước (tools/seo-check.mjs): bài chưa đạt đủ 8 bước thì không đăng
const { seoCheck, SEO_STEPS } = await import('./seo-check.mjs');
const SEO_REPORT = [];
const NOW = process.env.QNF_NOW ? new Date(process.env.QNF_NOW) : new Date();
const POSTS = POSTS_ALL.filter((p) => {
  if (p.draft) return false;
  const r = seoCheck(p, ROOT);
  SEO_REPORT.push([p, r]);
  if (r.some((x) => !x.ok)) { HIDDEN.push(`Blog › chưa đạt checklist SEO: ${p.title}`); return false; }
  if (p.publishAt && new Date(p.publishAt) > NOW) { HIDDEN.push(`Blog › chờ đăng lúc ${p.publishAt}: ${p.title}`); return false; }
  return !hasPlaceholder(JSON.stringify(p));
});
const BLOG_ON = POSTS.length > 0;
if (!BLOG_ON) HIDDEN.push('Trang /blog/ (chưa có bài nào được duyệt)');
if (POSTS.length < 2) HIDDEN.push('Khối "Câu chuyện từ tiệm" ở trang chủ (cần ít nhất 2 bài đã duyệt)');
// Ảnh blog: tools/posts/img → assets/img/blog (chỉ ảnh của bài đã duyệt)
fs.mkdirSync(path.join(ROOT, 'assets/img/blog'), { recursive: true });
for (const p of POSTS) for (const im of p.images) for (const w of [400, 800, 1200]) {
  const src = path.join(ROOT, `tools/posts/img/${im.name}-${w}.webp`);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(ROOT, `assets/img/blog/${im.name}-${w}.webp`));
}
const blogImg = (name, alt, sizes, lazy) => {
  const ws = [400, 800, 1200].filter((w) => fs.existsSync(path.join(ROOT, `tools/posts/img/${name}-${w}.webp`)));
  const big = ws[ws.length - 1];
  return `<img src="/assets/img/blog/${name}-${Math.min(800, big)}.webp" srcset="${ws.map((w) => `/assets/img/blog/${name}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" width="800" height="1000" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async">`;
};
const altOf = (p, n) => (p.images.find((i) => i.name === n) || {}).alt || '';
function postHTML(p) {
  const body = p.body.map(([k, v]) => k === 'p' ? `      <p>${esc(v)}</p>`
    : k === 'h2' ? `      <h2>${esc(v)}</h2>`
    : k === 'ul' ? `      <ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : k === 'img' ? `      <figure class="post__fig">${blogImg(v, altOf(p, v), '(min-width:800px) 720px, 100vw', true)}</figure>` : '').join('\n');
  return `<article class="section post page-first" aria-labelledby="post-title">
  <div class="wrap post__wrap">
    <nav class="crumbs" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><a href="/blog/">Câu chuyện từ tiệm</a></nav>
    <h1 id="post-title" class="post__title">${esc(p.h1)}</h1>
    <figure class="post__fig">${blogImg(p.cover, altOf(p, p.cover), '(min-width:800px) 720px, 100vw', false)}</figure>
    <div class="post__body">
${body}
    </div>
    <p class="post__cta"><a class="btn btn--pink" href="{{ZALO_URL}}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-chat"/></svg>Nhắn Zalo hỏi mẫu này</a> <a class="btn btn--line" href="/san-pham/">Xem các mẫu khác</a></p>
    <p class="post__more">Cách đặt hoa, thời gian nhận hoa: xem <a href="/tro-giup/">Trợ giúp</a>.</p>
  </div>
</article>
`;
}
const blogCard = (p) => `<li><a class="bcard reveal" href="/blog/${p.slug}/"><span class="bcard__img">${blogImg(p.cover, altOf(p, p.cover), '(min-width:1024px) 380px, (min-width:768px) 45vw, 100vw', true)}</span><span class="bcard__t">${esc(p.h1)}</span></a></li>`;
const BLOG_LIST = `<section class="section blog page-first" aria-labelledby="blog-title">
  <div class="wrap">
    <nav class="crumbs" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span aria-current="page">Câu chuyện từ tiệm</span></nav>
    <div class="sec-head reveal"><p class="label">— ✦ BLOG</p><h1 id="blog-title" class="h2">Câu chuyện từ tiệm hoa sáp</h1></div>
    <ul class="bgrid">${POSTS.map(blogCard).join('')}</ul>
  </div>
</section>
`;
// Khối trang chủ: chỉ khi có ít nhất 2 bài đã duyệt
const HOME_STORIES = POSTS.length >= 2 ? `<section class="section stories" aria-labelledby="stories-title">
  <div class="wrap">
    <div class="sec-head reveal"><p class="label">— ✦ BLOG</p><h2 id="stories-title" class="h2">Câu chuyện từ tiệm</h2></div>
    <ul class="bgrid">${POSTS.slice(0, 3).map(blogCard).join('')}</ul>
  </div>
</section>
` : '';

/* ---- Trang chủ: nhóm sản phẩm + lưới mẫu đang có (ảnh nền trắng, theo thứ tự trong products.js) ---- */
const cardSizes = 'sizes="(min-width:1024px) 290px, 46vw"';
const pimg = (p) => img(p.images[0], `${p.name}: ${p.look || ''}`, false).replace('sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"', cardSizes);
const CATS = [
  ['bo-hoa', 'Bó hoa', 'Hồng, cẩm tú cầu, đồng tiền, hoa ly'],
  ['tui-hoa', 'Túi hoa', 'Hoa xếp trong túi kraft, lót ren'],
  ['kem-gau', 'Hoa kèm gấu bông', 'Thỏ bông, gấu tốt nghiệp'],
].filter(([k]) => kieuUsed.includes(k)).map(([k, t, d]) => [k, t, d,
  // ảnh đại diện: mẫu thấy trọn cả bó, ưu tiên mẫu chỉ thuộc đúng nhóm đó
  { 'bo-hoa': REAL.find((p) => p.id === 'sp-19') }[k] || REAL.find((p) => kieuOf(p).join() === k && !['sp-08', 'sp-12'].includes(p.id)) || REAL.find((p) => kieuOf(p).includes(k))]);
const HOME_FEATURED = REAL.length >= 4 ? `<section class="section hcats" aria-labelledby="hcats-title">
  <div class="wrap">
    <h2 id="hcats-title" class="hsec__t reveal">Tiệm có những gì</h2>
    <ul class="cgrid">${CATS.map(([k, t, d, p]) => `<li class="reveal"><a class="ccard" href="/san-pham/?kieu=${k}"><span class="ccard__img">${pimg(p).replace(cardSizes, 'sizes="(min-width:1024px) 390px, 46vw"')}</span><span class="ccard__t">${t}</span><span class="ccard__d">${d}</span></a></li>`).join('')}</ul>
  </div>
</section>
<section class="section featured" aria-labelledby="featured-title">
  <div class="wrap">
    <div class="hsec__head reveal"><h2 id="featured-title" class="hsec__t">Mẫu đang có</h2><a class="hsec__more" href="/san-pham/">Xem tất cả ${REAL.length} mẫu<svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
    <ul class="fgrid">${REAL.slice(0, 8).map((p) => `<li class="reveal"><a class="fcard" href="/san-pham/#${p.id}"><span class="fcard__img">${pimg(p)}</span><span class="fcard__t">${esc(p.name)}</span><span class="fcard__p">Liên hệ báo giá</span></a></li>`).join('')}</ul>
    <p class="featured__more"><a class="btn btn--pink" href="{{ZALO_URL}}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-chat"/></svg>Nhắn Zalo chọn mẫu</a></p>
  </div>
</section>
` : '';
const HERO_P = REAL.find((p) => p.id === 'sp-14') || REAL[0];

/* ---- Các trang (tiêu đề, mô tả lấy từ tools/i18n/<lang>.json) ---- */
const PAGE_DEFS = [
  { key: 'home', path: '' },
  { key: 'gioi-thieu', path: 'gioi-thieu/' },
  { key: 'san-pham', path: 'san-pham/' },
  { key: 'tro-giup', path: 'tro-giup/', fresh: true },
  ...(POLICY_ON ? [{ key: 'chinh-sach', path: 'chinh-sach/', fresh: true }] : []),
  { key: 'lien-he', path: 'lien-he/' },
];
for (const L of LANGS) if (hasPlaceholder(I18N[L].lang_note)) HIDDEN.push(`Bản ${L}: dòng "tiệm trả lời tin nhắn bằng thứ tiếng nào"`);
if (!POLICY_ON) HIDDEN.push('Trang Chính sách (chưa có mục nào đủ thông tin)');
if (!FEEDBACK_ON) HIDDEN.push('Trang Feedback + mục Feedback trên menu (chờ ảnh tin nhắn khách — đợt 2)');
if (!WISH_ON) HIDDEN.push('Nút tim yêu thích (chờ mẫu thật có ảnh — đợt 2)');
// Bản tiếng Anh: chỉ các trang đã ổn định. Trang chưa dịch thì link về bản tiếng Việt.
const PAGE_DEFS_EN = [
  { key: 'home', path: 'en/', tpl: 'en/home' },
  { key: 'gioi-thieu', path: 'en/about/', tpl: 'en/gioi-thieu' },
  { key: 'lien-he', path: 'en/contact/', tpl: 'en/lien-he' },
];
const mkPages = (L, defs) => defs.map((d) => ({ ...d, lang: L, tpl: d.tpl || d.key, name: I18N[L][`page_${d.key}_name`], title: I18N[L][`page_${d.key}_title`], desc: I18N[L][`page_${d.key}_desc`] }));
const BLOG_PAGES = BLOG_ON ? [
  { key: 'blog', path: 'blog/', lang: 'vi', name: 'Câu chuyện từ tiệm', title: 'Câu chuyện từ tiệm hoa sáp – Quỳnh Như Florist', desc: 'Câu chuyện từ tiệm hoa sáp Quỳnh Như Florist tại Thủ Dầu Một: cận cảnh từng mẫu hoa sáp thật, cách phối màu, cách gói và cách đặt mẫu tương tự.', content: BLOG_LIST },
  ...POSTS.map((p) => ({ key: 'blog-' + p.slug, path: `blog/${p.slug}/`, lang: 'vi', name: p.title, title: p.title, desc: p.desc, content: postHTML(p), post: p })),
] : [];
const PAGES_BY_LANG = { vi: [...mkPages('vi', PAGE_DEFS), ...BLOG_PAGES], en: mkPages('en', PAGE_DEFS_EN) };
const PAGES = PAGES_BY_LANG.vi;
const ALL_PAGES = LANGS.flatMap((L) => PAGES_BY_LANG[L]);
const VI_PATH = { feedback: 'feedback/', ...Object.fromEntries(PAGE_DEFS.map((d) => [d.key, d.path])) };
function urlOf(L, key) {
  const pg = (PAGES_BY_LANG[L] || []).find((p) => p.key === key);
  return '/' + (pg ? pg.path : VI_PATH[key] || '');
}
for (const pg of ALL_PAGES) {
  const tl = [...pg.title].length, dl = [...pg.desc].length;
  if (tl > 60) console.warn('⚠ Tiêu đề dài hơn 60 ký tự:', pg.title);
  if (dl > 160) console.warn('⚠ Mô tả dài hơn 160 ký tự:', pg.desc);
  if (pg.fresh && (dl < 120 || dl > 155)) console.warn(`⚠ Mô tả trang ${pg.key} nên dài 120–155 ký tự (đang ${dl})`);
}

// /san-pham/ để noindex cho tới khi có mẫu thật (đang là 20 mẫu tham khảo)
const noindex = (pg) => NOINDEX_LANGS.includes(pg.lang) || (pg.key === 'san-pham' && !HAS_REAL_PRODUCTS);

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
if (HOURS_M) florist.openingHoursSpecification = [{
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: HOURS_M[1].padStart(5, '0'), closes: HOURS_M[2].padStart(5, '0'),
}];
if (!missing(C.EMAIL)) florist.email = C.EMAIL;
const website = { '@type': 'WebSite', '@id': CANONICAL + '#website', url: CANONICAL, name: C.SHOP_NAME, inLanguage: 'vi', publisher: { '@id': CANONICAL + '#florist' } };
function jsonld(pg) {
  const url = CANONICAL + pg.path;
  const crumbs = [{ '@type': 'ListItem', position: 1, name: I18N[pg.lang].nav_home, item: CANONICAL + (pg.lang === 'vi' ? '' : pg.lang + '/') }];
  if (pg.key !== 'home') crumbs.push({ '@type': 'ListItem', position: 2, name: pg.name, item: url });
  const pageType = { 'gioi-thieu': 'AboutPage', 'lien-he': 'ContactPage' }[pg.key] || 'WebPage';
  const graph = [
    florist, website,
    { '@type': pageType, '@id': url + '#webpage', url, name: pg.title, description: pg.desc, inLanguage: pg.lang, isPartOf: { '@id': CANONICAL + '#website' }, about: { '@id': CANONICAL + '#florist' } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs },
  ];
  if (pg.post) graph.push({
    '@type': 'BlogPosting', '@id': url + '#post', headline: pg.post.title, description: pg.post.desc, inLanguage: 'vi',
    image: `${SITE}/assets/img/blog/${pg.post.cover}-800.webp`, mainEntityOfPage: { '@id': url + '#webpage' },
    author: { '@id': CANONICAL + '#florist' }, publisher: { '@id': CANONICAL + '#florist' },
    ...(pg.post.date ? { datePublished: pg.post.date } : {}),
  });
  // FAQPage chỉ gồm các câu đang hiện trên trang
  if (pg.key === 'tro-giup' && FAQ.length) graph.push({
    '@type': 'FAQPage', '@id': url + '#faq',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  });
  // Danh sách sản phẩm chỉ gồm mẫu thật (có ảnh)
  if (pg.key === 'san-pham' && REAL.length) graph.push({
    '@type': 'ItemList', '@id': url + '#danh-sach', name: 'Sản phẩm – Quỳnh Như Florist',
    numberOfItems: REAL.length,
    itemListElement: REAL.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: url + '#' + p.id })),
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

const common = {
  SITE_URL: SITE,
  SITE_HOST: SITE.replace(/^https?:\/\//, ''),
  HERO_SRCSET, HERO_SIZES,
  CRITICAL_CSS: critical,
  PRODUCT_CARDS, FAQ_ITEMS, EMAIL_ROW, FILTERS,
  POLICY_TOC, POLICY_SECTIONS,
  TODAY_QUOTE: esc(TODAY_QUOTE),
  PHONE: C.PHONE, PHONE_DISPLAY: C.PHONE_DISPLAY, ZALO_URL: C.ZALO_URL,
  ADDRESS_FULL: esc(C.ADDRESS_FULL), HOURS: esc(C.HOURS),
  TIKTOK_URL: C.TIKTOK_URL, FACEBOOK_URL: C.FACEBOOK_URL, INSTAGRAM_URL: C.INSTAGRAM_URL,
  MAPS_URL: esc(MAPS_URL),
  ORDER_FORM: FORM_ON ? read('tools/partials/order-form.html') : '',
  STEP_ONE_CHANNEL: FORM_ON ? 'qua Zalo hoặc form' : 'qua Zalo',
};
const STYLE_ASYNC = '<link rel="stylesheet" href="/assets/css/style.css" media="print" onload="this.media=\'all\'">\n<noscript><link rel="stylesheet" href="/assets/css/style.css"></noscript>';
const STYLE_BLOCK = '<link rel="stylesheet" href="/assets/css/style.css">';

// Quét chữ khách nhìn thấy: không được còn chữ giữ chỗ, "Đang cập nhật", "hoa tươi", từ cấm
const BANNED = ['[CHƯA CÓ', 'đang cập nhật', 'hoa tươi', 'rẻ nhất', 'tốt nhất', 'số 1', 'duy nhất', '100%', 'cam kết tuyệt đối',
  'bảo hành trọn đời', 'giá sốc', 'miễn phí 100%', 'chữa lành', 'may mắn tài lộc chắc chắn'];
function scan(name, html) {
  const text = html.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+?(?:alt|title|content|aria-label|placeholder)="([^"]*)"[^>]*>/g, ' $1 ').replace(/<[^>]+>/g, ' ').toLowerCase();
  const bad = BANNED.filter((w) => text.includes(w.toLowerCase()));
  if (bad.length) throw new Error(`Trang ${name} có chữ không được hiện cho khách: ${bad.join(', ')}`);
}

const CHROME = Object.fromEntries(LANGS.map((L) => [L, chromeFor(L)]));
// Nút đổi ngôn ngữ: sang đúng trang tương ứng, chưa dịch thì về trang chủ của ngôn ngữ đó
const LANG_NAMES = { vi: 'Tiếng Việt', en: 'English', zh: '中文', ko: '한국어', ja: '日本語' };
function langLinks(pg) {
  return LANGS.map((L) => {
    const twin = PAGES_BY_LANG[L].find((p) => p.key === pg.key) || PAGES_BY_LANG[L][0];
    return `<li><a href="/${twin.path}" hreflang="${L}" lang="${L}"${L === pg.lang ? ' aria-current="true"' : ''}>${LANG_NAMES[L]}</a></li>`;
  }).join('');
}
// hreflang chỉ cho các ngôn ngữ được index
function hreflang(pg) {
  const langs = LANGS.filter((L) => !NOINDEX_LANGS.includes(L));
  if (langs.length < 2 || NOINDEX_LANGS.includes(pg.lang)) return '';
  return langs.map((L) => PAGES_BY_LANG[L].find((p) => p.key === pg.key)).filter(Boolean)
    .map((p) => `<link rel="alternate" hreflang="${p.lang}" href="${CANONICAL + p.path}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${CANONICAL + (PAGES_BY_LANG.vi.find((p) => p.key === pg.key) || PAGES_BY_LANG.vi[0]).path}">`;
}

for (const pg of ALL_PAGES) {
  const ch = CHROME[pg.lang];
  const tokens = {
    ...common,
    ...tTokensOf(ch.T),
    UBAR: ch.UBAR, NAV_UTIL: ch.NAV_UTIL + `\n      <ul class="nav__langs" aria-label="${esc(ch.T.lang_label)}">${langLinks(pg)}</ul>`,
    MEGA_PANELS: ch.MEGA_PANELS, WISH_BTN: ch.WISH_BTN, WISH_PANEL: ch.WISH_PANEL,
    FOOT_MENU: ch.FOOT_MENU, FOOT_HOURS: ch.FOOT_HOURS, CONTACT_HOURS: ch.CONTACT_HOURS,
    HOME_URL: ch.U('home'),
    LANG_SWITCH: `      <details class="lang"><summary class="lang__btn" aria-label="${esc(ch.T.lang_label)}: ${LANG_NAMES[pg.lang]}">${esc(ch.T.lang_cur)}<svg aria-hidden="true"><use href="#i-arrow"/></svg></summary><ul class="lang__list">${langLinks(pg)}</ul></details>`,
    HREFLANG: hreflang(pg),
    LANG_NOTE: ch.T.lang_note && !hasPlaceholder(ch.T.lang_note) ? `<p class="lang-note">${esc(ch.T.lang_note)}</p>` : '',
    PAGE: pg.key,
    ROBOTS: noindex(pg) ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    TITLE: esc(pg.title), DESC: esc(pg.desc), CANONICAL: CANONICAL + pg.path,
    JSONLD: jsonld(pg),
    NAV_ITEMS: ch.navItems(pg.key),
    // Trang chủ: CSS phần dưới tải sau (hero nằm trong CSS quan trọng); trang con: tải ngay để không nháy giao diện
    STYLE_LINK: pg.key === 'home' ? STYLE_ASYNC : STYLE_BLOCK,
    HERO_PRELOAD: pg.key === 'home' ? '<link rel="preload" as="image" media="(max-width:767.98px)" imagesrcset="/assets/img/hero/hoa-bo-hong-doc-480.webp 480w, /assets/img/hero/hoa-bo-hong-doc-840.webp 840w" imagesizes="100vw" fetchpriority="high">\n<link rel="preload" as="image" media="(min-width:768px)" imagesrcset="/assets/img/hero/hoa-bo-hong-960.webp 960w, /assets/img/hero/hoa-bo-hong-1500.webp 1500w" imagesizes="100vw" fetchpriority="high">\n' : '',
    HOME_STORIES: pg.key === 'home' ? HOME_STORIES : '',
    HOME_FEATURED: pg.key === 'home' && pg.lang === 'vi' ? HOME_FEATURED : '',
    PAGE_EXTRA: pg.key === 'san-pham' ? '\n' + read('tools/partials/product-modal.html') : '',
  };
  const raw = read('tools/partials/head.html') + read('tools/partials/top.html') + (pg.content || read(`tools/pages/${pg.tpl}.html`)) + read('tools/partials/bottom.html');
  // Thay nhiều lượt: phần chèn vào (popup sản phẩm, form) cũng chứa token như {{ZALO_URL}}
  let out = raw;
  for (let pass = 0; pass < 3 && /\{\{[A-Za-z0-9_-]+\}\}/.test(out); pass++) {
    out = out.replace(/\{\{([A-Za-z0-9_-]+)\}\}/g, (m, k) => {
      if (!(k in tokens)) throw new Error(`Thiếu token ${k} (${pg.key})`);
      return tokens[k];
    });
  }
  if (out.includes('{{')) throw new Error(`Còn token chưa thay trong trang ${pg.key}: ` + out.match(/\{\{[^}]*\}\}/)[0]);
  scan(pg.path || 'home', out);
  // Gắn ?v=<mã> vào file tĩnh để cache dài hạn mà vẫn cập nhật ngay khi sửa
  for (const f of ['assets/css/style.css', 'assets/js/config.js', 'assets/js/products.js', 'assets/js/main.js', 'assets/data/loi-chuc.json']) {
    out = out.split(`"/${f}"`).join(`"/${f}?v=${ver(f)}"`);
  }
  if (pg.path) fs.mkdirSync(path.join(ROOT, pg.path), { recursive: true });
  write(pg.path + 'index.html', out);
}

/* ---- Trang cũ /giai-phap/ → /tro-giup/ ---- */
// Chuyển hướng 301 phía máy chủ bằng _redirects (Cloudflare Workers static assets);
// tệp HTML dưới đây chỉ là dự phòng nếu _redirects không chạy.
write('_redirects', `/giai-phap /tro-giup/ 301
/giai-phap/ /tro-giup/ 301
`);
fs.mkdirSync(path.join(ROOT, 'giai-phap'), { recursive: true });
write('giai-phap/index.html', `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Trợ giúp – Quỳnh Như Florist</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${CANONICAL}tro-giup/">
<meta http-equiv="refresh" content="0; url=/tro-giup/">
<script>location.replace('/tro-giup/' + location.hash);</script>
</head>
<body><p><a href="/tro-giup/">Trang Giải pháp đã chuyển sang Trợ giúp</a></p></body>
</html>
`);
if (!POLICY_ON && fs.existsSync(path.join(ROOT, 'chinh-sach/index.html'))) fs.rmSync(path.join(ROOT, 'chinh-sach/index.html'));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ALL_PAGES.filter((pg) => !noindex(pg)).map((pg) => `  <url>
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
scan('404', page404);
write('404.html', page404);

if (!FORM_ON) console.log('ℹ Form đặt hoa đang TẠM ẨN (ORDER_FORM_ENABLED: false)');
if (missing(C.SITE_URL) || /example\.com/.test(C.SITE_URL)) console.warn('⚠ Chưa có tên miền thật — đang dùng', C.SITE_URL);
console.log(`ℹ Ngôn ngữ: ${LANGS.join(', ')} (noindex: ${NOINDEX_LANGS.join(', ') || 'không'})`);
if (SEO_REPORT.length) {
  console.log('\nℹ Checklist SEO 8 bước cho bài blog:');
  for (const [p, r] of SEO_REPORT) {
    console.log(`   ${r.every((x) => x.ok) ? '✅' : '❌'} ${p.slug}`);
    r.forEach((x, i) => console.log(`      ${x.ok ? '✓' : '✗'} ${i + 1}. ${SEO_STEPS[i]}${x.ok ? '' : ' — ' + x.why}`));
  }
}
if (HIDDEN.length) {
  console.log(`\nℹ ${HIDDEN.length} khối đang ẨN vì thiếu thông tin (xem MISSING-INFO.md):`);
  HIDDEN.forEach((h) => console.log('   – ' + h));
}
