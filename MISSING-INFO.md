# THÔNG TIN CÒN THIẾU — Quỳnh Như Florist

Các mục dưới đây đang để placeholder `[CHƯA CÓ – …]` hoặc giá trị tạm. Chủ web bổ sung rồi chạy `node tools/build.mjs`.

| # | Thông tin | Đang để tạm | Sửa ở đâu |
|---|---|---|---|
| 1 | **Tên miền riêng** | Đang dùng tên miền tạm `https://webiste.tuitenlatai2410.workers.dev` (canonical, Open Graph, schema, sitemap, robots đều dùng giá trị này) | `assets/js/config.js` → `SITE_URL` |
| 2 | **Logo** | Chữ "Quỳnh Như *Florist*" font Cormorant + favicon bông hoa SVG tự vẽ | `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, menu trong `tools/index.template.html` |
| 3 | **Tên và kích thước 20 mẫu** | ✅ Đã có ảnh thật từ Drive "Hình hoa" (17/11/2026). **Tên mẫu là tên tạm** đặt theo màu và kiểu gói; **kích thước** đang `[CHƯA CÓ – kích thước]` nên web ẩn | `assets/js/products.js` (trường `name`, `size`) |
| 4 | **Giờ mở cửa** | ✅ `07:00 – 22:00` (chủ web xác nhận 16/11/2026). **Còn hỏi:** giờ này áp dụng cả cuối tuần và ngày lễ không? (schema đang ghi đủ 7 ngày) | `config.js` → `HOURS` |
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

## Thông tin đang ẩn trên web (chờ chủ web trả lời)

Mỗi câu trả lời mở khóa một phần đang ẩn. Trả lời xong: sửa chữ `[CHƯA CÓ – …]` tương ứng trong `tools/content/tro-giup.mjs` hoặc `tools/content/chinh-sach.mjs`, rồi `node tools/build.mjs`.

| # | Câu hỏi | Mở khóa |
|---|---|---|
| 1 | Hoa sáp của tiệm giữ dáng và màu bao lâu, trong điều kiện nào? Ảnh hưởng của máy lạnh, nắng? Cách lau bụi, bảo quản? Có mùi không? | 4 câu nhóm "Hoa sáp và bảo quản"; phần bảo quản trong blog |
| 2 | Có đặt cọc không, bao nhiêu phần trăm? | Trợ giúp › Thanh toán; Chính sách › Thanh toán |
| 3 | Giao ở khu vực nào, phí bao nhiêu? Có nhận tại tiệm không? | Trợ giúp › Giao nhận; Chính sách › Giao nhận |
| 4 | Quy cách đóng gói khi giao? | Như trên |
| 5 | Chính sách đổi hoặc sửa mẫu sau khi chốt? Nhận rồi chưa ưng thì sao? | Trợ giúp › Đổi, sửa mẫu; Chính sách › Đổi, sửa mẫu |
| 6 | Giờ 07:00 – 22:00 áp dụng cả cuối tuần và ngày lễ? | Chỉnh schema giờ mở cửa |
| 7 | Ruy băng in chữ CHANEL: tiệm đang dùng cho khách hay chỉ có trong ảnh đó? | Ảnh hộp hoa đỏ (đang thay tạm ở hero mẫu 3) |
| 8 | Khách trong các ảnh chụp tin nhắn đã đồng ý cho đăng chưa? | Trang Feedback (đợt 2) |
| 9 | Tiệm trả lời tin nhắn được bằng những thứ tiếng nào? | Dòng ghi chú trên trang `/en/contact/` (khóa `lang_note` trong `tools/i18n/en.json`) |
| 10 | 中文 dùng giản thể hay phồn thể? | Đợt 3 |
| 11 | Giá khoảng bao nhiêu cho từng loại? Có mức cho sinh viên không? | Trợ giúp › Giá |
| 12 | Có nhận làm gấp mẫu theo yêu cầu không? | Trợ giúp › Làm gấp |
| 13 | Có viết thiệp, kèm gấu bông hay quà tặng không? | Trợ giúp › Thiệp, quà |
| 14 | Có xuất hóa đơn không? Khách ghé xem trực tiếp được không? | 2 câu Trợ giúp |
| 15 | Cách thanh toán (chuyển khoản, tiền mặt…) và cách gửi thông tin chuyển khoản? Đề xuất: không in số tài khoản lên web, gửi qua Zalo khi chốt mẫu | Trợ giúp › Thanh toán; Chính sách › Thanh toán |
| 16 | Ảnh trong Drive "Hình hoa" đều do tiệm tự chụp sản phẩm của tiệm? | Sản phẩm thật, blog (đợt 2) |
| 17 | Tên kênh: web "Quỳnh Như Florist", TikTok @tiemhoanhonee, Instagram @tiemhoanhoxinhdayy — giữ hai tên hay thống nhất? | — |
| 18 | Khi nào mua tên miền thật? | Đợt 3 chờ việc này |
| 19 | Gợi ý của tiệm khi tặng thầy cô dịp 20/11? | Trợ giúp › 20/11 |

**Chờ ảnh (đợt 2):** thư mục Drive "Hình hoa" hiện trống. Khi có ảnh: sản phẩm thật (bật lại index `/san-pham/`, nút tim, lọc Màu / Hot trend / Bán chạy), blog 3 bài, trang Feedback (cần ≥ 3 ảnh tin nhắn đạt, đã che thông tin khách).

## Ảnh trong Drive "Hình hoa" (cập nhật 17/11/2026)
- Mình đã xem khoảng 40/270 ảnh, chọn 20 mẫu khác nhau cho trang Sản phẩm. Đã làm mờ thiệp, lời nhắn riêng của khách và cắt bỏ phần có người, biển số, đồng hồ xe.
- **Đã loại vì có dấu hiệu là ảnh của tiệm khác:** ảnh có logo + số điện thoại "Như Thảo Flower & Gift – Hải Phòng"; ảnh có thẻ "Favorite Flowers"; ảnh có thẻ "Floral Sense"; ảnh gắn số "385" chụp cạnh hộp CHANEL.
- **Cần chủ web xác nhận:** 20 ảnh đang dùng đều là hoa do tiệm làm và tiệm tự chụp. Ảnh nào không phải, báo để gỡ.
- Chưa thấy ảnh chụp tin nhắn khách → trang Feedback chưa mở. Đề xuất để ảnh tin nhắn vào thư mục con "Feedback".

## Cần chủ tiệm viết (vài câu, lời thật) — mở khóa bài "Câu chuyện của tiệm"
Mẫu sẵn: `tools/posts/_MAU-cau-chuyen-cua-tiem.json.txt`.
1. Vì sao bạn mở tiệm hoa sáp?
2. Bạn chọn hoa, chọn màu cho một bó như thế nào?
3. Điều gì tiệm không bao giờ làm?
4. Giao hàng ở khu vực nào? (giá có thể bỏ, không cần khung giá)
5. Khách thanh toán bằng cách nào?
6. Nếu hoa không đúng mẫu đã chốt, tiệm xử lý thế nào?

## Phản hồi khách về website
(Ghi ngày · kênh · nội dung. Đánh giá lại mỗi tuần, lần đầu 26/11/2026 — xem QUY-TAC-GIAO-DIEN.md mục 4.)
