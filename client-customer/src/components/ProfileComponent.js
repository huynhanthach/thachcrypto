import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import axios from "axios";
import Swal from "sweetalert2";
import { CONFIG } from '../config';
class ProfileComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      isLoaded: false,
      redirectLogin: false,
    };
  }

  componentDidMount() {
    this.fetchUserProfile();
  }

  fetchUserProfile = () => {
    const token = localStorage.getItem("token") || this.context.token;

    if (!token) {
      this.setState({ redirectLogin: true });
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    axios
      .get(`${CONFIG.BASE_URL}/api/users/profile`, config)
      .then((res) => {
        const userData = res.data.user || res.data;
        const { name, phone, address, email } = userData;

        this.setState({
          name: name || "",
          phone: phone || "",
          address: address || "",
          email: email || "",
          isLoaded: true,
        });
      })
      .catch((err) => {
        this.setState({ isLoaded: true });
        console.error("Lỗi lấy Profile:", err);
      });
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  btnUpdateClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || this.context.token;
    const { name, phone, address, password } = this.state;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const updateData = { name, phone, address };
    if (password) updateData.password = password;

    axios
      .put(
        `${CONFIG.BASE_URL}/api/users/profile`,
        updateData,
        config,
      )
      .then((res) => {
        Swal.fire("THÀNH CÔNG", "Hồ sơ đã được cập nhật!", "success");

        const updatedUser = res.data.user || res.data;
        this.context.setUser(updatedUser);
        localStorage.setItem("customer", JSON.stringify(updatedUser));

        this.setState({ password: "" });
      })
      .catch((err) => {
        Swal.fire("LỖI", "Cập nhật thất bại!", "error");
      });
  };

  render() {
    if (this.state.redirectLogin) {
      return <Navigate to="/login" />;
    }

    if (!this.state.isLoaded) {
      return (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          ĐANG TẢI THÔNG TIN...
        </div>
      );
    }

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
            boxSizing: "border-box",
          }}
        >
          <Link to="/home" style={{ textDecoration: "none", color: "#ae7e17" }}>
            Trang chủ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span>Tài khoản</span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ fontWeight: "bold", color: "#333" }}>
            Hồ sơ của tôi
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
                {this.state.name
                  ? this.state.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <h4 style={{ margin: "0 0 5px", color: "#333" }}>
                {this.state.name}
              </h4>
              <p style={{ margin: "0", fontSize: "14px", color: "#777" }}>
                {this.state.email}
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
                    background: "#ae7e17",
                    color: "#fff",
                  }}
                >
                  Thông tin tài khoản
                </li>
              </Link>
              <Link to="/myorders" style={{ textDecoration: "none" }}>
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
                  Lịch sử mua hàng
                </li>
              </Link>
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
                HỒ SƠ CỦA TÔI
              </h2>
              <p style={{ margin: 0, color: "#666", fontSize: "15px" }}>
                Quản lý thông tin hồ sơ để bảo mật tài khoản
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

            <form className="profile-form" onSubmit={this.btnUpdateClick}>
              <h4
                style={{
                  marginBottom: "15px",
                  color: "#555",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                Thông tin cá nhân
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Email (Cố định)</label>
                  <input
                    type="email"
                    value={this.state.email}
                    readOnly
                    className="input-readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={this.state.phone}
                    onChange={this.handleInputChange}
                  />
                </div>
                <div className="form-group"></div>
              </div>

              <div className="form-group full-width">
                <label>Địa chỉ nhận hàng mặc định</label>
                <textarea
                  name="address"
                  value={this.state.address}
                  onChange={this.handleInputChange}
                  rows="2"
                  placeholder="Số nhà, tên đường, phường/xã..."
                ></textarea>
              </div>

              <hr
                className="profile-divider"
                style={{ margin: "30px 0", borderTop: "1px dashed #ddd" }}
              />

              <h4
                style={{
                  marginBottom: "15px",
                  color: "#d32f2f",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                Thay đổi mật khẩu
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    placeholder="Để trống nếu không muốn đổi"
                  />
                </div>
                <div className="form-group">
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginTop: "35px",
                    }}
                  >
                    * Để trống ô này nếu bạn không có nhu cầu đổi mật khẩu.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="btn-update-profile"
                style={{ marginTop: "30px" }}
              >
                CẬP NHẬT HỒ SƠ
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default ProfileComponent;
