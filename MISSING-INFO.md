# THÔNG TIN CÒN THIẾU — Quỳnh Như Florist

Các mục dưới đây đang để placeholder `[CHƯA CÓ – …]` hoặc giá trị tạm. Chủ web bổ sung rồi chạy `node tools/build.mjs`.

| # | Thông tin | Đang để tạm | Sửa ở đâu |
|---|---|---|---|
| 1 | **Tên miền riêng** | Đang dùng tên miền tạm `https://webiste.tuitenlatai2410.workers.dev` (canonical, Open Graph, schema, sitemap, robots đều dùng giá trị này) | `assets/js/config.js` → `SITE_URL` |
| 2 | **Logo** | Chữ "Quỳnh Như *Florist*" font Cormorant + favicon bông hoa SVG tự vẽ | `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, menu trong `tools/index.template.html` |
| 3 | **Ảnh / video sản phẩm thật, tên, kích thước thật (20 mẫu)** | 20 ô placeholder gradient + "Ảnh sẽ cập nhật"; tên & kích thước là dữ liệu mẫu | `assets/js/products.js` (+ `node tools/images.mjs`) |
| 4 | **Giờ mở cửa** | `[CHƯA CÓ – giờ mở cửa]` — **đang hiện đúng chữ này trên web** ở khối Liên hệ | `config.js` → `HOURS` |
| 5 | **Email liên hệ** (nếu có) | `[CHƯA CÓ – email]` → dòng Email đang **ẩn** | `config.js` → `EMAIL` |
| 6 | **Link Google Maps chính xác** | `[CHƯA CÓ – link Google Maps]` → tạm dùng link tìm kiếm theo địa chỉ | `config.js` → `MAPS_URL` |
| 7 | **Web3Forms access key** | `[CHƯA CÓ – Web3Forms access key]` → form **chưa gửi được**, khách sẽ thấy thông báo lỗi kèm nút Zalo | `config.js` → `WEB3FORMS_ACCESS_KEY` |
| 7b | **Cloudflare Turnstile site key** | `[CHƯA CÓ – Turnstile site key]` → ô xác minh chống bot chưa hiện (honeypot, chặn < 3 giây, giới hạn 60 giây, chặn ≥ 2 link vẫn hoạt động) | `config.js` → `TURNSTILE_SITE_KEY` |
| 8 | **Ảnh chia sẻ mạng xã hội** (og-cover 1200×630) | Ảnh tạm do web tự tạo (nền đen, chữ hồng "Quỳnh Như Florist") | `assets/img/og-cover.jpg` |
| 9 | **Có giao hoa tận nơi không, phạm vi giao** | Web chỉ ghi "Nhận tại tiệm hoặc trao đổi thêm về giao hoa" | Quy trình bước 4 trong `tools/index.template.html` |

## Cần chủ web xác nhận thêm

- **Định dạng địa chỉ:** phần Liên hệ, Footer, FAQ dùng chung một chuỗi `324/34, Tổ 3, Khu 4, Phường Phú Lợi, TP. Hồ Chí Minh` (theo mục [I] của prompt). Schema dùng tách trường, `addressRegion` = "Thành phố Hồ Chí Minh". Khi tạo Google Business Profile, nên nhập đúng y chuỗi này.
- **Trang Facebook** đang là dạng `profile.php?id=…`. Nếu sau này đổi sang tên trang (username), cập nhật `FACEBOOK_URL`.
