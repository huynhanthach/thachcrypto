import React, { Component } from "react";
import { Link } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import axios from "axios";
import { CONFIG } from '../config';
class MenuComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      txtKeyword: "",
      suggestions: [],
      showSuggestions: false,
    };
    this.suggestTimer = null;
  }

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  closeMenu = () => {
    this.setState({ showMenu: false });
  };

  btnLogoutClick = () => {
    this.context.setToken("");
    this.context.setUser(null);
    this.context.setMycart([]);
    localStorage.removeItem("customer");
    localStorage.removeItem("token");
    this.closeMenu();
  };

  btnSearchClick = (e) => {
    e.preventDefault();
    if (this.state.txtKeyword.trim()) {
      window.location.href = "/home?keyword=" + this.state.txtKeyword;
    }
  };

  fetchSuggestions = (q) => {
    if (!q || q.trim().length < 2) {
      this.setState({ suggestions: [], showSuggestions: false });
      return;
    }

    axios
      .get(
        `${CONFIG.BASE_URL}/api/products?keyword=${encodeURIComponent(q)}&limit=6`
      )
      .then((res) => {
        const payload = res.data?.products ? res.data : { products: Array.isArray(res.data) ? res.data : [] };
        const products = payload.products || [];
        this.setState({ suggestions: products, showSuggestions: products.length > 0 });
      })
      .catch(() => {
        this.setState({ suggestions: [], showSuggestions: false });
      });
  };

  handleSearchChange = (e) => {
    const val = e.target.value;
    this.setState({ txtKeyword: val });

    if (this.suggestTimer) clearTimeout(this.suggestTimer);
    this.suggestTimer = setTimeout(() => this.fetchSuggestions(val), 300);
  };

  selectSuggestion = (item) => {
    if (!item) return;
    // Go directly to product detail
    window.location.href = "/product/" + item._id;
  };

  handleBlur = () => {
    // delay hiding to allow click event on suggestion
    setTimeout(() => this.setState({ showSuggestions: false }), 150);
  };

  handleFocus = () => {
    if (this.state.txtKeyword && this.state.txtKeyword.trim().length >= 2) {
      this.fetchSuggestions(this.state.txtKeyword);
    }
  };

  render() {
    const { user, mycart } = this.context;

    const displayName = user ? user.name || user.username || "Khách" : "";

    return (
      <div className="navbar">
        <div className="nav-left">
          <Link to="/home" className="logo" onClick={this.closeMenu}>
            THACH CRYPTO
          </Link>
          <Link to="/home" className="nav-link" onClick={this.closeMenu}>
            Sản phẩm mới
          </Link>
        </div>

        <div style={{ position: 'relative' }}>
          <form className="search-form" onSubmit={this.btnSearchClick}>
            <input
              type="search"
              placeholder="Tìm linh kiện, máy tính..."
              className="search-input"
              value={this.state.txtKeyword}
              onChange={this.handleSearchChange}
              onBlur={this.handleBlur}
              onFocus={this.handleFocus}
            />
            <button type="submit" className="search-btn"></button>
          </form>

          {this.state.showSuggestions && (
            <div className="search-suggestions">
              {this.state.suggestions.map((p) => (
                <div
                  key={p._id}
                  className="suggestion-item"
                  onMouseDown={() => this.selectSuggestion(p)}
                >
                  <img src={p.image} alt={p.name} className="suggestion-thumb" />
                  <div className="suggestion-meta">
                    <div className="suggestion-name">{p.name}</div>
                    <div className="suggestion-price">{p.price?.toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <div className="user-profile-dropdown">
              <div className="user-info-trigger" onClick={this.toggleMenu}>
                <div className="user-avatar-circle">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-text">Chào, {displayName}</span>
                <span style={{ marginLeft: "5px", fontSize: "0.8rem" }}>
                  {this.state.showMenu ? "▲" : "▼"}
                </span>
              </div>

              {this.state.showMenu && (
                <div className="dropdown-content">
                  <Link to="/myprofile" onClick={this.closeMenu}>
                    Hồ sơ cá nhân
                  </Link>
                  <Link to="/myorders" onClick={this.closeMenu}>
                    Đơn hàng của tôi
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/home"
                    onClick={this.btnLogoutClick}
                    className="logout-link"
                  >
                    Đăng xuất
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                Đăng nhập
              </Link>
              <Link to="/signup" className="nav-link">
                Đăng ký
              </Link>
            </div>
          )}

          <Link to="/mycart" className="btn-cart" onClick={this.closeMenu}>
            Giỏ hàng ({mycart ? mycart.length : 0})
          </Link>
        </div>
      </div>
    );
  }
}

export default MenuComponent;
