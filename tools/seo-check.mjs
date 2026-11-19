// CHECKLIST SEO 8 BƯỚC cho bài blog — chạy tự động mỗi lần build.
// Bài thiếu bất kỳ bước nào thì KHÔNG được đăng (build ẩn bài và in lý do).
// Giọng viết: ngắn, thật, đủ thông tin khách cần. Không viết hoa mỹ.
//
//  1. Từ khóa chính   — trường "keyword"; có trong tiêu đề, H1 và đoạn đầu tiên
//  2. Tiêu đề Google  — dưới hoặc bằng 60 ký tự
//  3. Mô tả Google    — 120–155 ký tự
//  4. Đường dẫn       — ngắn (≤ 60 ký tự), không dấu, chỉ a-z 0-9 và gạch nối, có từ khóa
//  5. Cấu trúc ngắn   — 1 H1 (≤ 70 ký tự), ít nhất 2 mục H2, mỗi đoạn ≤ 60 chữ, cả bài 120–450 chữ
//  6. Ảnh thật        — có ảnh bìa; mọi ảnh có chữ thay thế mô tả (≥ 20 ký tự) và đủ bản 400, 800
//  7. Hướng dẫn đặt   — bài nói rõ cách đặt (Zalo 0857 380 325) và thời gian đặt trước;
//                       trang bài tự có link sang Sản phẩm và Trợ giúp
//  8. Thật & đúng luật — có ngày đăng; không chữ giữ chỗ, không từ cấm, không hứa độ bền hay giá
//                       khi tiệm chưa xác nhận
import fs from 'node:fs';
import path from 'node:path';

const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const BANNED = ['rẻ nhất', 'tốt nhất', 'số 1', 'duy nhất', '100%', 'cam kết tuyệt đối', 'bảo hành trọn đời', 'giá sốc',
  'chữa lành', 'may mắn tài lộc chắc chắn', 'hoa tươi', 'vĩnh viễn', 'mãi mãi'];
// Câu về độ bền, giá: chỉ được viết khi tiệm đã xác nhận (đặt "confirmed": ["do-ben", "gia"] trong bài)
const DURABILITY = /(giữ (được )?(màu|dáng) (bao lâu|\d)|\d+\s*(năm|tháng) (vẫn|không)|độ bền)/i;
const PRICE = /(\d[\d.,]*\s*(k|nghìn|ngàn|triệu|đ|đồng|vnđ)(?![\p{L}\p{M}])|giá (chỉ|từ|khoảng))/iu;

export const SEO_STEPS = ['Từ khóa chính', 'Tiêu đề ≤ 60', 'Mô tả 120–155', 'Đường dẫn', 'Cấu trúc ngắn', 'Ảnh thật', 'Hướng dẫn đặt', 'Thật & đúng luật'];

export function seoCheck(p, root) {
  const res = [];
  const add = (ok, why) => res.push({ ok: !!ok, why: ok ? '' : why });
  const paras = p.body.filter(([k]) => k === 'p').map(([, v]) => v);
  const text = p.body.map(([k, v]) => (k === 'ul' ? v.join(' ') : k === 'img' ? '' : v)).join(' ');
  const kw = fold(p.keyword || '');
  // 1
  add(kw && fold(p.title).includes(kw) && fold(p.h1).includes(kw) && paras[0] && fold(paras[0]).includes(kw),
    !kw ? 'chưa có "keyword"' : `từ khóa "${p.keyword}" phải có trong tiêu đề, H1 và đoạn đầu`);
  // 2
  add([...p.title].length <= 60, `tiêu đề ${[...p.title].length} ký tự (> 60)`);
  // 3
  const dl = [...p.desc].length;
  add(dl >= 120 && dl <= 155, `mô tả ${dl} ký tự (cần 120–155)`);
  // 4
  const kwSlugWords = kw.split(/\s+/).filter((w) => w.length > 1);
  add(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug) && p.slug.length <= 60 && kwSlugWords.filter((w) => p.slug.split('-').includes(w)).length >= Math.min(2, kwSlugWords.length),
    'đường dẫn phải ngắn, không dấu và chứa từ khóa');
  // 5
  const h2 = p.body.filter(([k]) => k === 'h2').length, total = words(text) + words(p.h1);
  const longPara = paras.find((t) => words(t) > 60);
  add([...p.h1].length <= 70 && h2 >= 2 && !longPara && total >= 120 && total <= 450,
    `H1 ≤ 70, ≥ 2 mục H2 (đang ${h2}), đoạn ≤ 60 chữ${longPara ? ' (có đoạn quá dài)' : ''}, cả bài 120–450 chữ (đang ${total})`);
  // 6
  const imgs = p.images || [];
  const missingImg = imgs.find((i) => ![400, 800].every((w) => fs.existsSync(path.join(root, `tools/posts/img/${i.name}-${w}.webp`))));
  add(p.cover && imgs.some((i) => i.name === p.cover) && imgs.every((i) => (i.alt || '').length >= 20) && !missingImg,
    missingImg ? `thiếu tệp ảnh ${missingImg.name}` : 'cần ảnh bìa và chữ thay thế ảnh ≥ 20 ký tự');
  // 7
  add(/zalo/i.test(text) && /0857\s?380\s?325/.test(text) && /(đặt trước|nhận ngay|có sẵn)/i.test(text),
    'bài phải nói cách đặt (Zalo 0857 380 325) và thời gian đặt trước');
  // 8
  const conf = p.confirmed || [];
  const all = [p.title, p.desc, p.h1, text].join(' ').toLowerCase();
  const bad = BANNED.filter((w) => all.includes(w));
  const ph = /\[CHƯA CÓ/.test(JSON.stringify(p));
  const dur = !conf.includes('do-ben') && DURABILITY.test(all), price = !conf.includes('gia') && PRICE.test(all);
  add(p.date && !bad.length && !ph && !dur && !price,
    !p.date ? 'thiếu ngày đăng' : ph ? 'còn chữ giữ chỗ' : bad.length ? `có từ cấm: ${bad.join(', ')}` : dur ? 'có câu về độ bền chưa xác nhận' : 'có giá chưa xác nhận');
  return res;
}
