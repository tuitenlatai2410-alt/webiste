// CHÍNH SÁCH — trang /chinh-sach/
// - Mục nào còn chữ "[CHƯA CÓ" thì build tự ẩn cả mục. Trang không còn mục nào thì không tạo trang,
//   không có trong thanh tiện ích, menu cuối trang và sitemap.
// - Đề xuất: không in số tài khoản ngân hàng lên web; gửi qua Zalo khi chốt mẫu.
export default function policy({ C, FORM_ON, WISH_ON }) {
  return [
    { id: 'thanh-toan', title: 'Thanh toán', paras: [
      '[CHƯA CÓ – cách thanh toán (chuyển khoản, tiền mặt…)]',
      '[CHƯA CÓ – cách gửi thông tin chuyển khoản]',
      '[CHƯA CÓ – có đặt cọc không, bao nhiêu phần trăm]',
    ] },
    { id: 'giao-nhan', title: 'Giao nhận và đóng gói', paras: [
      'Bạn nhận hoa tại tiệm, hoặc trao đổi thêm với tiệm về giao hoa.',
      '[CHƯA CÓ – khu vực giao và phí giao]',
      '[CHƯA CÓ – quy cách đóng gói khi giao]',
    ] },
    { id: 'doi-sua', title: 'Đổi, sửa mẫu', paras: [
      '[CHƯA CÓ – chính sách đổi, sửa mẫu sau khi chốt]',
    ] },
    { id: 'bao-mat', title: 'Bảo mật dữ liệu', paras: [
      FORM_ON
        ? '[CHƯA CÓ – chính sách dữ liệu cho form đặt hoa (Web3Forms)]'
        : 'Website không có form thu thông tin: web không yêu cầu bạn nhập họ tên, số điện thoại hay địa chỉ.',
      'Khi bạn nhắn tin cho tiệm qua Zalo, Facebook, Instagram hoặc TikTok, cuộc trò chuyện diễn ra trên các nền tảng đó và theo chính sách riêng của từng nền tảng.',
      ...(WISH_ON ? ['Danh sách mẫu yêu thích (nút trái tim) chỉ lưu trên trình duyệt của bạn, không gửi về tiệm. Muốn xóa, bạn bỏ tim từng mẫu hoặc xóa dữ liệu trang web trong trình duyệt.'] : []),
      'Trình duyệt lưu một ghi chú nhỏ trong phiên truy cập để màn chào chỉ hiện một lần; ghi chú này không chứa thông tin cá nhân.',
      'Web không dùng công cụ quảng cáo hay đo lượt truy cập. Máy chủ của web (Cloudflare) có thể ghi nhật ký kỹ thuật như địa chỉ IP để vận hành và bảo vệ web.',
      `Bạn có câu hỏi về dữ liệu, vui lòng nhắn Zalo ${C.PHONE_DISPLAY}.`,
    ] },
  ];
}
