// 30 CÂU HỎI THƯỜNG GẶP — trang /tro-giup/
// - Câu trả lời nào còn chữ "[CHƯA CÓ" thì build tự ẩn câu đó (không hiện cho khách, không đưa vào schema).
// - Chủ web trả lời xong: thay đoạn [CHƯA CÓ – …] bằng câu trả lời thật, chạy node tools/build.mjs.
// - Câu trả lời mở đầu bằng ý chính trong 1 câu, sau đó mới giải thích.
// - Không ghi con số, thời hạn khi tiệm chưa xác nhận. Không dùng từ cấm (xem README).
export default function faq({ C, FORM_ON }) {
  return [
    { id: 'dat-hoa', title: 'Đặt hoa', items: [
      ['Tôi cần đặt hoa trước bao lâu?',
        'Với mẫu thiết kế theo yêu cầu, bạn vui lòng đặt trước 4–5 ngày để tiệm chuẩn bị hoa và vật liệu. Với mẫu có sẵn tại tiệm, bạn có thể nhận ngay trong ngày.'],
      ['Đặt hoa sáp ở Quỳnh Như Florist gồm những bước nào?',
        `Gồm 4 bước: nhắn tin, tư vấn và chốt mẫu, làm hoa, nhận hoa. Bạn nhắn Zalo ${C.PHONE_DISPLAY} dịp, ngày cần hoa và mẫu bạn thích; tiệm gợi ý mẫu, màu và báo giá; mẫu theo yêu cầu đặt trước 4–5 ngày, mẫu có sẵn có thể nhận ngay trong ngày; sau đó bạn nhận hoa tại tiệm hoặc trao đổi thêm về giao hoa.`],
      ['Gửi ảnh mẫu mình thích thì tiệm làm theo được không?',
        'Được. Bạn gửi ảnh mẫu cùng dịp và ngày cần hoa qua Zalo; tiệm làm sát với mẫu đã thống nhất, nếu phải đổi màu hay loại hoa thì tiệm báo trước.'],
      ['Cần hoa ngay hôm nay thì có kịp không?',
        `Kịp nếu bạn chọn mẫu có sẵn tại tiệm: mẫu có sẵn có thể nhận ngay trong ngày. Mẫu thiết kế theo yêu cầu cần đặt trước 4–5 ngày. Bạn nhắn Zalo ${C.PHONE_DISPLAY} để tiệm báo mẫu đang có sẵn.`],
      ['Tiệm có nhận làm gấp mẫu theo yêu cầu không?',
        '[CHƯA CÓ – tiệm có nhận làm gấp mẫu theo yêu cầu không, cần báo trước bao lâu]'],
      ['Tiệm làm việc mấy giờ?',
        `Tiệm làm việc từ ${C.HOURS}.`],
      ['Tiệm ở đâu?',
        `${C.ADDRESS_FULL} (khu vực Thủ Dầu Một – Bình Dương cũ).`],
      ['Tôi liên hệ tiệm bằng cách nào?', FORM_ON
        ? `Gọi hoặc nhắn Zalo ${C.PHONE_DISPLAY}, gửi form trên website, hoặc nhắn qua TikTok, Facebook, Instagram của tiệm.`
        : `Gọi hoặc nhắn Zalo ${C.PHONE_DISPLAY}, hoặc nhắn qua TikTok, Facebook, Instagram của tiệm.`],
      ['Tôi ghé tiệm xem hoa trực tiếp được không?',
        '[CHƯA CÓ – khách ghé xem hoa trực tiếp được không, có cần hẹn trước không]'],
    ] },
    { id: 'hoa-sap', title: 'Hoa sáp và bảo quản', items: [
      ['Hoa sáp giữ được bao lâu?',
        '[CHƯA CÓ – hoa sáp của tiệm giữ dáng và màu bao lâu, trong điều kiện nào]'],
      ['Hoa sáp có bị phai màu khi để phòng máy lạnh không?',
        '[CHƯA CÓ – ảnh hưởng của máy lạnh, nắng, độ ẩm tới màu hoa sáp]'],
      ['Vệ sinh và bảo quản hoa sáp thế nào?',
        '[CHƯA CÓ – cách tiệm hướng dẫn khách lau bụi, bảo quản hoa sáp]'],
      ['Hoa sáp có mùi thơm không?',
        '[CHƯA CÓ – hoa sáp của tiệm có mùi không]'],
      ['Hoa nhận được có giống hình không?',
        'Tiệm làm sát với mẫu đã thống nhất cùng bạn. Nếu loại hoa nào tạm hết, tiệm sẽ báo trước và cùng bạn chọn phương án thay thế trước khi làm.'],
    ] },
    { id: 'chon-hoa', title: 'Chọn hoa theo dịp, người nhận', items: [
      ['Tôi chưa biết chọn hoa gì cho dịp của mình?',
        'Bạn chỉ cần cho tiệm biết dịp, người nhận và ngân sách — tiệm sẽ gợi ý vài mẫu phù hợp để bạn chọn.'],
      ['Nếu mẫu tôi chọn không hợp với dịp thì sao?',
        'Tiệm sẽ góp ý thẳng thắn và có thể từ chối làm mẫu chưa phù hợp, sau đó đề xuất lựa chọn khác hợp với dịp của bạn hơn.'],
      ['Hoa sáp hợp tặng những dịp nào?',
        'Tiệm làm hoa sáp cho sinh nhật, tốt nghiệp, kỷ niệm, chúc mừng – khai trương, lời cảm ơn, 8/3, 20/10 và 20/11, cùng trụ hoa để bàn trang trí tiệc và sự kiện.'],
      ['Trụ hoa để bàn decor là gì, dùng ở đâu?',
        'Là trụ hoa sáp trang trí bàn tiệc, bàn lễ tân, góc check-in hay không gian sự kiện. Tiệm tư vấn chiều cao, kích thước và tông màu theo không gian thực tế của bạn.'],
      ['Tặng thầy cô dịp 20/11 nên chọn hoa gì?',
        '[CHƯA CÓ – gợi ý của tiệm cho dịp 20/11]'],
      ['Tiệm có viết thiệp, gói kèm gấu bông hay quà tặng không?',
        '[CHƯA CÓ – tiệm có viết thiệp, kèm gấu bông, quà tặng không]'],
    ] },
    { id: 'thanh-toan', title: 'Thanh toán', items: [
      ['Vì sao trên web không ghi giá?',
        `Giá phụ thuộc vào loại hoa, số lượng và mùa hoa. Bạn nhắn Zalo ${C.PHONE_DISPLAY} để được báo giá theo đúng mẫu và ngân sách của mình.`],
      ['Giá hoa sáp ở tiệm khoảng bao nhiêu?',
        '[CHƯA CÓ – khoảng giá cho từng loại, có mức cho sinh viên không]'],
      ['Đặt hoa có cần đặt cọc không?',
        '[CHƯA CÓ – có đặt cọc không, bao nhiêu phần trăm]'],
      ['Thanh toán bằng cách nào?',
        '[CHƯA CÓ – cách thanh toán và cách gửi thông tin chuyển khoản]'],
      ['Tiệm có xuất hóa đơn không?',
        '[CHƯA CÓ – có xuất hóa đơn không]'],
    ] },
    { id: 'giao-nhan', title: 'Giao nhận và đóng gói', items: [
      ['Tôi nhận hoa bằng cách nào?',
        'Bạn nhận hoa tại tiệm, hoặc trao đổi thêm với tiệm về giao hoa.'],
      ['Tiệm giao hoa ở khu vực nào, phí bao nhiêu?',
        '[CHƯA CÓ – khu vực giao và phí giao]'],
      ['Hoa được đóng gói thế nào khi giao?',
        '[CHƯA CÓ – quy cách đóng gói khi giao]'],
    ] },
    { id: 'doi-sua', title: 'Đổi, sửa mẫu', items: [
      ['Đã chốt mẫu rồi có đổi hoặc sửa được không?',
        '[CHƯA CÓ – chính sách đổi, sửa mẫu sau khi chốt]'],
      ['Nhận hoa rồi thấy chưa ưng thì sao?',
        '[CHƯA CÓ – cách tiệm xử lý khi khách chưa ưng sau khi nhận hoa]'],
    ] },
  ];
}
