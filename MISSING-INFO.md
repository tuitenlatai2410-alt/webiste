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
| 7 | **Web3Forms access key** | `[CHƯA CÓ – Web3Forms access key]`. Form đặt hoa hiện **đang tạm ẩn** (`ORDER_FORM_ENABLED: false`) | `config.js` → `WEB3FORMS_ACCESS_KEY` |
| 7b | **Cloudflare Turnstile site key** | `[CHƯA CÓ – Turnstile site key]` → ô xác minh chống bot chưa hiện (honeypot, chặn < 3 giây, giới hạn 60 giây, chặn ≥ 2 link vẫn hoạt động) | `config.js` → `TURNSTILE_SITE_KEY` |
| 8 | **Ảnh chia sẻ mạng xã hội** (og-cover 1200×630) | Ảnh tạm do web tự tạo (nền đen, chữ hồng "Quỳnh Như Florist") | `assets/img/og-cover.jpg` |
| 9 | **Có giao hoa tận nơi không, phạm vi giao** | Web chỉ ghi "Nhận tại tiệm hoặc trao đổi thêm về giao hoa" | Quy trình bước 4 trong `tools/index.template.html` |

## Cần chủ web xác nhận thêm

- **Định dạng địa chỉ:** phần Liên hệ, Footer, FAQ dùng chung một chuỗi `324/34, Tổ 3, Khu 4, Phường Phú Lợi, TP. Hồ Chí Minh` (theo mục [I] của prompt). Schema dùng tách trường, `addressRegion` = "Thành phố Hồ Chí Minh". Khi tạo Google Business Profile, nên nhập đúng y chuỗi này.
- **Trang Facebook** đang là dạng `profile.php?id=…`. Nếu sau này đổi sang tên trang (username), cập nhật `FACEBOOK_URL`.

## Pháp lý & vận hành (chủ web cần làm — web có thể bị phạt/gỡ nếu bỏ qua)

| # | Việc | Vì sao | Ưu tiên |
|---|---|---|---|
| P1 | Xác định website có phải **thông báo website TMĐT bán hàng** không (web có form đặt hoa). Nếu có: thông báo trước khi chạy chính thức | Luật Thương mại điện tử 122/2025/QH15 hiệu lực 01/7/2026: web bán hàng có chức năng đặt hàng trực tuyến phải thông báo. Cơ quan tiếp nhận đang chuyển đổi — hỏi Sở Công Thương TP.HCM hoặc luật sư | Cao |
| P2 | Giấy đăng ký **hộ kinh doanh** (hoặc mã số thuế cá nhân) để làm hồ sơ P1 và hiện trên web | Hồ sơ thông báo web cần giấy tờ kinh doanh | Cao |
| P3 | Nội dung **chính sách bảo mật dữ liệu** + ô "Tôi đồng ý" ở form | Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (hiệu lực 01/01/2026): form thu họ tên, số điện thoại; dữ liệu gửi qua Web3Forms (máy chủ nước ngoài) | Cao |
| P4 | Chính sách giao hàng, đổi/hoàn, thanh toán (nếu web bán hàng phải hiển thị) | Thường là điều kiện của hồ sơ P1 | Trung bình |
| P5 | Tên miền riêng (mua đứng tên chủ tiệm) | Đang dùng tên miền tạm của Cloudflare | Trung bình |
| P6 | Bật xác thực 2 lớp (2FA) cho Gmail, GitHub, Cloudflare | Mất 1 tài khoản là mất quyền sửa/giữ web | Cao |

> **Form đặt hoa đang tạm ẩn.** Khách liên hệ qua Zalo / gọi điện / mạng xã hội. Khi xong P1–P3 và có khóa Web3Forms: đặt `ORDER_FORM_ENABLED: true` trong `assets/js/config.js` → `node tools/build.mjs` → push.

## Hoa sáp
- Toàn bộ web đã chuyển sang hoa sáp (không còn cụm "hoa tươi"). [CHƯA CÓ – ảnh và tên các mẫu hoa sáp thật]: trang Sản phẩm vẫn đang dùng 20 mẫu tham khảo.

## Zalo Official Account (OA)
- [CHƯA CÓ – link Zalo OA]: hiện link Zalo là số cá nhân (zalo.me/0857380325). Khi tiệm đăng ký Zalo OA, thay `ZALO_URL` trong `assets/js/config.js` bằng link OA (dạng zalo.me/<mã OA>) và thay ảnh `assets/img/zalo-qr.png/.webp` bằng mã QR của OA.
