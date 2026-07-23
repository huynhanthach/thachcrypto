import React, { Component } from "react";
import axios from "axios";
import { CONFIG } from '../config';
class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "admin",
        JSON.stringify({ token: token, username: "Admin" }),
      );

      if (this.props.setToken) {
        this.props.setToken(token);
      }

      window.history.replaceState(null, null, window.location.pathname);
    }
  }

  btnLoginClick = (e) => {
    e.preventDefault();
    const { txtUsername, txtPassword } = this.state;
    if (txtUsername && txtPassword) {
      const account = { username: txtUsername, password: txtPassword };

      localStorage.clear();

      axios
        .post(`${CONFIG.BASE_URL}/api/admin/login`, account)
        .then((res) => {
          const token = res.data.token || res.data;

          if (token && typeof token === "string") {
            localStorage.setItem("token", token);
            localStorage.setItem(
              "admin",
              JSON.stringify({ token: token, username: account.username }),
            );

            if (this.props.setToken) {
              this.props.setToken(token);
            }
          } else {
            alert(
              res.data.message || "Đăng nhập thất bại, không tìm thấy Token",
            );
          }
        })
        .catch((err) => {
          alert("Lỗi kết nối máy chủ hoặc sai thông tin!");
        });
    }
  };

  render() {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f4f4",
        }}
      >
        <form
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            width: "300px",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            ADMIN LOGIN
          </h2>
          <input
            type="text"
            placeholder="Username"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
            onChange={(e) => this.setState({ txtUsername: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
            onChange={(e) => this.setState({ txtPassword: e.target.value })}
          />
          <button
            onClick={this.btnLoginClick}
            style={{
              width: "100%",
              padding: "12px",
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ĐĂNG NHẬP
          </button>
        </form>
      </div>
    );
  }
}

export default LoginComponent;
