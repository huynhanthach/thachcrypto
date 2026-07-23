import React, { Component } from "react";
import axios from "axios";
import { CONFIG } from '../config';

class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countCategories: 0,
      countProducts: 0,
      countOrders: 0,
      hoveredBox: null,
    };
  }

  componentDidMount() {
    // 1. Lấy dữ liệu ngay khi vừa load trang
    this.apiGetStatistics();

    // 2. THÊM TÍNH NĂNG TỰ ĐỘNG LÀM MỚI (Mỗi 10 giây)
    this.interval = setInterval(() => {
      this.apiGetStatistics();
    }, 10000);
  }

  // THÊM HÀM NÀY ĐỂ DỌN DẸP BỘ ĐẾM KHI CHUYỂN SANG TRANG KHÁC (Tránh lag máy)
  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  apiGetStatistics() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Lấy số lượng Danh mục
    axios
      .get(`${CONFIG.BASE_URL}/api/categories`, config)
      .then((res) => {
        this.setState({ countCategories: res.data.length });
      })
      .catch((err) => console.log("Lỗi lấy categories:", err.message));

    // Lấy số lượng Sản phẩm
    axios
      .get(`${CONFIG.BASE_URL}/api/products`, config)
      .then((res) => {
        const productList = res.data?.products ? res.data.products : (Array.isArray(res.data) ? res.data : []);
        this.setState({ countProducts: productList.length });
      })
      .catch((err) => console.log("Lỗi lấy products:", err.message));

    // ĐÃ SỬA: Gọi đúng API /api/admin/orders của Quản trị viên
    axios
      .get(`${CONFIG.BASE_URL}/api/admin/orders`, config)
      .then((res) => {
        const orderList = Array.isArray(res.data) ? res.data : [];
        const pendingOrders = orderList.filter(
          (order) => order.status === "PENDING" || order.status === "Pending",
        );
        this.setState({ countOrders: pendingOrders.length });
      })
      .catch((err) => console.log("Lỗi lấy orders:", err.message));
  }

  render() {
    const { countCategories, countProducts, countOrders, hoveredBox } = this.state;

    // Style cơ bản cho Box
    const getBoxStyle = (boxId) => ({
      flex: 1,
      padding: "25px 20px",
      background: "#ffffff",
      border: hoveredBox === boxId ? "1px solid #ae7e17" : "1px solid #e2e8f0",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: hoveredBox === boxId
        ? "0 12px 24px -10px rgba(174, 126, 23, 0.3)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      transform: hoveredBox === boxId ? "translateY(-6px)" : "translateY(0)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
    });

    const labelStyle = {
      fontSize: "0.85rem",
      fontWeight: "600",
      color: "#64748b",
      marginBottom: "12px",
      display: "block",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    };

    const numberStyle = {
      fontSize: "2.4rem",
      fontWeight: "800",
      color: "#0f172a",
      lineHeight: 1,
    };

    return (
      <div style={{ padding: "35px 30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* TIÊU ĐỀ HỆ THỐNG */}
        <div style={{ marginBottom: "35px" }}>
          <h2 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 8px 0",
            letterSpacing: "-0.5px"
          }}>
            HỆ THỐNG QUẢN TRỊ <span style={{ color: "#ae7e17" }}>THACH CRYPTO</span>
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Bảng điều khiển & Thống kê tổng quan dữ liệu bán hàng
          </p>
        </div>

        {/* CÁC THẺ THỐNG KÊ (HOVER HOẠT HỌA) */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "35px" }}>

          {/* BOX 1: DANH MỤC */}
          <div
            style={getBoxStyle(1)}
            onMouseEnter={() => this.setState({ hoveredBox: 1 })}
            onMouseLeave={() => this.setState({ hoveredBox: null })}
          >
            <span style={labelStyle}>DANH MỤC SẢN PHẨM</span>
            <div style={numberStyle}>{countCategories}</div>
            <div style={{
              height: "4px",
              width: "100%",
              backgroundColor: hoveredBox === 1 ? "#ae7e17" : "transparent",
              position: "absolute",
              bottom: 0,
              left: 0,
              transition: "backgroundColor 0.3s"
            }} />
          </div>

          {/* BOX 2: TỔNG KHO */}
          <div
            style={getBoxStyle(2)}
            onMouseEnter={() => this.setState({ hoveredBox: 2 })}
            onMouseLeave={() => this.setState({ hoveredBox: null })}
          >
            <span style={labelStyle}>TỔNG SẢN PHẨM TRONG KHO</span>
            <div style={{ ...numberStyle, color: hoveredBox === 2 ? "#3b82f6" : "#0f172a" }}>
              {countProducts}
            </div>
            <div style={{
              height: "4px",
              width: "100%",
              backgroundColor: hoveredBox === 2 ? "#3b82f6" : "transparent",
              position: "absolute",
              bottom: 0,
              left: 0,
              transition: "backgroundColor 0.3s"
            }} />
          </div>

          {/* BOX 3: ĐƠN HÀNG CHỜ XỬ LÝ */}
          <div
            style={getBoxStyle(3)}
            onMouseEnter={() => this.setState({ hoveredBox: 3 })}
            onMouseLeave={() => this.setState({ hoveredBox: null })}
          >
            <span style={labelStyle}>ĐƠN HÀNG CHỜ XỬ LÝ</span>
            <div style={{ ...numberStyle, color: countOrders > 0 ? "#ed1c24" : "#0f172a" }}>
              {countOrders}
            </div>
            <div style={{
              height: "4px",
              width: "100%",
              backgroundColor: hoveredBox === 3 ? "#ed1c24" : "transparent",
              position: "absolute",
              bottom: 0,
              left: 0,
              transition: "backgroundColor 0.3s"
            }} />
          </div>

        </div>

        {/* KHỐI THÔNG BÁO HỆ THỐNG */}
        <div
          style={{
            background: "#ffffff",
            padding: "25px 30px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            borderLeft: "5px solid #ae7e17",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem", color: "#0f172a", fontWeight: "600" }}>
            📢 Thông báo hệ thống
          </h4>
          <p style={{ color: "#475569", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>
            Chào mừng bạn trở lại với trang quản trị. Hiện tại hệ thống đang có{" "}
            <span style={{
              color: countOrders > 0 ? "#ed1c24" : "#0f172a",
              fontWeight: "700",
              backgroundColor: countOrders > 0 ? "#fef2f2" : "#f1f5f9",
              padding: "2px 8px",
              borderRadius: "4px"
            }}>
              {countOrders}
            </span>{" "}
            đơn hàng chờ xác nhận & xử lý.
          </p>
        </div>
      </div>
    );
  }
}

export default HomeComponent;