import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Import thêm toast cho đồng bộ
import MyContext from "../contexts/MyContext"; // Phải import Context để App nhận diện đăng nhập
import { CONFIG } from '../config';

class SignupComponent extends Component {
  // Gắn context vào y hệt như bên Login
  static contextType = MyContext;

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
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;

    if (txtUsername && txtPassword && txtName && txtPhone && txtEmail) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(txtUsername)) {
        toast.warn("Tên đăng nhập chỉ được dùng chữ cái không dấu, số và viết liền!");
        return;
      }

      const body = {
        username: txtUsername,
        password: txtPassword,
        name: txtName,
        phone: txtPhone,
        email: txtEmail,
      };

      // 1. GỌI API ĐĂNG KÝ
      axios
        .post(`${CONFIG.BASE_URL}/api/users/register`, body)
        .then((res) => {
          toast.success("Đăng ký thành công! Đang tự động đăng nhập...");

          // 2. GỌI API ĐĂNG NHẬP (Tự động)
          const loginBody = {
            username: txtUsername,
            password: txtPassword,
          };

          axios
            .post(`${CONFIG.BASE_URL}/api/users/login`, loginBody)
            .then((loginRes) => {
              const data = loginRes.data;
              const token = data.token;
              const userData = data.user || data;

              if (token) {
                // Xử lý lưu thông tin hệt như hàm handleSuccessLogin bên trang Login
                this.context.setUser(userData);
                this.context.setToken(token);
                localStorage.setItem("customer", JSON.stringify(userData));
                localStorage.setItem("token", token);

                const displayName = userData.name || userData.username || "bạn";
                toast.success(displayName + " đang truy cập");

                // Chuyển hướng về trang chủ (/home) sau 1 giây
                setTimeout(() => {
                  window.location.href = `${window.location.origin}/home`;
                }, 1000);
              }
            })
            .catch(() => {
              toast.error("Tự động đăng nhập thất bại. Vui lòng đăng nhập thủ công!");
              setTimeout(() => {
                window.location.href = "/login";
              }, 1500);
            });
        })
        .catch((err) => {
          let errorMsg = "Lỗi đăng ký rồi fen!";
          if (err.response && err.response.data && err.response.data.message) {
            errorMsg = err.response.data.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          toast.error(errorMsg);
        });
    } else {
      toast.warn("Vui lòng điền đủ thông tin nha Quân!");
    }
  };

  render() {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">TẠO TÀI KHOẢN MỚI</h2>
          <form onSubmit={this.btnSignupClick}>
            <label className="form-label">TÊN ĐĂNG NHẬP</label>
            <input
              type="text"
              className="form-input"
              value={this.state.txtUsername}
              onChange={(e) => this.setState({ txtUsername: e.target.value })}
              placeholder="Viết liền không dấu (VD: huynhanthach)"
              required
            />
            <label className="form-label">MẬT KHẨU</label>
            <input
              type="password"
              className="form-input"
              value={this.state.txtPassword}
              onChange={(e) => this.setState({ txtPassword: e.target.value })}
              placeholder="Nhập mật khẩu"
              required
            />
            <label className="form-label">HỌ VÀ TÊN</label>
            <input
              type="text"
              className="form-input"
              value={this.state.txtName}
              onChange={(e) => this.setState({ txtName: e.target.value })}
              placeholder="Nhập họ và tên (VD: Huỳnh An Thạch)"
              required
            />
            <label className="form-label">SỐ ĐIỆN THOẠI</label>
            <input
              type="tel"
              className="form-input"
              value={this.state.txtPhone}
              onChange={(e) => this.setState({ txtPhone: e.target.value })}
              placeholder="Nhập số điện thoại"
              required
            />
            <label className="form-label">EMAIL</label>
            <input
              type="email"
              className="form-input"
              value={this.state.txtEmail}
              onChange={(e) => this.setState({ txtEmail: e.target.value })}
              placeholder="Nhập địa chỉ email"
              required
            />
            <button type="submit" className="btn-primary">
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