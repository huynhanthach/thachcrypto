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

      vouchers: [],
      selectedVoucherCode: "",
      discountAmount: 0
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
        }, () => {
          this.apiGetMyVouchers();
        });
      } else {
        window.location.href = "/login";
      }
    }, 200);
  }

  apiGetMyVouchers = () => {
    const { token } = this.context;
    if (!token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get(`${CONFIG.BASE_URL}/api/orders/vouchers/mine`, config)
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          this.setState({ vouchers: res.data });
        }
      })
      .catch(err => console.log("Lỗi tải voucher:", err.message));
  }

  // HÀM QUAN TRỌNG: Sửa lỗi không nhập được chữ
  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleVoucherChange = (e) => {
    const code = e.target.value;
    const { vouchers } = this.state;

    if (!code) {
      this.setState({ selectedVoucherCode: "", discountAmount: 0 });
      return;
    }

    const selectedVoucher = vouchers.find(v => v.code === code);
    if (selectedVoucher) {
      this.setState({
        selectedVoucherCode: code,
        discountAmount: selectedVoucher.discountAmount
      });
    }
  };

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
    const { name, address, phone, city, paymentMethod, selectedVoucherCode, discountAmount } = this.state;

    if (!address.trim() || !phone.trim() || !name.trim()) {
      Swal.fire(
        "THÔNG BÁO",
        "Vui lòng hoàn thiện thông tin giao hàng!",
        "warning",
      );
      return;
    }

    const rawTotal = mycart.reduce(
      (sum, item) => sum + this.getItemPrice(item.product) * item.quantity,
      0,
    );

    const finalTotal = Math.max(0, rawTotal - discountAmount);

    const orderData = {
      orderItems: mycart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.image,
        price: this.getItemPrice(item.product),
        product: item.product._id,
      })),
      shippingAddress: { address, city, phone },
      paymentMethod: paymentMethod,
      totalPrice: finalTotal,
      voucherCode: selectedVoucherCode,
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
    const { isReady, createdOrder, paymentMethod, vouchers, selectedVoucherCode, discountAmount } = this.state;

    if (!isReady) return <div className="p-loading">ĐANG TẢI...</div>;

    if (createdOrder && paymentMethod === "VietQR") {
      return (
        <div className="checkout-page-wrapper">
          <VietQRPaymentComponent order={createdOrder} token={token} />
        </div>
      );
    }

    const subTotal = mycart.reduce(
      (sum, item) => sum + this.getItemPrice(item.product) * item.quantity,
      0,
    );

    const finalTotal = Math.max(0, subTotal - discountAmount);

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
                    value={this.state.name || ""}
                    onChange={this.handleInputChange}
                    placeholder="Nhập họ và tên..."
                  />
                </div>
                <div className="form-group-item">
                  <label>Số điện thoại nhận hàng</label>
                  <input
                    type="text"
                    name="phone"
                    value={this.state.phone || ""}
                    onChange={this.handleInputChange}
                    placeholder="Nhập SĐT..."
                  />
                </div>
                <div className="form-group-item">
                  <label>Địa chỉ nhận hàng chi tiết</label>
                  <textarea
                    name="address"
                    value={this.state.address || ""}
                    onChange={this.handleInputChange}
                    placeholder="Số nhà, tên đường..."
                    rows="3"
                  ></textarea>
                </div>
                <div className="form-group-item">
                  <label>Tỉnh / Thành phố</label>
                  <select
                    name="city"
                    value={this.state.city || "TP. Hồ Chí Minh"}
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
                <label style={{ display: "flex", alignItems: "center", marginBottom: "15px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={this.state.paymentMethod === "COD"}
                    onChange={this.handleInputChange}
                    style={{ width: "20px", height: "20px", marginRight: "10px" }}
                  />
                  <span style={{ fontSize: "16px", fontWeight: this.state.paymentMethod === "COD" ? "bold" : "normal" }}>
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VietQR"
                    checked={this.state.paymentMethod === "VietQR"}
                    onChange={this.handleInputChange}
                    style={{ width: "20px", height: "20px", marginRight: "10px" }}
                  />
                  <span style={{ fontSize: "16px", fontWeight: this.state.paymentMethod === "VietQR" ? "bold" : "normal", color: "#ae7e17" }}>
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

              {/* VÙNG CHỌN VOUCHER ĐÃ ĐƯỢC ẨN ĐI NẾU KHÔNG CÓ MÃ */}
              {vouchers && vouchers.length > 0 && (
                <div style={{ margin: "20px 0", padding: "15px", background: "#f0fdf4", border: "1px dashed #16a34a", borderRadius: "8px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#16a34a" }}>
                    🎁 Áp dụng Voucher (Bạn có {vouchers.length} mã)
                  </label>
                  <select
                    value={selectedVoucherCode}
                    onChange={this.handleVoucherChange}
                    style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #bbf7d0", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">-- Không sử dụng Voucher --</option>
                    {vouchers.map(v => (
                      <option key={v.code} value={v.code}>
                        Giảm {v.discountAmount.toLocaleString("vi-VN")}đ (Mã: {v.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="final-bill-box">
                <div className="bill-row">
                  <span>Tạm tính</span>
                  <span>{subTotal.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="bill-row">
                  <span>Vận chuyển</span>
                  <span className="free-ship">Miễn phí</span>
                </div>

                {discountAmount > 0 && (
                  <div className="bill-row" style={{ color: "#16a34a", fontWeight: "bold" }}>
                    <span>Voucher khuyến mãi</span>
                    <span>- {discountAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}

                <div className="bill-divider"></div>
                <div className="bill-row total-grand">
                  <span>TỔNG CỘNG</span>
                  <span className="final-val" style={{ color: "#ed1c24", fontWeight: "800" }}>
                    {finalTotal.toLocaleString("vi-VN")}₫
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