import React, { Component } from "react";
import axios from "axios";
import OrderDetailComponent from "./OrderDetailComponent";
import Swal from "sweetalert2";
import { CONFIG } from '../config';

class OrderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      itemSelected: null,
      loading: true,
      hoveredRowId: null,
      hoveredBtn: null,
      statusFilter: "ALL",
    };
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  apiGetOrders = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // ĐÃ SỬA: Thêm /admin/ vào đường dẫn API để lấy dữ liệu thành công
    axios
      .get(`${CONFIG.BASE_URL}/api/admin/orders`, config)
      .then((res) => {
        let fetchedOrders = [];
        if (Array.isArray(res.data)) {
          fetchedOrders = res.data;
        } else if (res.data && Array.isArray(res.data.orders)) {
          fetchedOrders = res.data.orders;
        } else if (res.data && Array.isArray(res.data.data)) {
          fetchedOrders = res.data.data;
        }
        this.setState({ orders: fetchedOrders, loading: false });
      })
      .catch((err) => {
        console.error(err);
        this.setState({ loading: false });
      });
  };

  btnStatusClick = (id, status) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .put(
        `${CONFIG.BASE_URL}/api/orders/${id}/status`,
        { status },
        config,
      )
      .then((res) => {
        if (res.data) {
          Swal.fire({
            title: "THÀNH CÔNG",
            text: `Đã cập nhật trạng thái đơn: ${status}`,
            icon: "success",
            confirmButtonColor: "#ae7e17",
          });
          this.apiGetOrders();
          this.setState({ itemSelected: null });
        }
      })
      .catch((err) => {
        const errorMsg =
          err.response?.data?.message || err.message || "Thao tác thất bại!";
        Swal.fire("LỖI TỪ BACKEND", errorMsg, "error");
      });
  };

  getStatusStyles = (status) => {
    switch (status) {
      case "PROCESSING":
      case "Processing":
        return { bg: "#fff7ed", color: "#c2410c", border: "#ffedd5", text: "ĐANG XỬ LÝ" };
      case "SHIPPED":
      case "Shipped":
        return { bg: "#eff6ff", color: "#1d4ed8", border: "#dbeafe", text: "ĐANG GIAO" };
      case "COMPLETED":
      case "Completed":
        return { bg: "#f0fdf4", color: "#15803d", border: "#dcfce7", text: "HOÀN THÀNH" };
      case "CANCELLED":
      case "Cancelled":
        return { bg: "#fef2f2", color: "#b91c1c", border: "#fee2e2", text: "ĐÃ HỦY" };
      default:
        return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", text: "CHỜ DUYỆT" };
    }
  };

  render() {
    const { orders, itemSelected, loading, hoveredRowId, hoveredBtn, statusFilter } = this.state;

    // Logic Lọc đơn hàng theo trạng thái
    const filteredOrders = statusFilter === "ALL"
      ? orders
      : orders.filter(order => {
        const currentStatus = (order.status || "PENDING").toUpperCase();
        return currentStatus === statusFilter;
      });

    const hasOrders = filteredOrders && filteredOrders.length > 0;

    const getBtnActionStyle = (btnKey, bgNormal, bgHover) => {
      const isHovered = hoveredBtn === btnKey;
      return {
        flex: 1,
        minWidth: "140px",
        padding: "12px 15px",
        background: isHovered ? bgHover : bgNormal,
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "700",
        fontSize: "0.8rem",
        letterSpacing: "0.5px",
        cursor: "pointer",
        boxShadow: isHovered ? `0 6px 15px -3px ${bgNormal}66` : "0 2px 4px rgba(0,0,0,0.05)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    };

    const rows = hasOrders
      ? filteredOrders.map((item) => {
        const style = this.getStatusStyles(item.status);
        const isSelected = itemSelected?._id === item._id;
        const isHovered = hoveredRowId === item._id;

        let bgColor = "#ffffff";
        if (isSelected) bgColor = "#fef3c7";
        else if (isHovered) bgColor = "#f8fafc";

        return (
          <tr
            key={item._id}
            className="datatable"
            onClick={() => this.setState({ itemSelected: item })}
            onMouseEnter={() => this.setState({ hoveredRowId: item._id })}
            onMouseLeave={() => this.setState({ hoveredRowId: null })}
            style={{
              cursor: "pointer",
              backgroundColor: bgColor,
              borderBottom: "1px solid #f1f5f9",
              borderLeft: isSelected ? "4px solid #ae7e17" : "4px solid transparent",
              transition: "all 0.2s ease-in-out",
              height: "52px",
            }}
          >
            <td style={{ padding: "12px 15px", fontWeight: "600", color: isSelected ? "#ae7e17" : "#64748b", fontSize: "0.85rem", textAlign: "center" }}>
              #{item._id.substring(item._id.length - 6).toUpperCase()}
            </td>
            <td style={{ color: "#475569", fontSize: "0.85rem", textAlign: "center" }}>
              {new Date(item.createdAt).toLocaleString("vi-VN")}
            </td>
            <td style={{ fontWeight: isSelected ? "700" : "600", color: "#0f172a", textAlign: "center" }}>
              {item.user?.name || "Khách hàng"}
            </td>

            <td style={{ textAlign: "center" }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  backgroundColor: item.paymentMethod === "VietQR" ? "#fffbebe6" : "#f0fdf4",
                  color: item.paymentMethod === "VietQR" ? "#ae7e17" : "#16a34a",
                  border: item.paymentMethod === "VietQR" ? "1px solid #fef3c7" : "1px solid #bbf7d0",
                }}
              >
                {item.paymentMethod === "VietQR" ? "📱 VietQR" : "💵 COD"}
              </span>
            </td>

            <td style={{ fontWeight: "700", color: "#0f172a", textAlign: "center" }}>
              {item.totalPrice.toLocaleString("vi-VN")}đ
            </td>

            <td style={{ textAlign: "center" }}>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  background: style.bg,
                  color: style.color,
                  border: `1px solid ${style.border}`,
                }}
              >
                {style.text}
              </span>
            </td>
          </tr>
        );
      })
      : null;

    return (
      <div
        style={{ padding: "35px 30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontWeight: "800",
              fontSize: "1.5rem",
              letterSpacing: "0.5px",
            }}
          >
            QUẢN LÝ ĐƠN HÀNG <span style={{ color: "#ae7e17" }}>THACH CRYPTO</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "8px 15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => this.setState({ statusFilter: e.target.value, itemSelected: null })}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                outline: "none",
                cursor: "pointer",
                fontWeight: "600",
                color: "#0f172a",
                backgroundColor: "#f8fafc"
              }}
            >
              <option value="ALL">Tất cả đơn hàng</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPED">Đang giao</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "25px", alignItems: "flex-start" }}>

          <div
            style={{
              flex: 1.5,
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    background: "#0f172a",
                    color: "#ffffff",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "14px 15px", textAlign: "center" }}>Mã Đơn</th>
                    <th style={{ padding: "14px 10px", textAlign: "center" }}>Ngày Đặt</th>
                    <th style={{ padding: "14px 10px", textAlign: "center" }}>Khách Hàng</th>
                    <th style={{ padding: "14px 10px", textAlign: "center" }}>Thanh Toán</th>
                    <th style={{ padding: "14px 10px", textAlign: "center" }}>Tổng Tiền</th>
                    <th style={{ padding: "14px 10px", textAlign: "center" }}>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody style={{ textAlign: "center" }}>
                  {hasOrders ? (
                    rows
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ padding: "40px", color: "#94a3b8", fontSize: "0.95rem" }}
                      >
                        {loading ? "Đang tải dữ liệu đơn hàng..." : "Không có đơn hàng nào khớp với bộ lọc."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {itemSelected && (
            <div
              style={{
                flex: 1,
                background: "#ffffff",
                padding: "25px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e2e8f0",
                borderTop: "5px solid #ae7e17",
              }}
            >
              <h3
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "12px",
                  margin: "0 0 15px 0",
                  color: "#0f172a",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                }}
              >
                XỬ LÝ ĐƠN HÀNG
              </h3>

              <p style={{ margin: "0 0 15px 0", color: "#475569", fontSize: "0.9rem" }}>
                Mã đơn: <strong style={{ color: "#ae7e17" }}>#{itemSelected._id}</strong>
              </p>

              <div
                style={{
                  padding: "12px 15px",
                  background: itemSelected.paymentMethod === "VietQR" ? "#fffbebe6" : "#f0fdf4",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                  border: itemSelected.paymentMethod === "VietQR" ? "1px solid #fef3c7" : "1px solid #bbf7d0",
                  lineHeight: "1.5",
                }}
              >
                <strong>Lưu ý: </strong>
                {itemSelected.paymentMethod === "VietQR" ? (
                  <span style={{ color: "#b45309", fontWeight: "600" }}>
                    Đây là đơn chuyển khoản VietQR. Hãy kiểm tra App ngân hàng xác nhận đã nhận tiền trước khi bấm Giao hàng!
                  </span>
                ) : (
                  <span style={{ color: "#15803d", fontWeight: "600" }}>
                    Đây là đơn COD. Bạn có thể xác nhận và chuẩn bị đóng gói giao hàng ngay.
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "25px",
                }}
              >
                {(itemSelected.status === "PENDING" || !itemSelected.status) && (
                  <button
                    onClick={() => this.btnStatusClick(itemSelected._id, "PROCESSING")}
                    onMouseEnter={() => this.setState({ hoveredBtn: "proc" })}
                    onMouseLeave={() => this.setState({ hoveredBtn: null })}
                    style={getBtnActionStyle("proc", "#16a34a", "#15803d")}
                  >
                    XÁC NHẬN ĐƠN (COD)
                  </button>
                )}

                {itemSelected.status === "PROCESSING" && (
                  <button
                    onClick={() => this.btnStatusClick(itemSelected._id, "SHIPPED")}
                    onMouseEnter={() => this.setState({ hoveredBtn: "ship" })}
                    onMouseLeave={() => this.setState({ hoveredBtn: null })}
                    style={getBtnActionStyle("ship", "#0288d1", "#026aa7")}
                  >
                    ĐÃ KIỂM TRA & GIAO HÀNG
                  </button>
                )}

                {itemSelected.status === "SHIPPED" && (
                  <button
                    onClick={() => this.btnStatusClick(itemSelected._id, "COMPLETED")}
                    onMouseEnter={() => this.setState({ hoveredBtn: "comp" })}
                    onMouseLeave={() => this.setState({ hoveredBtn: null })}
                    style={getBtnActionStyle("comp", "#7e22ce", "#6b21a8")}
                  >
                    HOÀN THÀNH ĐƠN
                  </button>
                )}

                {itemSelected.status !== "COMPLETED" && itemSelected.status !== "CANCELLED" && (
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "Xác nhận hủy đơn?",
                        text: "Số lượng hàng sẽ được tự động cộng trả lại vào kho!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#dc2626",
                        cancelButtonColor: "#64748b",
                        confirmButtonText: "Đồng ý hủy",
                        cancelButtonText: "Bỏ qua",
                      }).then((result) => {
                        if (result.isConfirmed)
                          this.btnStatusClick(itemSelected._id, "CANCELLED");
                      });
                    }}
                    onMouseEnter={() => this.setState({ hoveredBtn: "canc" })}
                    onMouseLeave={() => this.setState({ hoveredBtn: null })}
                    style={getBtnActionStyle("canc", "#dc2626", "#b91c1c")}
                  >
                    HỦY ĐƠN HÀNG
                  </button>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                <OrderDetailComponent
                  order={itemSelected}
                  updateOrders={this.apiGetOrders}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default OrderComponent;