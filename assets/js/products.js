/* =========================================================
   DỮ LIỆU 20 MẪU THẬT (ảnh từ Drive "Hình hoa", cập nhật 17/11/2026)
   - TÊN MẪU LÀ TÊN TẠM đặt theo màu và kiểu gói — chủ web sửa lại; kích thước chưa có thì để [CHƯA CÓ – …] (web tự ẩn)
   - look: mô tả những gì nhìn thấy trong ảnh (dùng cho chữ thay thế ảnh)
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
  { id: 'sp-01', name: 'Bó hồng đỏ – trắng nơ voan', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cúc'], colors: ['đỏ', 'trắng', 'hồng'], occasions: [], tags: [], keywords: [], look: 'hoa hồng đỏ, hồng phấn và trắng, điểm cúc trắng, thắt nơ voan trắng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-01-a'], video: '' },
  { id: 'sp-02', name: 'Bó cẩm tú cầu xanh – trắng', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['cẩm tú cầu', 'hoa hồng', 'cúc'], colors: ['xanh dương', 'trắng'], occasions: [], tags: [], keywords: [], look: 'cẩm tú cầu xanh dương, hoa trắng và cúc, gói giấy xanh nhạt', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-02-a'], video: '' },
  { id: 'sp-14', name: 'Bó hồng – đồng tiền giấy hồng', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'đồng tiền', 'cúc'], colors: ['hồng', 'trắng', 'vàng'], occasions: [], tags: [], keywords: [], look: 'hồng phấn và trắng, đồng tiền hồng, cúc vàng, gói giấy hồng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-14-a'], video: '' },
  { id: 'sp-11', name: 'Bó hồng vàng nơ đỏ', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cúc'], colors: ['vàng', 'đỏ', 'xanh dương'], occasions: [], tags: [], keywords: [], look: 'hồng vàng, điểm cúc trắng và hoa xanh nhỏ, nơ đỏ, giấy xanh dương', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-11-a'], video: '' },
  { id: 'sp-18', name: 'Bó hồng xanh giấy đen nơ xanh', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cúc'], colors: ['xanh dương', 'đen'], occasions: [], tags: [], keywords: [], look: 'hồng xanh dương, cúc tím nhạt, giấy đen, nơ lụa xanh', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-18-a'], video: '' },
  { id: 'sp-20', name: 'Bó hoa xanh dương giấy đen', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa ly', 'hoa hồng', 'cẩm tú cầu'], colors: ['xanh dương', 'đen'], occasions: [], tags: [], keywords: [], look: 'hoa ly xanh, hồng xanh, cẩm tú cầu và hồng trắng, gói giấy đen', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-20-a'], video: '' },
  { id: 'sp-17', name: 'Bó hồng trắng điểm phấn lót ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cúc'], colors: ['trắng', 'hồng'], occasions: [], tags: [], keywords: [], look: 'hồng trắng, điểm hồng phấn và cúc nhỏ, gói ren trắng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-17-a'], video: '' },
  { id: 'sp-19', name: 'Bó hồng – cẩm chướng – cúc vàng lót ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cẩm chướng', 'cúc'], colors: ['hồng', 'trắng', 'vàng'], occasions: [], tags: [], keywords: [], look: 'hồng, cẩm chướng, cúc trắng và cúc vàng, viền ren trắng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-19-a'], video: '' },
  { id: 'sp-05', name: 'Bó hồng búp phấn nơ lụa', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng'], colors: ['hồng', 'trắng'], occasions: [], tags: [], keywords: [], look: 'hồng búp phấn, gói ren trắng, thắt nơ lụa hồng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-05-a'], video: '' },
  { id: 'sp-07', name: 'Bó hồng pastel điểm cúc trắng', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cẩm chướng', 'cúc', 'hoa ly'], colors: ['hồng', 'pastel'], occasions: [], tags: [], keywords: [], look: 'hồng pastel, cẩm chướng, cúc trắng, lót ren trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-07-a'], video: '' },
  { id: 'sp-15', name: 'Túi hoa kèm thỏ bông', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['cẩm chướng', 'hoa hồng'], colors: ['hồng', 'trắng'], occasions: ['20-10'], tags: [], keywords: ['gấu bông', 'thú bông', 'thỏ bông'], look: 'thỏ bông hồng giữa hoa cẩm chướng, hồng và hoa trắng trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-15-a'], video: '' },
  { id: 'sp-09', name: 'Bó hồng trắng điểm hồng phấn, lót ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cúc', 'cẩm chướng'], colors: ['trắng', 'hồng'], occasions: [], tags: [], keywords: [], look: 'hồng trắng kem điểm hồng phấn, cúc nhỏ và cẩm chướng hồng, viền ren trắng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-09-a'], video: '' },
  { id: 'sp-04', name: 'Bó hồng phấn điểm hoa ly – cúc trắng', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'hoa ly', 'cúc'], colors: ['hồng', 'trắng'], occasions: [], tags: [], keywords: [], look: 'hồng phấn nhiều sắc độ, hoa ly hồng, cúc trắng, gói giấy hồng lưới', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-04-a'], video: '' },
  { id: 'sp-13', name: 'Bó hoa nhiều màu lót ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['cẩm chướng', 'đồng tiền', 'cúc'], colors: ['hồng', 'vàng', 'trắng', 'xanh dương'], occasions: ['20-10'], tags: [], keywords: [], look: 'cẩm chướng hồng và vàng, đồng tiền, cúc trắng, hoa nhỏ xanh, viền ren trắng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-13-a'], video: '' },
  { id: 'sp-03', name: 'Túi hoa ly hồng lót ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa ly', 'cẩm chướng', 'cúc'], colors: ['hồng', 'xanh dương'], occasions: ['sinh-nhat'], tags: [], keywords: [], look: 'hoa ly hồng, cẩm chướng, cúc và hoa nhỏ màu xanh, lót ren trắng trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-03-a'], video: '' },
  { id: 'sp-06', name: 'Bó hồng phấn – cẩm chướng lót ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'cẩm chướng'], colors: ['hồng'], occasions: [], tags: [], keywords: [], look: 'hồng phấn và cẩm chướng, viền ren trắng, nơ lụa hồng, đặt trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-06-a'], video: '' },
  { id: 'sp-10', name: 'Túi hoa ly hồng – cúc trắng', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa ly', 'cẩm chướng', 'cúc'], colors: ['hồng'], occasions: ['20-10'], tags: [], keywords: [], look: 'hoa ly hồng, cẩm chướng, cúc trắng, lót ren trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-10-a'], video: '' },
  { id: 'sp-16', name: 'Túi cẩm tú cầu hồng nơ lụa', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['cẩm tú cầu'], colors: ['hồng'], occasions: [], tags: [], keywords: [], look: 'cẩm tú cầu hồng xếp kín, nơ lụa trắng, trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-16-a'], video: '' },
  { id: 'sp-08', name: 'Bó hồng nhiều lớp giấy, hoa ly viền ren', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hoa hồng', 'hoa ly', 'cẩm chướng'], colors: ['hồng', 'trắng'], occasions: [], tags: [], keywords: [], look: 'hồng nhiều sắc độ, hoa ly hồng viền ren, nhiều lớp giấy hồng – trắng', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-08-a'], video: '' },
  { id: 'sp-12', name: 'Túi hướng dương kèm gấu tốt nghiệp', category: 'occasion', size: '[CHƯA CÓ – kích thước]', flowers: ['hướng dương', 'hoa hồng', 'cúc'], colors: ['vàng', 'trắng'], occasions: ['tot-nghiep'], tags: [], keywords: ['gấu bông', 'gấu tốt nghiệp', 'ra trường'], look: 'hướng dương, hồng trắng và cúc, kèm gấu bông đội mũ tốt nghiệp trong túi kraft', desc: 'Nhắn Zalo để tiệm tư vấn mẫu này theo dịp và ngân sách của bạn.', images: ['sp-12-a'], video: '' },
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
