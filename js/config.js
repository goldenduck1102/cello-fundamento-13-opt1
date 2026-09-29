/**
 * Cấu hình landing page — chỉnh ở đây, không cần sửa HTML/JS khác.
 *
 * Giá và phân khu theo Source/3.jpg; chưa phải tồn kho thời gian thực.
 */
window.SITE_CONFIG = {
  // Thời điểm diễn (giờ Việt Nam) — dùng cho đồng hồ đếm ngược.
  eventStart: "2026-11-02T20:00:00+07:00",

  // Đóng form đặt vé online từ thời điểm này (để trống "" nếu không muốn tự đóng).
  salesCloseAt: "",

  contact: {
    hotline: "",
    hotlineLabel: "",
    zalo: "",
    email: "", // ví dụ: "ticket@cellofundamento.vn" — để trống sẽ ẩn
  },

  /**
   * URL nhận đơn đặt vé (POST JSON). Khuyến nghị: Google Apps Script ghi vào Google Sheet —
   * xem integrations/google-apps-script.gs. Để trống: form vẫn chạy nhưng hiển thị hướng dẫn
   * gửi thông tin qua Zalo/hotline thay vì báo "đã nhận".
   */
  orderEndpoint: "",

  // Mã đo lường quảng cáo (để trống sẽ không tải).
  tracking: {
    metaPixelId: "",
    ga4Id: "",
  },

  maxTicketsPerOrder: 10,

  /**
   * Hạng vé. `zones` vẽ sơ đồ minh hoạ: floor 1|2, r1–r2 là bán kính (khoảng cách tới sân khấu),
   * a1–a2 là góc (35–145 là toàn bộ bề ngang khán phòng).
   */
  tiers: window.EVENT_TIERS,
};
