import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import { CONFIG } from '../config';

class MenuComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredNav: null,
    };
  }

  lnkLogoutClick = (e) => {
    if (e) e.preventDefault();


    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("customer");
    sessionStorage.clear();
    window.location.href = "/admin/login";


  };

  render() {
    const { hoveredNav } = this.state;

    // Danh sách menu items
    const navItems = [
      { path: "/admin/home", label: "HOME" },
      { path: "/admin/category", label: "CATEGORY" },
      { path: "/admin/product", label: "PRODUCT" },
      { path: "/admin/order", label: "ORDER" },
      { path: "/admin/customer", label: "CUSTOMER" },
      { path: "/admin/analytics", label: "ANALYTICS" },
    ];

    return (
      <div
        className="admin-menu"
        style={{
          background: "#0f172a", // Màu tối xịn chuẩn Dark Mode Premium
          padding: "0 30px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          borderBottom: "2px solid #1e293b",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "10px",
            margin: 0,
            padding: 0,
            alignItems: "center",
            height: "65px",
          }}
        >
          {/* LOGO THƯƠNG HIỆU */}
          <li style={{ marginRight: "20px" }}>
            <Link
              to="/admin/home"
              style={{
                textDecoration: "none",
                color: "#ae7e17",
                fontWeight: "900",
                fontSize: "1.2rem",
                letterSpacing: "1px"
              }}
            >
              THACH<span style={{ color: "#ffffff" }}>CRYPTO</span>
            </Link>
          </li>

          {/* MENUS NAVLINK */}
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onMouseEnter={() => this.setState({ hoveredNav: item.path })}
                onMouseLeave={() => this.setState({ hoveredNav: null })}
                style={({ isActive }) => {
                  const isHovered = hoveredNav === item.path;
                  return {
                    color: isActive || isHovered ? "#ae7e17" : "#cbd5e1",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    letterSpacing: "0.5px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    backgroundColor: isActive
                      ? "rgba(174, 126, 23, 0.12)"
                      : isHovered
                        ? "rgba(255, 255, 255, 0.05)"
                        : "transparent",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "inline-block",
                    borderBottom: isActive ? "2px solid #ae7e17" : "2px solid transparent",
                  };
                }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}

          {/* GÓC TÀI KHOẢN ADMIN */}
          <li style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "500" }}>
              Xin chào, <b style={{ color: "#ffffff" }}>Admin</b>
            </span>

            <span style={{ color: "#334155" }}>|</span>

            <button
              type="button"
              onClick={this.lnkLogoutClick}
              onMouseEnter={() => this.setState({ hoveredNav: "logout" })}
              onMouseLeave={() => this.setState({ hoveredNav: null })}
              style={{
                color: hoveredNav === "logout" ? "#ffffff" : "#ef4444",
                backgroundColor: hoveredNav === "logout" ? "#dc2626" : "rgba(239, 68, 68, 0.1)",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: "700",
                padding: "6px 14px",
                borderRadius: "6px",
                transition: "all 0.2s ease-in-out",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                cursor: "pointer",
              }}
            >
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default MenuComponent;