// Tối ưu ảnh sản phẩm: bỏ ảnh gốc (.jpg/.png/.webp/.heic) vào assets/img/products/raw/
// đặt tên theo mẫu: sp-01-a.jpg, sp-01-b.jpg ...  rồi chạy: node tools/images.mjs
// Kết quả: sp-01-a-400.webp, sp-01-a-800.webp, sp-01-a-1200.webp (mỗi file ≤ 150KB, tỉ lệ 4:5)
// Sau đó thêm "sp-01-a" vào images: [] của sản phẩm trong assets/js/products.js và chạy node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('assets/img/products');
const RAW = path.join(DIR, 'raw');
const MAX = 150 * 1024;
if (!fs.existsSync(RAW)) { fs.mkdirSync(RAW, { recursive: true }); console.log('Đã tạo thư mục', RAW, '— bỏ ảnh gốc vào đây rồi chạy lại.'); process.exit(0); }

for (const file of fs.readdirSync(RAW)) {
  if (!/\.(jpe?g|png|webp|heic|avif)$/i.test(file)) continue;
  const base = file.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  for (const w of [400, 800, 1200]) {
    let q = 82, buf;
    do {
      buf = await sharp(path.join(RAW, file)).rotate().resize(w, Math.round(w * 1.25), { fit: 'cover', position: 'attention' }).webp({ quality: q }).toBuffer();
      q -= 6;
    } while (buf.length > MAX && q > 30);
    const out = path.join(DIR, `${base}-${w}.webp`);
    fs.writeFileSync(out, buf);
    console.log('✓', path.relative(process.cwd(), out), Math.round(buf.length / 1024) + 'KB');
  }
}
