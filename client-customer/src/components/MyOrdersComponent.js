import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import axios from "axios";
import { CONFIG } from '../config';
class MyOrdersComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token") || this.context.token;

    if (!token) {
      this.setState({ isLoading: false });
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(`${CONFIG.BASE_URL}/api/orders/mine`, config)
      .then((res) => {
        this.setState({ orders: res.data, isLoading: false });
      })
      .catch((err) => {
        console.error(err);
        this.setState({ isLoading: false });
      });
  }

  getStatusDisplay = (status) => {
    switch (status) {
      case "PROCESSING":
        return { bg: "#e0f7fa", color: "#0097a7", text: "ĐANG XỬ LÝ" };
      case "SHIPPED":
        return { bg: "#e3f2fd", color: "#0288d1", text: "ĐANG GIAO HÀNG" };
      case "COMPLETED":
        return { bg: "#e6f4ea", color: "#1e8e3e", text: "HOÀN THÀNH" };
      case "CANCELLED":
        return { bg: "#ffebee", color: "#d32f2f", text: "ĐÃ HỦY" };
      case "PENDING":
      default:
        return { bg: "#fff3e0", color: "#f57c00", text: "CHỜ DUYỆT" };
    }
  };

  render() {
    const savedCustomer = localStorage.getItem("customer");
    const currentUser =
      this.context.user || (savedCustomer ? JSON.parse(savedCustomer) : null);

    if (!currentUser) return <Navigate replace to="/login" />;

    const { orders, isLoading } = this.state;
    if (isLoading)
      return (
        <div
          className="p-loading"
          style={{ textAlign: "center", padding: "50px", color: "#666" }}
        >
          ĐANG TẢI ĐƠN HÀNG...
        </div>
      );

    return (
      <div>
        <div
          style={{
            maxWidth: "1200px",
            margin: "20px auto 0",
            padding: "10px 20px",
            color: "#666",
            fontSize: "14px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
          }}
        >
          <Link to="/home" style={{ textDecoration: "none", color: "#ae7e17" }}>
            Trang chủ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span> <span>Tài khoản</span>
          <span style={{ margin: "0 8px" }}>/</span>{" "}
          <span style={{ fontWeight: "bold", color: "#333" }}>
            Lịch sử mua hàng
          </span>
        </div>

        <div
          className="profile-page-wrapper"
          style={{
            display: "flex",
            maxWidth: "1200px",
            margin: "40px auto",
            gap: "30px",
            padding: "0 20px",
          }}
        >
          <div
            className="profile-sidebar"
            style={{
              width: "25%",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              height: "fit-content",
            }}
          >
            <div
              className="user-avatar-section"
              style={{
                textAlign: "center",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  background: "#ae7e17",
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 15px",
                }}
              >
                {currentUser.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <h4 style={{ margin: "0 0 5px", color: "#333" }}>
                {currentUser.name}
              </h4>
              <p style={{ margin: "0", fontSize: "14px", color: "#777" }}>
                {currentUser.email}
              </p>
            </div>

            <ul
              className="profile-menu"
              style={{ listStyle: "none", padding: 0, margin: 0 }}
            >
              <Link to="/myprofile" style={{ textDecoration: "none" }}>
                <li
                  style={{
                    padding: "12px 15px",
                    marginBottom: "5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#555",
                  }}
                >
                  Thông tin tài khoản
                </li>
              </Link>
              <li
                style={{
                  padding: "12px 15px",
                  marginBottom: "5px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  background: "#ae7e17",
                  color: "#fff",
                }}
              >
                Lịch sử mua hàng
              </li>
            </ul>
          </div>

          <div
            className="profile-container"
            style={{
              width: "75%",
              background: "#fff",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="profile-header" style={{ marginBottom: "20px" }}>
              <h2
                className="profile-title"
                style={{
                  margin: "0 0 8px",
                  color: "#ae7e17",
                  fontSize: "22px",
                  fontWeight: "bold",
                }}
              >
                ĐƠN HÀNG CỦA TÔI
              </h2>
              <p style={{ margin: 0, color: "#666", fontSize: "15px" }}>
                Theo dõi trạng thái các đơn hàng bạn đã đặt
              </p>
            </div>
            <hr
              className="profile-divider"
              style={{
                border: 0,
                height: "1px",
                background: "#eee",
                marginBottom: "30px",
              }}
            />

            {orders.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#888" }}
              >
                Bạn chưa có đơn hàng nào.
              </div>
            ) : (
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f4f7f9",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      <th style={{ padding: "12px" }}>Mã Đơn</th>
                      <th style={{ padding: "12px" }}>Ngày Đặt</th>
                      <th style={{ padding: "12px" }}>Tổng Tiền</th>
                      <th style={{ padding: "12px" }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const style = this.getStatusDisplay(o.status);
                      return (
                        <tr
                          key={o._id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              fontWeight: "bold",
                              color: "#ae7e17",
                            }}
                          >
                            {o._id.substring(o._id.length - 6).toUpperCase()}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {new Date(o.createdAt || o.cdate).toLocaleString(
                              "vi-VN",
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontWeight: "bold",
                              color: "#d32f2f",
                            }}
                          >
                            {(o.totalPrice || o.total || 0).toLocaleString(
                              "vi-VN",
                            )}
                            ₫
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                padding: "5px 10px",
                                borderRadius: "15px",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                backgroundColor: style.bg,
                                color: style.color,
                              }}
                            >
                              {style.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default MyOrdersComponent;
