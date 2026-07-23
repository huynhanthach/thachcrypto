import React, { Component } from "react";
import axios from "axios";
import { CONFIG } from '../config';

class CustomerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      customer: null,
      hoveredCustId: null,

      // State cho Lọc Top Khách Hàng
      filterMonth: "all",
      filterYear: new Date().getFullYear(),

      // State cho Form Tặng Khuyến Mãi (Tiền VNĐ)
      showVoucherForm: false,
      voucherAmount: 50000, // Mặc định giảm 50.000đ
      voucherQty: 1,

      // State lưu trữ số liệu thống kê voucher (Số lượng & Tiền)
      voucherStats: {
        qty: { total: 0, used: 0, unused: 0 },
        amount: { total: 0, used: 0, unused: 0 }
      }
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  apiGetCustomers = () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .get(`${CONFIG.BASE_URL}/api/admin/customers`, config)
      .then((res) => {
        this.setState({ customers: res.data, customer: null, orders: [] });
      })
      .catch((err) => console.log(err.message));
  }

  apiGetTopCustomers = () => {
    const { filterMonth, filterYear } = this.state;
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    let url = `${CONFIG.BASE_URL}/api/admin/customers/top-buyers?year=${filterYear}`;
    if (filterMonth !== "all") url += `&month=${filterMonth}`;

    axios
      .get(url, config)
      .then((res) => {
        this.setState({ customers: res.data, customer: null, orders: [] });
      })
      .catch((err) => {
        alert("Chưa có API backend cho tính năng lọc Top Khách Hàng!");
        console.log(err.message);
      });
  }

  trCustomerClick(item) {
    // Reset state thống kê khi bấm sang khách hàng khác
    this.setState({
      customer: item,
      showVoucherForm: false,
      voucherStats: {
        qty: { total: 0, used: 0, unused: 0 },
        amount: { total: 0, used: 0, unused: 0 }
      }
    });
    this.apiGetOrdersByCustID(item._id);
    this.apiGetVoucherStats(item._id); // Gọi hàm lấy thống kê voucher
  }

  apiGetOrdersByCustID(cid) {
    if (!cid) return;

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(`${CONFIG.BASE_URL}/api/admin/orders/customer/${cid}`, config)
      .then((res) => {
        let fetchedOrders = [];
        if (Array.isArray(res.data)) {
          fetchedOrders = res.data;
        } else if (res.data && Array.isArray(res.data.orders)) {
          fetchedOrders = res.data.orders;
        } else if (res.data && Array.isArray(res.data.data)) {
          fetchedOrders = res.data.data;
        }
        this.setState({ orders: fetchedOrders });
      })
      .catch((err) => {
        console.log("Lỗi lấy đơn hàng:", err.message);
      });
  }

  // API lấy thống kê số lượng và tổng tiền Voucher
  apiGetVoucherStats = (cid) => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(`${CONFIG.BASE_URL}/api/admin/customers/${cid}/vouchers/stats`, config)
      .then((res) => {
        if (res.data && res.data.qty && res.data.amount) {
          this.setState({ voucherStats: res.data });
        }
      })
      .catch((err) => console.log("Lỗi lấy thống kê voucher:", err.message));
  }

  btnSendVoucherClick = () => {
    const { customer, voucherAmount, voucherQty } = this.state;
    if (!customer) return;

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const body = {
      customerId: customer._id,
      amount: Number(voucherAmount),
      quantity: Number(voucherQty)
    };

    axios
      .post(`${CONFIG.BASE_URL}/api/admin/customers/grant-voucher`, body, config)
      .then((res) => {
        alert(`Thành công! Đã tặng ${voucherQty} vé giảm ${Number(voucherAmount).toLocaleString("vi-VN")}đ cho KH: ${customer.name}`);
        this.setState({ showVoucherForm: false, voucherAmount: 50000, voucherQty: 1 });

        // Tặng xong gọi lại hàm này để load lại bảng thống kê voucher mới nhất
        this.apiGetVoucherStats(customer._id);
      })
      .catch((err) => {
        alert("Chưa có API backend cho tính năng Tặng Voucher!");
        console.log(err.message);
      });
  }

  render() {
    const { customers: custList, orders: orderList, customer, hoveredCustId, showVoucherForm, voucherStats } = this.state;

    const customers = custList.map((item) => {
      const isSelected = customer?._id === item._id;
      const isHovered = hoveredCustId === item._id;

      let bgColor = "#ffffff";
      if (isSelected) bgColor = "#fef3c7";
      else if (isHovered) bgColor = "#f8fafc";

      const totalSpentStr = item.totalSpent ? ` - Đã chi: ${item.totalSpent.toLocaleString("vi-VN")}đ` : "";

      return (
        <tr
          key={item._id || Math.random()}
          onClick={() => this.trCustomerClick(item)}
          onMouseEnter={() => this.setState({ hoveredCustId: item._id })}
          onMouseLeave={() => this.setState({ hoveredCustId: null })}
          style={{
            cursor: "pointer",
            backgroundColor: bgColor,
            borderBottom: "1px solid #f1f5f9",
            textAlign: "center",
            height: "52px",
            borderLeft: isSelected ? "4px solid #ae7e17" : "4px solid transparent",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <td style={{ fontSize: "0.85rem", color: isSelected ? "#ae7e17" : "#64748b", fontWeight: "600" }}>
            #{item._id ? item._id.substring(0, 6) : "N/A"}
          </td>
          <td style={{ fontWeight: isSelected ? "700" : "600", color: "#0f172a" }}>
            {item.name || "Khách ẩn danh"} <span style={{ fontSize: "0.8rem", color: "#e11d48", fontWeight: "normal" }}>{totalSpentStr}</span>
          </td>
          <td style={{ color: "#334155", fontSize: "0.9rem" }}>{item.phone || "---"}</td>
          <td style={{ color: "#64748b", fontSize: "0.9rem" }}>{item.email || "---"}</td>
          <td>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: item.active === 0 ? "#fef2f2" : "#f0fdf4",
                color: item.active === 0 ? "#dc2626" : "#16a34a",
                border: item.active === 0 ? "1px solid #fecaca" : "1px solid #bbf7d0",
              }}
            >
              {item.active === 0 ? "BỊ KHÓA" : "HOẠT ĐỘNG"}
            </span>
          </td>
        </tr>
      );
    });

    const orders = orderList.map((item) => {
      const orderDate = item.createdAt || item.cdate;
      const totalAmount = item.totalPrice || item.total || 0;
      const customerName = item.user?.name || customer?.name || "Khách hàng";

      const getStatusBadge = (status) => {
        let bg = "#f1f5f9", text = "#475569", border = "#e2e8f0";
        if (status === "PENDING" || status === "Pending") { bg = "#fff7ed"; text = "#c2410c"; border = "#ffedd5"; }
        else if (status === "PROCESSING" || status === "Processing") { bg = "#f0f9ff"; text = "#0369a1"; border = "#e0f2fe"; }
        else if (status === "SHIPPED" || status === "Shipped") { bg = "#eff6ff"; text = "#1d4ed8"; border = "#dbeafe"; }
        else if (status === "COMPLETED" || status === "Completed") { bg = "#f0fdf4"; text = "#15803d"; border = "#dcfce7"; }
        else if (status === "CANCELLED" || status === "Cancelled") { bg = "#fef2f2"; text = "#b91c1c"; border = "#fee2e2"; }
        return { padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: bg, color: text, border: `1px solid ${border}` };
      };

      return (
        <tr key={item._id || Math.random()} style={{ borderBottom: "1px solid #f1f5f9", textAlign: "center", height: "50px", fontSize: "0.9rem" }}>
          <td style={{ fontWeight: "600", color: "#64748b" }}>
            #{item._id ? item._id.substring(0, 6) : "N/A"}
          </td>
          <td style={{ color: "#475569" }}>
            {orderDate ? new Date(orderDate).toLocaleString("vi-VN") : "N/A"}
          </td>
          <td style={{ fontWeight: "600", color: "#0f172a" }}>{customerName}</td>
          <td style={{ fontWeight: "700", color: "#ae7e17" }}>
            {totalAmount ? totalAmount.toLocaleString("vi-VN") : "0"} VNĐ
          </td>
          <td><span style={getStatusBadge(item.status)}>{item.status || "N/A"}</span></td>
        </tr>
      );
    });

    return (
      <div style={{ padding: "35px 30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", background: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontWeight: "600", color: "#0f172a" }}>Tìm KH mua nhiều nhất:</span>
          <select
            value={this.state.filterMonth}
            onChange={(e) => this.setState({ filterMonth: e.target.value })}
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
          >
            <option value="all">Toàn bộ thời gian</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <input
            type="number"
            value={this.state.filterYear}
            onChange={(e) => this.setState({ filterYear: e.target.value })}
            style={{ padding: "8px", width: "90px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
            placeholder="Năm"
          />
          <button
            onClick={this.apiGetTopCustomers}
            style={{ padding: "8px 15px", background: "#ae7e17", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600" }}
          >
            LỌC
          </button>
          <button
            onClick={this.apiGetCustomers}
            style={{ padding: "8px 15px", background: "#64748b", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", marginLeft: "auto" }}
          >
            LÀM MỚI DANH SÁCH
          </button>
        </div>

        <div style={{ background: "#ffffff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", marginBottom: "35px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#0f172a", marginBottom: "20px", textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Quản Lý Khách Hàng</span>
            <span style={{ fontSize: "0.85rem", backgroundColor: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", color: "#64748b" }}>Tổng: {custList.length} khách</span>
          </h2>

          <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#0f172a", color: "#fff", height: "48px" }}>
                <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "10px" }}>Mã ID</th>
                  <th style={{ padding: "10px" }}>Tên khách hàng</th>
                  <th style={{ padding: "10px" }}>Điện thoại</th>
                  <th style={{ padding: "10px" }}>Email</th>
                  <th style={{ padding: "10px" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? customers : <tr><td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Không có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {customer && (
          <div style={{ background: "#ffffff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", borderTop: "5px solid #ae7e17" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", margin: 0 }}>
                Lịch sử đơn hàng: <span style={{ color: "#ae7e17" }}>{customer.name}</span>
              </h3>

              <button
                onClick={() => this.setState({ showVoucherForm: !showVoucherForm })}
                style={{ padding: "8px 20px", background: "#10b981", color: "#fff", fontWeight: "bold", border: "none", borderRadius: "20px", cursor: "pointer" }}
              >
                🎁 TẶNG MÃ KHUYẾN MÃI
              </button>
            </div>

            {/* BẢNG THỐNG KÊ VOUCHER (SỐ LƯỢNG & TIỀN) */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 25px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "20px" }}>

              {/* TỔNG ĐÃ TẶNG */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" }}>🏷️ Tổng đã tặng</span>
                <span style={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: "700" }}>
                  {voucherStats.qty.total} vé
                </span>
                <span style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: "600" }}>
                  ({voucherStats.amount.total.toLocaleString("vi-VN")}đ)
                </span>
              </div>

              <div style={{ width: "1px", backgroundColor: "#e2e8f0" }}></div>

              {/* ĐÃ SỬ DỤNG */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" }}>✅ Đã sử dụng</span>
                <span style={{ color: "#16a34a", fontSize: "1.1rem", fontWeight: "700" }}>
                  {voucherStats.qty.used} vé
                </span>
                <span style={{ color: "#15803d", fontSize: "0.9rem", fontWeight: "600" }}>
                  ({voucherStats.amount.used.toLocaleString("vi-VN")}đ)
                </span>
              </div>

              <div style={{ width: "1px", backgroundColor: "#e2e8f0" }}></div>

              {/* CHƯA SỬ DỤNG */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" }}>⏳ Hiện tại (Chưa xài)</span>
                <span style={{ color: "#e11d48", fontSize: "1.1rem", fontWeight: "700" }}>
                  {voucherStats.qty.unused} vé
                </span>
                <span style={{ color: "#be123c", fontSize: "0.9rem", fontWeight: "600" }}>
                  ({voucherStats.amount.unused.toLocaleString("vi-VN")}đ)
                </span>
              </div>

            </div>

            {/* FORM TẶNG VOUCHER */}
            {showVoucherForm && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "15px", borderRadius: "8px", marginBottom: "20px", display: "flex", gap: "15px", alignItems: "center" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#065f46" }}>Số tiền giảm (VNĐ):</label><br />
                  <input
                    type="number" min="1000" step="1000"
                    value={this.state.voucherAmount}
                    onChange={(e) => this.setState({ voucherAmount: e.target.value })}
                    style={{ padding: "6px", width: "130px", borderRadius: "4px", border: "1px solid #a7f3d0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#065f46" }}>Số lượng vé:</label><br />
                  <input
                    type="number" min="1"
                    value={this.state.voucherQty}
                    onChange={(e) => this.setState({ voucherQty: e.target.value })}
                    style={{ padding: "6px", width: "80px", borderRadius: "4px", border: "1px solid #a7f3d0" }}
                  />
                </div>
                <button
                  onClick={this.btnSendVoucherClick}
                  style={{ padding: "8px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginTop: "18px" }}
                >
                  XÁC NHẬN TẶNG
                </button>
              </div>
            )}

            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f1f5f9", color: "#475569", height: "45px" }}>
                  <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders : <tr><td colSpan="5" style={{ textAlign: "center", padding: "35px", color: "#94a3b8", fontStyle: "italic" }}>Khách hàng này chưa thực hiện đơn hàng nào.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CustomerComponent;