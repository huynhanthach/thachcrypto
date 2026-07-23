import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import Swal from "sweetalert2";
import { CONFIG } from '../config';

class ProductDetailComponent extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      txtQuantity: 1,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    const id = window.location.pathname.split("/").pop();
    if (id) {
      this.apiGetProduct(id);
    }
  }

  apiGetProduct(id) {
    axios
      .get(`${CONFIG.BASE_URL}/api/products/${id}`)
      .then((res) => {
        this.setState({ product: res.data, loading: false });
      })
      .catch(() => {
        this.setState({ error: "LỖI KẾT NỐI SERVER", loading: false });
      });
  }

  handleQuantity = (type) => {
    if (type === "plus") {
      this.setState({ txtQuantity: this.state.txtQuantity + 1 });
    } else {
      this.setState({ txtQuantity: Math.max(1, this.state.txtQuantity - 1) });
    }
  };

  checkAuth = () => {
    const { user } = this.context;
    if (!user) {
      Swal.fire({
        title: "THACH CRYPTO",
        text: "Vui lòng ĐĂNG NHẬP để mua linh kiện!",
        icon: "warning",
        confirmButtonColor: "#ed1c24",
        confirmButtonText: "ĐĂNG NHẬP NGAY",
        showCancelButton: true,
        cancelButtonText: "HỦY",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return false;
    }
    return true;
  };

  btnAdd2CartClick = (e) => {
    e.preventDefault();
    if (!this.checkAuth()) return;
    const { product, txtQuantity } = this.state;

    if (product && product.countInStock > 0) {
      this.context.add2Cart(product, parseInt(txtQuantity));
      Swal.fire({
        title: "THÀNH CÔNG",
        text: `Đã thêm ${txtQuantity} sản phẩm vào giỏ hàng!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  btnBuyNowClick = (e) => {
    e.preventDefault();
    if (!this.checkAuth()) return;
    const { product, txtQuantity } = this.state;

    if (product && product.countInStock > 0) {
      this.context.add2Cart(product, parseInt(txtQuantity));
      window.location.href = "/mycart";
    }
  };

  renderSpecTable(description) {
    if (!description)
      return <p className="no-spec">Thông số kỹ thuật đang được cập nhật...</p>;
    const lines = description.split("\n").filter((line) => line.trim() !== "");

    return (
      <div className="spec-table-container">
        <h3 className="spec-header-title">THÔNG SỐ KỸ THUẬT</h3>
        <table className="ttg-pro-table">
          <tbody>
            {lines.map((line, index) => {
              // SỬA Ở ĐÂY: Dùng dấu `:` thay cho `|`
              const parts = line.split(":");
              const label = parts[0]?.trim();
              const info = parts.slice(1).join(":").trim(); // Gộp lại nếu nội dung có chứa dấu :

              return (
                <tr key={index}>
                  <td
                    style={{
                      width: "30%",
                      fontWeight: "bold",
                      backgroundColor: "#f9f9f9",
                      color: "#333",
                      padding: "12px",
                      border: "1px solid #eee",
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "#666",
                      border: "1px solid #eee",
                    }}
                  >
                    {info || line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { product, loading, error, txtQuantity } = this.state;

    if (loading) return <div className="p-loading">ĐANG TẢI...</div>;
    if (error) return <div className="p-error">{error}</div>;
    if (!product) return <div className="p-error">SẢN PHẨM KHÔNG TỒN TẠI</div>;

    const isOutOfStock = !product.countInStock || product.countInStock <= 0;

    const formatPrice = (value) => {
      const numberValue = Number(value) || 0;
      return Math.round(numberValue).toLocaleString("vi-VN");
    };

    return (
      <div className="product-detail-pro">
        <div
          style={{
            backgroundColor: "#f4f4f4",
            padding: "10px 20px",
            fontSize: "13px",
            color: "#666",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "4px",
          }}
        >
          <Link to="/home" style={{ textDecoration: "none", color: "#ae7e17" }}>
            Trang chủ
          </Link>
          <span>&gt;</span>
          <Link
            to={`/product/list?cid=${product.category?._id}`}
            style={{
              textDecoration: "none",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            {product.category?.name || "LINH KIỆN"}
          </Link>
          <span>&gt;</span>
          <span style={{ color: "#333", fontWeight: "500" }}>
            {product.name}
          </span>
        </div>

        <div className="product-top-info">
          <div className="product-media-left">
            <div className="image-frame">
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className="product-content-right">
            <div className="p-brand-label">
              {product.brand || "THACH CRYPTO"}
            </div>

            <h1 className="p-main-title">
              {product.name}
              {product.discountPercent > 0 && (
                <span style={{
                  marginLeft: "15px",
                  background: "red",
                  color: "white",
                  padding: "4px 8px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  verticalAlign: "middle",
                  display: "inline-block"
                }}>
                  GIẢM {product.discountPercent}%
                </span>
              )}
            </h1>

            <div className="p-price-gradient-box">
              <div className="p-price-val">
                <span style={{ color: (product.discountPercent || 0) > 0 ? "#ed1c24" : "inherit" }}>
                  {formatPrice(
                    (product.discountPercent || 0) > 0 && !product.originalPrice
                      ? Math.round(product.price * (1 - product.discountPercent / 100))
                      : product.price
                  )}
                  ₫
                </span>

                {(product.discountPercent || 0) > 0 && (
                  <del
                    style={{
                      color: "#999",
                      fontSize: "18px",
                      marginLeft: "15px",
                      fontWeight: "normal",
                    }}
                  >
                    {formatPrice(product.originalPrice || product.price)}₫
                  </del>
                )}
              </div>
              <div className="p-status-row">
                Tình trạng:{" "}
                <span style={{ color: isOutOfStock ? "#d3d3d3" : "#ffeb3b", fontWeight: "bold" }}>
                  {isOutOfStock ? "HẾT HÀNG" : "CÒN HÀNG"}
                </span>
              </div>
            </div>

            <div
              style={{
                margin: "20px 0",
                borderTop: "1px dashed #eee",
                paddingTop: "15px",
              }}
            >
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Mô tả sản phẩm
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {product.description &&
                  product.description
                    .split("\n")
                    .slice(0, 6)
                    .map((line, index) => {
                      // SỬA Ở ĐÂY: Dùng dấu `:` thay cho `|`
                      const parts = line.split(":");
                      const label = parts[0]?.trim();
                      const info = parts.slice(1).join(":")?.trim();

                      if (!info && !label) return null;
                      return (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            marginBottom: "8px",
                            fontSize: "14px",
                            color: "#444",
                          }}
                        >
                          <span
                            style={{
                              color: "#006d57",
                              marginRight: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            ✔
                          </span>
                          <span>
                            <strong>{label}{info ? ":" : ""}</strong>{" "}
                            {info || "Thông số đang cập nhật"}
                          </span>
                        </li>
                      );
                    })}
              </ul>
            </div>

            <div className="p-quick-specs">
              <div className="q-item">
                <span>BẢO HÀNH</span>
                <strong>12 THÁNG</strong>
              </div>
              <div className="q-item">
                <span>VẬN CHUYỂN</span>
                <strong>TOÀN QUỐC</strong>
              </div>
              <div className="q-item">
                <span>HỖ TRỢ</span>
                <strong>TRẢ GÓP 0%</strong>
              </div>
            </div>

            <div className="p-action-group">
              <div className="qty-wrapper">
                <span>Số lượng:</span>
                <div className="qty-btns">
                  <button
                    onClick={() => this.handleQuantity("minus")}
                    disabled={isOutOfStock}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={isOutOfStock ? 0 : txtQuantity}
                    readOnly
                  />
                  <button
                    onClick={() => this.handleQuantity("plus")}
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="main-btns">
                <button
                  className="btn-buy-primary"
                  onClick={this.btnBuyNowClick}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "SẢN PHẨM TẠM HẾT" : "ĐẶT HÀNG NGAY"}
                </button>
                <button
                  className="btn-cart-secondary"
                  onClick={this.btnAdd2CartClick}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="product-bottom-specs">
          {this.renderSpecTable(product.description)}
        </div>
      </div>
    );
  }
}

export default ProductDetailComponent;