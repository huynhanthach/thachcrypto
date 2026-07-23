const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const hasValidSmtpConfig =
  typeof process.env.SMTP_USER === "string" &&
  process.env.SMTP_USER.trim() !== "" &&
  typeof process.env.SMTP_PASS === "string" &&
  process.env.SMTP_PASS.trim() !== "";

const sendOrderEmail = async (emailTo, order, customerName, status = "new") => {
  try {
    let subject = "";
    let statusText = "";
    let statusLabel = "";
    let color = "#ae7e17";
    const orderIdShort = order._id.toString().slice(-6).toUpperCase();

    const currentStatus = status ? status.toLowerCase() : "new";

    switch (currentStatus) {
      // 1. TRẠNG THÁI KHÁCH VỪA QUÉT MÃ QR XONG (CHỜ KIỂM TRA TIỀN)
      case "processing":
        subject = `[Thach Crypto] Tiếp nhận yêu cầu chuyển khoản đơn #${orderIdShort}`;
        statusText =
          "Hệ thống đã ghi nhận thông báo chuyển khoản của bạn. Bộ phận kế toán đang tiến hành đối soát số dư.";
        statusLabel = "Đang chờ kế toán đối soát";
        color = "#f39c12"; // Màu vàng cam cho việc "Chờ đợi"
        break;

      // 2. TRẠNG THÁI ADMIN BẤM GIAO HÀNG
      case "shipping":
      case "shipped":
        subject = `[Thach Crypto] Đơn hàng #${orderIdShort} đang được giao`;
        statusText =
          "Đơn hàng của bạn đã được bàn giao cho đơn vị vận chuyển và đang trên đường đến tay bạn!";
        statusLabel = "Đang giao hàng";
        color = "#e67e22";
        break;

      // 3. TRẠNG THÁI HỦY ĐƠN
      case "cancelled":
        subject = `[Thach Crypto] Thông báo hủy đơn hàng #${orderIdShort}`;
        statusText =
          "Đã hủy đơn hàng. Nếu có thắc mắc, vui lòng liên hệ hotline.";
        statusLabel = "Đã hủy";
        color = "#d32f2f";
        break;

      // 4. TRẠNG THÁI GIAO HÀNG THÀNH CÔNG
      case "completed":
        subject = `[Thach Crypto] Đơn hàng #${orderIdShort} đã hoàn thành`;
        statusText =
          "Cảm ơn bạn đã tin tưởng Thach Crypto! Đơn hàng của bạn đã được giao thành công.";
        statusLabel = "Đã hoàn thành";
        color = "#2e7d32";
        break;

      // 5. TRẠNG THÁI TẠO ĐƠN COD (MẶC ĐỊNH LÀ NEW)
      default:
        subject = `[Thach Crypto] Xác nhận đặt hàng #${orderIdShort} thành công`;
        statusText =
          "Cảm ơn bạn đã đặt hàng. Hệ thống đã tiếp nhận đơn hàng của bạn (Thanh toán khi nhận hàng).";
        statusLabel = "Chờ xác nhận giao hàng";
        color = "#ae7e17";
    }

    let itemsHtml = "";
    if (order.orderItems && order.orderItems.length > 0) {
      itemsHtml = order.orderItems
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.name}</strong></td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${(item.price || 0).toLocaleString("vi-VN")} VNĐ</td>
        </tr>
      `,
        )
        .join("");
    }

    const finalPrice = order.totalPrice || order.total || 0;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailTo,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${color}; color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1.5px;">Thach Crypto</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${customerName}</strong>,</p>
            <p style="font-size: 15px; color: #555;">${statusText}</p>
            <div style="background-color: #f4f6f8; padding: 15px 20px; border-radius: 6px; border-left: 4px solid ${color}; margin: 25px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Mã đơn hàng:</strong> #${orderIdShort}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Trạng thái:</strong> <span style="color: ${color}; font-weight: bold;">${statusLabel}</span></p>
            </div>
            <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Chi tiết đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #fafafa;">
                  <th style="text-align: left; padding: 12px;">Sản phẩm</th>
                  <th style="text-align: center; padding: 12px;">SL</th>
                  <th style="text-align: right; padding: 12px;">Giá</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="text-align: right; padding-top: 15px; border-top: 2px solid #e0e0e0;">
              <p style="margin: 0; font-size: 15px; color: #666;">Tổng thanh toán:</p>
              <p style="margin: 5px 0 0 0; font-size: 22px; font-weight: bold; color: ${color};">${finalPrice.toLocaleString("vi-VN")} VNĐ</p>
            </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px;">
            <p>Đây là email tự động từ hệ thống Thach Crypto. Vui lòng không phản hồi email này.</p>
          </div>
        </div>
      `,
    };

    if (!hasValidSmtpConfig) {
      console.log(`[Nodemailer] Bỏ qua gửi mail tới ${emailTo} vì chưa cấu hình SMTP.`);
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`=> [THÀNH CÔNG] Mail [${currentStatus}] gửi tới: ${emailTo}`);
  } catch (error) {
    console.error("=> Lỗi gửi mail Nodemailer:", error.message);
  }
};

module.exports = sendOrderEmail;
