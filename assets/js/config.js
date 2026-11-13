/* =========================================================
   CẤU HÌNH WEBSITE QUỲNH NHƯ FLORIST
   Sửa thông tin ở đây rồi chạy: node tools/build.mjs
   Giá trị bắt đầu bằng "[CHƯA CÓ" nghĩa là chưa có thông tin.
   ========================================================= */
window.QNF_CONFIG = {
  // Tên miền tạm của Cloudflare. Khi có tên miền riêng, thay ở đây, ví dụ "https://tenmien.vn"
  SITE_URL: 'https://webiste.tuitenlatai2410.workers.dev',

  SHOP_NAME: 'Quỳnh Như Florist',
  PHONE: '0857380325',
  PHONE_DISPLAY: '0857 380 325',
  PHONE_INTL: '+84857380325',
  ZALO_URL: 'https://zalo.me/0857380325',

  ADDRESS_STREET: '324/34, Tổ 3, Khu 4',
  ADDRESS_WARD: 'Phường Phú Lợi',
  ADDRESS_CITY: 'Thành phố Hồ Chí Minh',
  ADDRESS_FULL: '324/34, Tổ 3, Khu 4, Phường Phú Lợi, TP. Hồ Chí Minh',

  TIKTOK_URL: 'https://www.tiktok.com/@tiemhoanhonee',
  FACEBOOK_URL: 'https://www.facebook.com/profile.php?id=61588390635757',
  INSTAGRAM_URL: 'https://www.instagram.com/tiemhoanhoxinhdayy',

  MAPS_URL: '[CHƯA CÓ – link Google Maps]', // chưa có thì web tự dùng link tìm kiếm theo địa chỉ
  EMAIL: '[CHƯA CÓ – email]',                // chưa có thì dòng email được ẩn
  HOURS: '[CHƯA CÓ – giờ mở cửa]',

  // Form "Gửi yêu cầu đặt hoa" — TẠM ẨN (false) cho tới khi xong thủ tục:
  //   thông báo website bán hàng + chính sách bảo mật dữ liệu (xem MISSING-INFO.md, mục P1–P3).
  //   Bật lại: đổi thành true rồi chạy node tools/build.mjs
  ORDER_FORM_ENABLED: false,

  // Form liên hệ
  WEB3FORMS_ACCESS_KEY: '[CHƯA CÓ – Web3Forms access key]',
  TURNSTILE_SITE_KEY: '[CHƯA CÓ – Turnstile site key]',
};
