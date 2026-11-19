# Bộ quy tắc giao diện – Quỳnh Như Florist

Chốt ngày 19/11/2026. Giữ lâu dài. Chỉ đổi khi có lý do từ khách (xem mục 4).

## 1. Phần CỐ ĐỊNH (không đổi)

| Mục | Quy tắc |
|---|---|
| Màu chính | Hồng `#C2437A` (nút chính, chữ nhấn, nhãn) |
| Màu phụ | Xanh lá sage `#8EA58C` (đường viền, khung ảnh, icon); chữ màu xanh dùng `#4F6A4D` |
| Nền | Trắng phẳng `#FFFFFF` và trắng ngà `#F6F3F0`. Mảng nhạt khác chỉ dùng hồng phấn `#F6D9E3` và sage nhạt `#EAF0E8` |
| Chữ | Tím than `#2B1E27`. Mọi cặp chữ/nền đạt độ tương phản ≥ 4.5:1 |
| Phông chữ | 2 họ: Cormorant Garamond (tiêu đề), Be Vietnam Pro (chữ thường). Không thêm họ thứ ba |
| Bố cục | Phần đầu trang chủ giữ như cũ (chủ web chốt 19/11/2026): bó hoa xanh tách nền giữa, chữ QUYNH NHU FLORIST mờ phía sau, "Tiệm hoa sáp nhỏ" góc trái, ghi chú góc phải, mũi tên và chấm chuyển mẫu. Bên dưới theo phong cách tối giản: 3 hàng ảnh thật 01·02·03, 5 ô mẫu, blog, băng ảnh cuối trang. Trang Sản phẩm: lưới thẻ ảnh nền trắng 4:5, bấm vào mở ảnh lớn thấy trọn bó |
| Hiệu ứng | Các khối hiện mượt khi kéo trang; phần đầu trang chuyển mẫu chậm 6 giây như cũ. Không lắc, không nổi lên xuống, không cánh hoa rơi. Máy bật giảm chuyển động: tắt hiệu ứng |
| Ảnh | Chỉ ảnh thật trong Drive "Hình hoa" do tiệm làm. Ảnh sản phẩm nền trắng; ảnh blog giữ khung cảnh thật. Che thiệp, lời nhắn, mặt người, biển số |
| Giọng viết | Ngắn, thật, nói đúng điều khách cần: mẫu gì, đặt trước bao lâu, nhận ở đâu, nhắn ai. Không hoa mỹ, không tự khen, không hứa điều tiệm chưa xác nhận |

## 2. Phần ĐƯỢC THAY ĐỔI

- Nội dung: mẫu hoa theo mùa, bài blog, câu trả lời hỏi đáp, chính sách khi tiệm có thông tin mới.
- Trải nghiệm đặt hàng: tìm kiếm, bộ lọc, nút Zalo, thông tin giao nhận và thanh toán.
- Không đổi màu, phông, bố cục, hiệu ứng chỉ vì "muốn mới".

## 3. Bài blog

Mỗi bài phải qua checklist SEO 8 bước (`tools/seo-check.mjs`; build in kết quả, bài chưa đạt thì không đăng):

1. **Từ khóa chính:** có trong tiêu đề, H1 và đoạn đầu.
2. **Tiêu đề:** ≤ 60 ký tự.
3. **Mô tả:** 120–155 ký tự.
4. **Đường dẫn:** ngắn, không dấu, có từ khóa.
5. **Cấu trúc:** ngắn. ≥ 2 mục H2, đoạn ≤ 60 chữ, cả bài 120–450 chữ.
6. **Ảnh:** ảnh thật, có chữ thay thế mô tả.
7. **Thông tin đặt hàng:** nói rõ cách đặt (Zalo 0857 380 325) và thời gian đặt trước.
8. **Thật và đúng luật:** có ngày đăng, không chữ giữ chỗ, không từ cấm, không hứa độ bền hay giá khi chưa xác nhận.

Đăng tối đa 1 bài/ngày. Đặt giờ bằng trường `publishAt`, ví dụ `"2026-11-21T12:00:00+07:00"`.

## 4. Khi nào được đổi giao diện

- Đánh giá lại sau mỗi tuần (lần đầu: 26/11/2026).
- **Có phản hồi của khách** về web, ví dụ không tìm thấy mẫu, không biết cách đặt, chữ khó đọc:
  - ghi vào `MISSING-INFO.md` mục "Phản hồi khách": ngày, kênh, nội dung
  - sửa đúng chỗ khách nói
- **Không có phản hồi:** giữ nguyên giao diện, câu chữ và hình ảnh đang dùng.
