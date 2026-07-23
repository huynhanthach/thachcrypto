import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { CONFIG } from '../config';

class MyCartComponent extends Component {
  static contextType = MyContext;

  lnkCheckoutClick = () => {
    const { mycart, user } = this.context;

    if (!user) {
      Swal.fire({
        title: "Thach Crypto",
        text: "Vui lòng đăng nhập để tiến hành đặt hàng!",
        icon: "warning",
        confirmButtonColor: "#ed1c24",
      });
      return;
    }

    if (mycart.length === 0) return;

    window.location.href = `${window.location.origin}/checkout`;
  };

  lnkRemoveClick = (id) => {
    const mycart = [...this.context.mycart];
    const index = mycart.findIndex((item) => item.product._id === id);
    if (index !== -1) {
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
      localStorage.setItem("mycart", JSON.stringify(mycart));
    }
  };

  // ✅ ĐẶT HÀM UPDATE Ở ĐÂY LÀ CHUẨN (Ngoài hàm render)
  handleUpdateQuantity = (id, newQty) => {
    // Không cho phép giảm số lượng xuống dưới 1
    if (newQty < 1) return;

    const mycart = [...this.context.mycart];
    const index = mycart.findIndex((item) => item.product._id === id);
    if (index !== -1) {
      mycart[index].quantity = newQty; // Cập nhật số lượng mới
      this.context.setMycart(mycart);  // Lưu vào state/context
      localStorage.setItem("mycart", JSON.stringify(mycart)); // Lưu vào trình duyệt
    }
  };

  render() {
    const { mycart, user } = this.context;

    if (!user) {
      return (
        <div className="cart-empty-wrapper">
          <div className="empty-content">
            <img
              src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
              alt="Login Required"
              style={{ width: "150px", opacity: "0.5" }}
            />
            <h2>BẠN CHƯA ĐĂNG NHẬP</h2>
            <p>Vui lòng đăng nhập để xem giỏ hàng.</p>
            <Link to="/login" className="btn-back-home">
              ĐĂNG NHẬP NGAY
            </Link>
          </div>
        </div>
      );
    }

    if (mycart.length === 0) {
      return (
        <div className="cart-empty-wrapper">
          <div className="empty-content">
            <img
              src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
              alt="Empty Cart"
              style={{ width: "150px", opacity: "0.5" }}
            />
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy chọn sản phẩm ưng ý nhất nhé!</p>
            <Link to="/home" className="btn-back-home">
              TIẾP TỤC MUA SẮM
            </Link>
          </div>
        </div>
      );
    }

    let total = 0;
    const items = mycart.map((item, index) => {
      const prod = item.product;
      const discountPercent = prod.discountPercent || prod.discount || 0;

      // 1. Xác định Giá Bán Thực Tế
      let itemPrice = prod.price;
      if (discountPercent > 0) {
        const basePrice = prod.originalPrice && prod.originalPrice > 0 ? prod.originalPrice : prod.price;
        itemPrice = Math.round(basePrice * (1 - discountPercent / 100));
      }

      // 2. Cộng dồn Thành Tiền
      const itemSubtotal = itemPrice * item.quantity;
      total += itemSubtotal;

      return (
        <tr key={index} className="cart-item-row">
          <td className="col-product">
            <div className="cart-prod-info">
              <img src={prod.image} alt={prod.name} />
              <div className="prod-name-box">
                <Link to={"/product/" + prod._id}>
                  {prod.name}
                </Link>
                {discountPercent > 0 && (
                  <span style={{ color: "#ed1c24", fontWeight: "bold", fontSize: "12px", marginTop: "2px" }}>
                    Đã giảm {discountPercent}%
                  </span>
                )}
                <span>Bảo hành: 36 Tháng</span>
              </div>
            </div>
          </td>

          {/* ĐƠN GIÁ (HIỆN GIÁ ĐÃ GIẢM) */}
          <td className="col-price">
            <span style={{ fontWeight: "bold" }}>{itemPrice.toLocaleString("vi-VN")}₫</span>
            {discountPercent > 0 && (
              <div style={{ textDecoration: "line-through", color: "#999", fontSize: "12px" }}>
                {(prod.originalPrice || prod.price).toLocaleString("vi-VN")}₫
              </div>
            )}
          </td>

          <td className="col-qty">
            <div
              className="qty-control-small"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              <button
                onClick={() => this.handleUpdateQuantity(prod._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={{
                  width: "28px", height: "28px", cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                  border: "1px solid #ddd", background: item.quantity <= 1 ? "#f5f5f5" : "#fff",
                  borderRadius: "4px", fontSize: "16px", fontWeight: "bold", color: "#333"
                }}
              >
                -
              </button>

              <span style={{ fontWeight: "600", width: "20px", textAlign: "center" }}>
                {item.quantity}
              </span>

              <button
                onClick={() => this.handleUpdateQuantity(prod._id, item.quantity + 1)}
                style={{
                  width: "28px", height: "28px", cursor: "pointer",
                  border: "1px solid #ddd", background: "#fff",
                  borderRadius: "4px", fontSize: "16px", fontWeight: "bold", color: "#333"
                }}
              >
                +
              </button>
            </div>
          </td>

          {/* THÀNH TIỀN */}
          <td className="col-subtotal" style={{ fontWeight: "bold", color: "#ed1c24" }}>
            {itemSubtotal.toLocaleString("vi-VN")}₫
          </td>

          <td className="col-action">
            <button
              className="btn-remove"
              onClick={() => this.lnkRemoveClick(prod._id)}
            >
              XÓA
            </button>
          </td>
        </tr>
      );
    });

    return (
      <div className="cart-page-wrapper">
        <h1 className="cart-page-title">
          GIỎ HÀNG CỦA BẠN <span>({mycart.length} sản phẩm)</span>
        </h1>
        <div className="cart-layout">
          <div className="cart-main-list">
            <table className="cart-table-pro">
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>ĐƠN GIÁ</th>
                  <th>SL</th>
                  <th>THÀNH TIỀN</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{items}</tbody>
            </table>
          </div>
          <div className="cart-sidebar">
            <div className="summary-card">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{total.toLocaleString()}₫</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá:</span>
                <span>0₫</span>
              </div>
              <div className="summary-row total-row">
                <span>TỔNG CỘNG:</span>
                <span className="final-total">{total.toLocaleString()}₫</span>
              </div>
              <p className="vat-note">(Đã bao gồm VAT nếu có)</p>
              <button
                className="btn-checkout-now"
                onClick={this.lnkCheckoutClick}
              >
                TIẾN HÀNH ĐẶT HÀNG
              </button>
              <Link to="/home" className="continue-link">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyCartComponent;