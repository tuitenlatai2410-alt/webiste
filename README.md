# Website Quỳnh Như Florist

Website tĩnh (HTML + CSS + JavaScript thuần, Three.js chỉ cho màn chào mừng 3D) cho tiệm hoa **Quỳnh Như Florist** – Thủ Dầu Một, Bình Dương.

## Cấu trúc

Website có 5 trang riêng, trang nào cũng có thanh menu:

| Trang | Đường dẫn | File nội dung (sửa ở đây) |
|---|---|---|
| Trang chủ | `/` | `tools/pages/home.html` |
| Giới thiệu | `/gioi-thieu/` | `tools/pages/gioi-thieu.html` |
| Sản phẩm | `/san-pham/` | `tools/pages/san-pham.html` (20 ô lấy từ `products.js`) |
| Giải pháp + Hỏi đáp | `/giai-phap/` | `tools/pages/giai-phap.html` (câu hỏi đáp nằm trong `tools/build.mjs`) |
| Liên hệ | `/lien-he/` | `tools/pages/lien-he.html` |

Phần dùng chung: `tools/partials/head.html` (thẻ SEO), `top.html` (màn chào mừng, dải thông báo, menu), `bottom.html` (chân trang, nút nổi). Tiêu đề và mô tả SEO từng trang nằm trong `PAGES` ở `tools/build.mjs`.

```
index.html, gioi-thieu/, san-pham/, giai-phap/, lien-he/   ← TẠO TỰ ĐỘNG, đừng sửa tay
404.html, robots.txt, sitemap.xml                           ← cũng tạo tự động
wrangler.jsonc, .assetsignore                               ← cấu hình Cloudflare
assets/css, assets/js, assets/fonts, assets/img
tools/  (build.mjs, images.mjs, make-3d-font.mjs, pages/, partials/)
```

## Cài đặt (1 lần)

Cần [Node.js](https://nodejs.org) 18+.

```bash
npm install
```

## Sửa thông tin → build

1. Sửa `assets/js/config.js` (tên miền, giờ mở cửa, email, khóa form…).
2. Chạy:

```bash
npm run build
```

3. Xem thử: `npm run serve` rồi mở http://localhost:8080

## Thay ảnh sản phẩm

1. Chụp ảnh dọc (tỉ lệ 4:5 là đẹp nhất). Đặt tên theo mã sản phẩm: `sp-01-a.jpg`, `sp-01-b.jpg`…
2. Bỏ ảnh gốc vào `assets/img/products/raw/`, chạy:

```bash
npm run images
```

   → tạo ra `sp-01-a-400.webp`, `-800.webp`, `-1200.webp` (mỗi file ≤ 150KB).
3. Mở `assets/js/products.js`, sửa sản phẩm tương ứng:

```js
{ id: 'sp-01', name: 'Tên thật', category: 'occasion', size: 'Cao 50cm · Rộng 35cm',
  desc: '...', images: ['sp-01-a', 'sp-01-b'], video: 'assets/img/products/sp-01.mp4' },
```

   - `category`: `occasion` = Hoa theo dịp, `table` = Trụ hoa để bàn decor
   - `video` (tùy chọn): file .mp4 ngắn, nhẹ (≤ 3MB), sẽ tự chạy, tắt tiếng, lặp lại trong popup.
4. `npm run build`.

## Form liên hệ (Web3Forms + Cloudflare Turnstile)

1. Vào https://web3forms.com → nhập email nhận đơn → nhận **Access Key** → dán vào `WEB3FORMS_ACCESS_KEY`.
2. Vào Cloudflare Dashboard → **Turnstile** → Add site (tên miền của bạn) → lấy **Site Key** → dán vào `TURNSTILE_SITE_KEY`.
3. `npm run build`.

> Lưu ý: Turnstile ở đây chạy phía trình duyệt (chặn bot đơn giản). Kèm thêm: trường ẩn honeypot, chặn gửi dưới 3 giây, giới hạn 1 lần/60 giây, chặn lời nhắn có từ 2 link trở lên. Web3Forms cũng tự lọc spam phía máy chủ.

## Deploy lên Cloudflare (đang chạy tại https://webiste.tuitenlatai2410.workers.dev)

Repo đã nối với Cloudflare Workers: mỗi lần push lên nhánh `main`, Cloudflare tự build và cập nhật web (cấu hình trong `wrangler.jsonc`; file nội bộ được loại ra bằng `.assetsignore`).

### Cách cũ: Cloudflare Pages

1. Đẩy thư mục này lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → Create → Pages → Connect to Git → chọn repo.
3. Build command: *(để trống)* · Build output directory: `/` (vì `index.html` đã được build sẵn và commit lên).
4. Deploy. Gắn tên miền trong tab **Custom domains**.
5. Nhớ cập nhật `SITE_URL` trong `config.js` → `npm run build` → push lại.

File `_headers` đã cấu hình: cache 1 năm cho `/assets/*` (an toàn vì mỗi lần build, link CSS/JS được gắn mã phiên bản `?v=…`), cache ngắn cho HTML, và các header bảo mật.

*(Netlify cũng đọc được file `_headers` y như vậy.)*

## Sau khi deploy

1. Tạo **Google Business Profile** cho tiệm với tên, địa chỉ và SĐT **khớp y hệt** website:
   - Tên: `Quỳnh Như Florist`
   - Địa chỉ: `324/34, Tổ 3, Khu 4, Phường Phú Lợi, TP. Hồ Chí Minh`
   - SĐT: `0857 380 325`
2. Gửi sitemap (`https://tên-miền/sitemap.xml`) lên **Google Search Console**.
3. Gắn link website vào bio TikTok, Facebook, Instagram.
4. Kiểm tra chia sẻ link: https://developers.facebook.com/tools/debug/ (Facebook/Zalo đọc ảnh og-cover).

## Ghi chú kỹ thuật

- **Lọc sản phẩm qua link:** `/san-pham/?loai=hoa-theo-dip` hoặc `/san-pham/?loai=tru-hoa-de-ban`; mở thẳng 1 mẫu: `/san-pham/#sp-05`.
- **Màn chào mừng 3D:** hiện 1 lần mỗi phiên (ở bất kỳ trang nào khách vào đầu tiên). Tự chuyển sang bản chữ HTML (nhẹ) khi: khách bật giảm chuyển động, máy không có WebGL, trình duyệt không hỗ trợ import map, máy chỉ có WebGL giả lập bằng CPU (không có GPU), hoặc Three.js tải quá 2,2 giây. Muốn xem bản 3D trên máy không có GPU, mở `/?intro3d=force`.
- **Chữ 3D kiểu bong bóng:** font Baloo 2 ExtraBold (Google Fonts, có đủ dấu tiếng Việt). Mỗi chữ được "bơm phồng" từ trường khoảng cách (SDF) nên mép mềm, góc bo tròn. File `assets/fonts/qnf-3d.typeface.json` chỉ chứa các ký tự `Quỳnh Như Florist` (9KB). Nếu đổi chữ, chạy:

```bash
npm run font3d -- duong-dan/Baloo2-ExtraBold.ttf "Chữ mới" assets/fonts/qnf-3d.typeface.json
```

- **Three.js** nạp từ CDN jsDelivr phiên bản cố định `0.160.0` (khai báo trong `tools/build.mjs`).
