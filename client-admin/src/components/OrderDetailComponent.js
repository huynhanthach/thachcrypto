import React, { Component } from "react";
import { CONFIG } from '../config';
class OrderDetailComponent extends Component {
  render() {
    const { order } = this.props;
    const productList = order.orderItems || order.items || [];

    const items = productList.map((item, index) => (
      <tr key={index} style={{ textAlign: "center" }}>
        <td>{index + 1}</td>
        <td style={{ textAlign: "left" }}>
          {item.name || item.product?.name || "Sản phẩm"}
        </td>
        <td>{item.quantity || item.qty}</td>
        <td style={{ fontWeight: "bold", color: "#d32f2f" }}>
          {(
            (item.price || item.product?.price || 0) *
            (item.quantity || item.qty || 1)
          ).toLocaleString()}{" "}
          VNĐ
        </td>
      </tr>
    ));

    let statusText = "CHỜ DUYỆT";
    let statusBg = "#f5f5f5";
    let statusColor = "#757575";

    if (order.status === "PROCESSING") {
      statusText = "ĐANG XỬ LÝ";
      statusBg = "#fff3e0";
      statusColor = "#f57c00";
    } else if (order.status === "SHIPPED") {
      statusText = "ĐANG GIAO";
      statusBg = "#e3f2fd";
      statusColor = "#0288d1";
    } else if (order.status === "COMPLETED") {
      statusText = "HOÀN THÀNH";
      statusBg = "#e6f4ea";
      statusColor = "#1e8e3e";
    } else if (order.status === "CANCELLED") {
      statusText = "ĐÃ HỦY";
      statusBg = "#ffebee";
      statusColor = "#d32f2f";
    }

    return (
      <div
        style={{
          background: "#fff",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginTop: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h4
          style={{
            marginTop: 0,
            borderBottom: "2px solid #eee",
            paddingBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            CHI TIẾT ĐƠN HÀNG:{" "}
            <span style={{ color: "#1e8e3e" }}>
              #{order._id.substring(order._id.length - 8).toUpperCase()}
            </span>
          </span>

          <span
            style={{
              fontSize: "0.8rem",
              padding: "4px 10px",
              borderRadius: "20px",
              background: statusBg,
              color: statusColor,
              border: "1px solid",
            }}
          >
            {statusText}
          </span>
        </h4>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            background: "#f9f9f9",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          <div>
            <p style={{ margin: "5px 0" }}>
              <b>Khách hàng:</b>{" "}
              {order.user?.name || order.customer?.name || "Khách hàng ẩn danh"}
            </p>
            <p style={{ margin: "5px 0" }}>
              <b>Địa chỉ:</b>{" "}
              {order.shippingAddress?.address || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <table
          border="1"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem",
          }}
        >
          <thead>
            <tr style={{ background: "#222", color: "#fff" }}>
              <th style={{ padding: "10px" }}>STT</th>
              <th style={{ textAlign: "left" }}>Tên linh kiện</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {productList.length > 0 ? (
              items
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  Đơn hàng này không có chi tiết sản phẩm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default OrderDetailComponent;
