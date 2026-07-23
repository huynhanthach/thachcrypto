import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CONFIG } from '../config';
class SignupComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
      txtName: "",
      txtPhone: "",
      txtEmail: "",
    };
  }

  btnSignupClick = (e) => {
    e.preventDefault();
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } =
      this.state;

    if (txtUsername && txtPassword && txtName && txtPhone && txtEmail) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(txtUsername)) {
        alert(
          "Tên đăng nhập chỉ được dùng chữ cái không dấu, số và viết liền!",
        );
        return;
      }

      const body = {
        username: txtUsername,
        password: txtPassword,
        name: txtName,
        phone: txtPhone,
        email: txtEmail,
      };

      axios
        .post(`${CONFIG.BASE_URL}/api/users/register`, body)
        .then((res) => {
          if (res.data && res.data.message) {
            alert(res.data.message);
            window.location.href = "/login";
          }
        })
        .catch((err) => {
          let errorMsg = "Lỗi đăng ký rồi fen!";
          if (err.response && err.response.data && err.response.data.message) {
            errorMsg = err.response.data.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          alert(errorMsg);
        });
    } else {
      alert("Vui lòng điền đủ thông tin nha Quân!");
    }
  };

  render() {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">TẠO TÀI KHOẢN MỚI</h2>
          <form>
            <label className="form-label">TÊN ĐĂNG NHẬP</label>
            <input
              type="text"
              className="form-input"
              value={this.state.txtUsername}
              onChange={(e) => this.setState({ txtUsername: e.target.value })}
              placeholder="Viết liền không dấu (VD: huynhanthach)"
            />
            <label className="form-label">MẬT KHẨU</label>
            <input
              type="password"
              className="form-input"
              value={this.state.txtPassword}
              onChange={(e) => this.setState({ txtPassword: e.target.value })}
              placeholder="Nhập mật khẩu"
            />
            <label className="form-label">HỌ VÀ TÊN</label>
            <input
              type="text"
              className="form-input"
              value={this.state.txtName}
              onChange={(e) => this.setState({ txtName: e.target.value })}
              placeholder="Nhập họ và tên (VD: Huỳnh An Thạch)"
            />
            <label className="form-label">SỐ ĐIỆN THOẠI</label>
            <input
              type="tel"
              className="form-input"
              value={this.state.txtPhone}
              onChange={(e) => this.setState({ txtPhone: e.target.value })}
              placeholder="Nhập số điện thoại"
            />
            <label className="form-label">EMAIL</label>
            <input
              type="email"
              className="form-input"
              value={this.state.txtEmail}
              onChange={(e) => this.setState({ txtEmail: e.target.value })}
              placeholder="Nhập địa chỉ email"
            />
            <button className="btn-primary" onClick={this.btnSignupClick}>
              ĐĂNG KÝ
            </button>
          </form>
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            Đã có tài khoản?{" "}
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
export default SignupComponent;
