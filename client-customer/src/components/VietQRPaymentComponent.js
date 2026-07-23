import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CONFIG } from '../config';

const VietQRPaymentComponent = ({ order, token }) => {
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // "MBBank" cho đúng chuẩn API VietQR
  const BANK_ID = "MB";
  const ACCOUNT_NO = "0899548549";
  const ACCOUNT_NAME_QR = "HUYNH AN THACH";
  const DISPLAY_NAME = "Thach Crypto";

  const amount = order?.totalPrice || 0;
  const orderId = order?._id
    ? order._id.substring(order._id.length - 6).toUpperCase()
    : "N/A";
  const customerName = order?.customerName || "Khách hàng";
  const customerPhone = order?.shippingAddress?.phone || "0000";

  // Tạo nội dung chuyển khoản & mã hóa chuỗi
  const rawAddInfo = `THACH ${orderId} ${customerPhone.slice(-4)}`;
  const encodedAddInfo = encodeURIComponent(rawAddInfo);
  const encodedAccountName = encodeURIComponent(ACCOUNT_NAME_QR);

  // URL LINK QR VIETQR CHUẨN
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodedAddInfo}&accountName=${encodedAccountName}`;

  // Hàm sao chép nhanh
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Đã sao chép ${label}`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleProcessPayment = () => {
    if (!isConfirmed) {
      Swal.fire({
        title: "LƯU Ý THANH TOÁN",
        text: "Vui lòng thực hiện chuyển khoản qua mã QR trước khi xác nhận với hệ thống.",
        icon: "info",
        confirmButtonColor: "#ae7e17",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }

    Swal.fire({
      title: "XÁC NHẬN GIAO DỊCH",
      html: `Hệ thống sẽ tiến hành kiểm tra tài khoản cho đơn hàng <b>#${orderId}</b>.<br/>Bạn cam kết đã chuyển đúng số tiền <b>${amount.toLocaleString("vi-VN")}đ</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ae7e17",
      cancelButtonColor: "#757575",
      confirmButtonText: "Xác nhận đã chuyển",
      cancelButtonText: "Kiểm tra lại",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
          await axios.put(
            `${CONFIG.BASE_URL}/api/orders/${order._id}/pay-confirm`,
            {},
            config
          );
          Swal.fire({
            title: "THÔNG BÁO",
            text: "Yêu cầu của bạn đã được gửi tới bộ phận kế toán. Đơn hàng sẽ được duyệt ngay khi nhận được tiền.",
            icon: "success",
            confirmButtonColor: "#ae7e17",
          }).then(() => {
            window.location.href = "/home";
          });
        } catch (error) {
          Swal.fire(
            "THÔNG BÁO",
            "Hệ thống đang bận, vui lòng thử lại sau ít phút.",
            "error"
          );
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "30px auto",
        border: "1px solid #d1d1d1",
        borderRadius: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#ae7e17",
          padding: "25px",
          textAlign: "center",
          color: "#fff",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>
          THANH TOÁN VIETQR
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.9 }}>
          {DISPLAY_NAME} - Tự động nhận diện giao dịch
        </p>
      </div>

      <div style={{ padding: "25px" }}>
        {/* KHUNG HIỂN THỊ MÃ QR */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "12px",
              border: "2px dashed #ae7e17",
              borderRadius: "16px",
              backgroundColor: "#fff",
            }}
          >
            <img
              src={qrUrl}
              alt="Mã QR Thanh Toán VietQR"
              style={{ width: "230px", height: "230px", display: "block" }}
            />
          </div>
          <p style={{ fontSize: "13px", color: "#666", marginTop: "10px" }}>
            Quét mã bằng <b>App Ngân hàng (MB, VCB, Techcombank...)</b> hoặc <b>Ví Momo/ZaloPay</b>
          </p>
        </div>

        {/* THÔNG TIN CHI TIẾT ĐỂ CHUYỂN THỦ CÔNG NẾU KHÔNG QUÉT ĐƯỢC */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Ngân hàng:</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>MB Bank (MB)</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Số tài khoản:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#ae7e17" }}>{ACCOUNT_NO}</span>
              <button
                onClick={() => copyToClipboard(ACCOUNT_NO, "Số tài khoản")}
                style={{ padding: "2px 8px", fontSize: "11px", cursor: "pointer", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Chủ tài khoản:</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{ACCOUNT_NAME_QR}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Nội dung CK:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626", backgroundColor: "#fef2f2", padding: "2px 6px", borderRadius: "4px" }}>
                {rawAddInfo}
              </span>
              <button
                onClick={() => copyToClipboard(rawAddInfo, "Nội dung chuyển khoản")}
                style={{ padding: "2px 8px", fontSize: "11px", cursor: "pointer", borderRadius: "4px", border: "1px solid #cbd5e1" }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #cbd5e1", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>TỔNG TIỀN:</span>
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#ae7e17" }}>
              {amount.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>

        {/* CHECKBOX XÁC NHẬN */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            id="confirmCheck"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer" }}
          />
          <label htmlFor="confirmCheck" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", lineHeight: "1.4" }}>
            Tôi xác nhận đã chuyển khoản thành công số tiền <b>{amount.toLocaleString("vi-VN")}đ</b> tới tài khoản trên.
          </label>
        </div>

        {/* NÚT XÁC NHẬN */}
        <button
          onClick={handleProcessPayment}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: isConfirmed ? "#ae7e17" : "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: isConfirmed ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
          }}
        >
          {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐÃ CHUYỂN KHOẢN"}
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "12px",
          textAlign: "center",
          fontSize: "12px",
          color: "#64748b",
          borderTop: "1px solid #e2e8f0",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
        }}
      >
        Hotline hỗ trợ kỹ thuật: <b>0902876722</b>
      </div>
    </div>
  );
};

export default VietQRPaymentComponent;