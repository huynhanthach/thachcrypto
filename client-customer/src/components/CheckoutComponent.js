import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import axios from "axios";
import Swal from "sweetalert2";
import VietQRPaymentComponent from "./VietQRPaymentComponent";
import { CONFIG } from '../config';

class CheckoutComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      address: "",
      phone: "",
      city: "TP. Hồ Chí Minh",
      paymentMethod: "COD",
      isReady: false,
      createdOrder: null,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      const { user } = this.context;
      if (user) {
        this.setState({
          name: user.name || user.username || user.fullname || "",
          phone: user.phone || "",
          address: user.address || "",
          isReady: true,
        });
      } else {
        window.location.href = "/login";
      }
    }, 200);
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // 🟢 HÀM HỖ TRỢ TÍNH GIÁ BÁN THỰC TẾ (ĐÃ TRỪ % GIẢM GIÁ)
  getItemPrice = (prod) => {
    const discountPercent = prod.discountPercent || prod.discount || 0;
    if (discountPercent > 0) {
      const basePrice = prod.originalPrice && prod.originalPrice > 0 ? prod.originalPrice : prod.price;
      return Math.round(basePrice * (1 - discountPercent / 100));
    }
    return prod.price;
  };

  btnConfirmOrderClick = (e) => {
    e.preventDefault();
    const { mycart, token, user } = this.context;
    const { name, address, phone, city, paymentMethod } = this.state;

    if (!address.trim() || !phone.trim() || !name.trim()) {
      Swal.fire(
        "THÔNG BÁO",
        "Vui lòng hoàn thiện thông tin giao hàng!",
        "warning",
      );
      return;
    }

    // Tính tổng tiền chuẩn đã trừ sale
    const calculatedTotal = mycart.reduce(
      (sum, item) => sum + this.getItemPrice(item.product) * item.quantity,
      0,
    );

    const orderData = {
      orderItems: mycart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.image,
        price: this.getItemPrice(item.product), // Lấy giá sau khi giảm
        product: item.product._id,
      })),
      shippingAddress: { address, city, phone },
      paymentMethod: paymentMethod,
      totalPrice: calculatedTotal, // Tổng tiền đã trừ giảm giá
      email: user.email,
      customerName: name,
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .post(`${CONFIG.BASE_URL}/api/orders`, orderData, config)
      .then((res) => {
        if (res.data) {
          if (paymentMethod === "VietQR") {
            this.context.setMycart([]);
            localStorage.removeItem("mycart");
            this.setState({ createdOrder: res.data });
          } else {
            Swal.fire({
              title: "ĐẶT HÀNG THÀNH CÔNG",
              text: "Cảm ơn bạn! Hàng sẽ được giao và thanh toán tại nhà.",
              icon: "success",
              confirmButtonColor: "#2e7d32",
            }).then(() => {
              this.context.setMycart([]);
              localStorage.removeItem("mycart");
              window.location.href = "/home";
            });
          }
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message;
        Swal.fire("LỖI ĐẶT HÀNG", msg, "error");
      });
  };

  render() {
    const { mycart, token } = this.context;
    const { isReady, createdOrder, paymentMethod } = this.state;

    if (!isReady) return <div className="p-loading">ĐANG TẢI...</div>;

    if (createdOrder && paymentMethod === "VietQR") {
      return (
        <div className="checkout-page-wrapper">
          <VietQRPaymentComponent order={createdOrder} token={token} />
        </div>
      );
    }

    // Tính tổng tiền toàn đơn đã giảm giá
    const total = mycart.reduce(
      (sum, item) => sum + this.getItemPrice(item.product) * item.quantity,
      0,
    );

    return (
      <div className="checkout-page-wrapper">
        <div className="checkout-content-container">
          <h1 className="checkout-main-title">THANH TOÁN ĐƠN HÀNG</h1>
          <div className="checkout-grid">
            <div className="checkout-info-section">
              <h3 className="section-title">1. THÔNG TIN GIAO HÀNG</h3>
              <div className="checkout-form">
                <div className="form-group-item">
                  <label>Họ và tên khách hàng</label>
                  <input
                    type="text"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleInputChange}
                    placeholder="Nhập họ và tên..."
                  />
                </div>
                <div className="form-group-item">
                  <label>Số điện thoại nhận hàng</label>
                  <input
                    type="text"
                    name="phone"
                    value={this.state.phone}
                    onChange={this.handleInputChange}
                    placeholder="Nhập SĐT..."
                  />
                </div>
                <div className="form-group-item">
                  <label>Địa chỉ nhận hàng chi tiết</label>
                  <textarea
                    name="address"
                    value={this.state.address}
                    onChange={this.handleInputChange}
                    placeholder="Số nhà, tên đường..."
                    rows="3"
                  ></textarea>
                </div>
                <div className="form-group-item">
                  <label>Tỉnh / Thành phố</label>
                  <select
                    name="city"
                    value={this.state.city}
                    onChange={this.handleInputChange}
                    className="checkout-select-custom"
                  >
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                  </select>
                </div>
              </div>

              <h3 className="section-title mt-4" style={{ marginTop: "30px" }}>
                2. PHƯƠNG THỨC THANH TOÁN
              </h3>
              <div
                className="checkout-form"
                style={{
                  padding: "15px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "15px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={this.state.paymentMethod === "COD"}
                    onChange={this.handleInputChange}
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight:
                        this.state.paymentMethod === "COD" ? "bold" : "normal",
                    }}
                  >
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VietQR"
                    checked={this.state.paymentMethod === "VietQR"}
                    onChange={this.handleInputChange}
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight:
                        this.state.paymentMethod === "VietQR"
                          ? "bold"
                          : "normal",
                      color: "#ae7e17",
                    }}
                  >
                    Chuyển khoản qua App Ngân Hàng (VietQR)
                  </span>
                </label>
              </div>
            </div>

            <div className="checkout-summary-section">
              <h3 className="section-title">3. CHI TIẾT ĐƠN HÀNG</h3>
              <div className="summary-list">
                {mycart.map((item, index) => {
                  const itemPrice = this.getItemPrice(item.product);
                  const itemTotal = itemPrice * item.quantity;
                  const discountPercent = item.product.discountPercent || item.product.discount || 0;

                  return (
                    <div key={index} className="summary-product-item">
                      <div className="summary-img-box">
                        <img src={item.product.image} alt="" />
                      </div>
                      <div className="prod-detail">
                        <p className="p-name">{item.product.name}</p>
                        <div className="p-meta">
                          <span className="p-qty">SL: {item.quantity}</span>
                          <span className="p-price" style={{ color: "#ed1c24", fontWeight: "bold" }}>
                            {itemTotal.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        {discountPercent > 0 && (
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            Đã giảm {discountPercent}% (Đơn giá: {itemPrice.toLocaleString("vi-VN")}₫)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="final-bill-box">
                <div className="bill-row">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="bill-row">
                  <span>Vận chuyển</span>
                  <span className="free-ship">Miễn phí</span>
                </div>
                <div className="bill-divider"></div>
                <div className="bill-row total-grand">
                  <span>TỔNG CỘNG</span>
                  <span className="final-val" style={{ color: "#ed1c24", fontWeight: "800" }}>
                    {total.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <button
                  className="btn-final-checkout"
                  onClick={this.btnConfirmOrderClick}
                >
                  {this.state.paymentMethod === "VietQR"
                    ? "ĐẶT HÀNG & CHUYỂN KHOẢN"
                    : "XÁC NHẬN ĐẶT HÀNG"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CheckoutComponent;