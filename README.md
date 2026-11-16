# Website Quỳnh Như Florist

Website tĩnh (HTML + CSS + JavaScript thuần) cho tiệm hoa **Quỳnh Như Florist** – Thủ Dầu Một, Bình Dương.

## Cấu trúc

| Trang | Đường dẫn | File nội dung (sửa ở đây) |
|---|---|---|
| Trang chủ | `/` | `tools/pages/home.html` |
| Giới thiệu | `/gioi-thieu/` | `tools/pages/gioi-thieu.html` |
| Sản phẩm | `/san-pham/` | `tools/pages/san-pham.html` (ô sản phẩm, bộ lọc lấy từ `products.js`) |
| Trợ giúp (quy trình + 30 câu hỏi) | `/tro-giup/` | `tools/pages/tro-giup.html` + câu hỏi ở `tools/content/tro-giup.mjs` |
| Chính sách | `/chinh-sach/` | `tools/pages/chinh-sach.html` + nội dung ở `tools/content/chinh-sach.mjs` |
| Liên hệ | `/lien-he/` | `tools/pages/lien-he.html` |

- `/giai-phap/` (trang cũ) tự chuyển sang `/tro-giup/` (tệp `_redirects`, chuyển hướng 301).
- Phần dùng chung: `tools/partials/head.html` (thẻ SEO), `top.html` (màn chào, thanh tiện ích, menu), `bottom.html` (chân trang, nút nổi).
- **Chữ dùng chung** (menu, thanh tiện ích, nút, tiêu đề và mô tả SEO từng trang): `tools/i18n/vi.json`. Sau này thêm thứ tiếng: tạo `en.json` cùng khóa.
- **Thông tin còn thiếu tự ẩn:** câu hỏi, mục chính sách nào còn chữ `[CHƯA CÓ – …]` thì web không hiện. Mỗi lần build, cuối màn hình in danh sách khối đang ẩn. Trả lời xong: thay chữ đó bằng câu trả lời thật, build lại.
- **Build tự kiểm:** nếu trang có chữ `[CHƯA CÓ`, "Đang cập nhật", "hoa tươi" hoặc từ cấm, build dừng và báo lỗi.

```
index.html, gioi-thieu/, san-pham/, tro-giup/, chinh-sach/, lien-he/, giai-phap/   ← TẠO TỰ ĐỘNG, đừng sửa tay
404.html, robots.txt, sitemap.xml, _redirects                                     ← cũng tạo tự động
wrangler.jsonc, .assetsignore                                                     ← cấu hình Cloudflare
assets/css, assets/js, assets/fonts, assets/img
tools/  (build.mjs, images.mjs, pages/, partials/, content/, i18n/)
```

## Cài đặt (1 lần)

Cần [Node.js](https://nodejs.org) 18+. Bước build không cần cài thư viện nào. Chỉ khi tối ưu ảnh mới cần:

```bash
npm i --no-save sharp
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

> Hiện **đang tạm ẩn** (`ORDER_FORM_ENABLED: false` trong `config.js`). Bật lại sau khi xong thủ tục pháp lý (xem `MISSING-INFO.md`).

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

- **Lọc sản phẩm qua link:** `?loai=hoa-theo-dip | tru-hoa-de-ban`, `?dip=sinh-nhat`, `?mau=hong`, `?nb=hot | ban-chay`, `?q=tulip` (ghép được: `/san-pham/?loai=hoa-theo-dip&dip=sinh-nhat`); mở thẳng 1 mẫu: `/san-pham/#sp-05`.
- **Nút lọc chỉ hiện khi có dữ liệu:** "Dịp" lấy từ trường `occasions`; "Màu", "Hot trend", "Bán chạy" chỉ hiện khi có mẫu thật (có ảnh) mang giá trị đó. Nhãn `hot`, `ban-chay` do chủ tiệm gắn.
- **Tìm kiếm:** theo tên hoa (`flowers`), màu (`colors`), dịp, tên mẫu, `keywords`, có bảng từ đồng nghĩa (ví dụ "thầy cô" → 20/11, "valentine" → kỷ niệm) trong `assets/js/main.js` (`SYN`).
- **Tim yêu thích:** chỉ hiện khi có mẫu thật; danh sách lưu trên trình duyệt của khách (localStorage), nút "Sao chép danh sách" để dán vào Zalo.
- **`/san-pham/` đang noindex** (chưa có mẫu thật). Có mẫu thật có ảnh thì tự bật index lại.
- **Màn chào mừng:** chữ "Quỳnh Như Florist", hiện 1 lần mỗi phiên, tổng cộng tối đa 1 giây; không hiện khi máy bật giảm chuyển động.
- **Font:** 2 họ chữ, 5 tệp trong `assets/fonts/` (Be Vietnam Pro 400 · 600; Cormorant Garamond 600 · 700 · nghiêng 600). Mỗi tệp gồm cả chữ Latin và tiếng Việt.

## Lời chúc mỗi ngày (khối "Lời chúc hôm nay" cuối trang chủ)
- Kho 100 câu nằm ở `assets/data/loi-chuc.json` (mỗi dòng một câu, giữ dấu ngoặc kép và dấu phẩy).
- Mỗi ngày (theo giờ Việt Nam) web tự hiện 1 câu, xoay vòng hết 100 câu rồi lặp lại. Không cần đẩy web lại mỗi ngày.
- Muốn thêm/sửa câu: sửa file trên rồi đẩy lên GitHub như bình thường.
