/* =========================================================
   DỮ LIỆU 20 SẢN PHẨM (mẫu tạm — chủ web thay sau)
   - category: "occasion" = Hoa theo dịp, "table" = Trụ hoa để bàn decor
   - images: tên ảnh đã tối ưu trong assets/img/products/ (không ghi đuôi),
       ví dụ ["sp-01-a", "sp-01-b"] ứng với các file
       sp-01-a-400.webp, sp-01-a-800.webp, sp-01-a-1200.webp
       (chạy node tools/images.mjs để tạo tự động — xem README)
   - video: đường dẫn video .mp4 ngắn, ví dụ "assets/img/products/sp-01.mp4"
   - flowers: loại hoa, ví dụ ['hoa hồng', 'tulip']   (dùng cho ô tìm kiếm)
   - colors: màu, ví dụ ['hồng', 'trắng']             (tìm kiếm + bộ lọc "Màu" khi là mẫu thật có ảnh)
   - occasions: dịp, chọn trong: sinh-nhat, tot-nghiep, ky-niem, chuc-mung, cam-on,
       8-3, 20-10, 20-11, tiec-cuoi, su-kien         (bộ lọc "Dịp")
   - tags: 'hot' (Hot trend) và/hoặc 'ban-chay' (Bán chạy) — CHỈ chủ tiệm gắn, cho mẫu thật
   - keywords: từ khóa thêm cho ô tìm kiếm, ví dụ ['người yêu', 'valentine']
   Mẫu chưa có ảnh (images: []) là mẫu tham khảo: không hiện kích thước, không có nút tim.
   Sửa xong chạy: node tools/build.mjs
   ========================================================= */
window.QNF_PRODUCTS = [
  { id: 'sp-01', name: 'Bó hoa hồng Pastel', category: 'occasion', size: 'Cao 50cm · Rộng 35cm', flowers: ['hoa hồng'], colors: ['pastel'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-02', name: 'Bó hoa Sinh nhật Ngọt ngào', category: 'occasion', size: 'Cao 45cm · Rộng 30cm', flowers: [], colors: [], occasions: ['sinh-nhat'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-03', name: 'Bó hoa Kỷ niệm Tình yêu', category: 'occasion', size: 'Cao 55cm · Rộng 40cm', flowers: [], colors: [], occasions: ['ky-niem'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-04', name: 'Bó hoa Tốt nghiệp Rạng rỡ', category: 'occasion', size: 'Cao 50cm · Rộng 35cm', flowers: [], colors: [], occasions: ['tot-nghiep'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-05', name: 'Bó hoa Tulip Trắng', category: 'occasion', size: 'Cao 45cm · Rộng 25cm', flowers: ['tulip'], colors: ['trắng'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-06', name: 'Bó hoa Baby Mây hồng', category: 'occasion', size: 'Cao 40cm · Rộng 35cm', flowers: ['baby'], colors: ['hồng'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-07', name: 'Giỏ hoa Chúc mừng', category: 'occasion', size: 'Cao 45cm · Rộng 35cm', flowers: [], colors: [], occasions: ['chuc-mung'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-08', name: 'Hộp hoa Hồng Đen – Trắng', category: 'occasion', size: '25 × 25cm', flowers: ['hoa hồng'], colors: ['đen', 'trắng'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-09', name: 'Bó hoa Cẩm tú cầu', category: 'occasion', size: 'Cao 45cm · Rộng 35cm', flowers: ['cẩm tú cầu'], colors: [], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-10', name: 'Bó hoa Mini Xinh', category: 'occasion', size: 'Cao 30cm · Rộng 20cm', flowers: [], colors: [], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-11', name: 'Bó hoa Hướng dương', category: 'occasion', size: 'Cao 50cm · Rộng 30cm', flowers: ['hướng dương'], colors: [], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-12', name: 'Bó hoa Lời cảm ơn', category: 'occasion', size: 'Cao 45cm · Rộng 30cm', flowers: [], colors: [], occasions: ['cam-on'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-13', name: 'Trụ hoa để bàn Hồng Pastel', category: 'table', size: 'Cao 40cm · Đường kính 25cm', flowers: [], colors: ['hồng', 'pastel'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-14', name: 'Trụ hoa để bàn Trắng Thanh lịch', category: 'table', size: 'Cao 40cm · Đường kính 25cm', flowers: [], colors: ['trắng'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-15', name: 'Trụ hoa để bàn Tiệc cưới', category: 'table', size: 'Cao 60cm · Đường kính 30cm', flowers: [], colors: [], occasions: ['tiec-cuoi'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-16', name: 'Trụ hoa để bàn Sự kiện', category: 'table', size: 'Cao 50cm · Đường kính 30cm', flowers: [], colors: [], occasions: ['su-kien'], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-17', name: 'Trụ hoa để bàn Mini', category: 'table', size: 'Cao 25cm · Đường kính 15cm', flowers: [], colors: [], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-18', name: 'Trụ hoa để bàn Hồng – Xám', category: 'table', size: 'Cao 45cm · Đường kính 25cm', flowers: [], colors: ['hồng', 'xám'], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-19', name: 'Trụ hoa để bàn Lễ tân', category: 'table', size: 'Cao 55cm · Đường kính 30cm', flowers: [], colors: [], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
  { id: 'sp-20', name: 'Trụ hoa để bàn Bàn tiệc dài', category: 'table', size: 'Dài 80cm · Cao 20cm', flowers: [], colors: [], occasions: [], tags: [], keywords: [], desc: 'Mẫu tham khảo — tiệm sẽ tư vấn hoa và màu theo dịp của bạn.', images: [], video: '' },
];

/* Tên hiển thị của các dịp (dùng cho bộ lọc, menu Sản phẩm, ô tìm kiếm) */
window.QNF_OCCASIONS = {
  'sinh-nhat': 'Sinh nhật',
  'tot-nghiep': 'Tốt nghiệp',
  'ky-niem': 'Kỷ niệm',
  'chuc-mung': 'Chúc mừng – Khai trương',
  'cam-on': 'Lời cảm ơn',
  '8-3': '8/3 – Quốc tế Phụ nữ',
  '20-10': '20/10 – Phụ nữ Việt Nam',
  '20-11': '20/11 – Nhà giáo Việt Nam',
  'tiec-cuoi': 'Tiệc cưới',
  'su-kien': 'Sự kiện',
};
