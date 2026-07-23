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
      hoveredCustId: null, // State theo dõi hover dòng khách hàng
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  apiGetCustomers() {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .get(`${CONFIG.BASE_URL}/api/admin/customers`, config)
      .then((res) => {
        this.setState({ customers: res.data });
      })
      .catch((err) => console.log(err.message));
  }

  trCustomerClick(item) {
    this.setState({ customer: item });
    this.apiGetOrdersByCustID(item._id);
  }

  apiGetOrdersByCustID(cid) {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(`${CONFIG.BASE_URL}/api/orders/customer/${cid}`, config)
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
      .catch((err) => console.log(err.message));
  }

  render() {
    const { customers: custList, orders: orderList, customer, hoveredCustId } = this.state;


    const customers = custList.map((item) => {
      const isSelected = customer?._id === item._id;
      const isHovered = hoveredCustId === item._id;

      let bgColor = "#ffffff";
      if (isSelected) bgColor = "#fef3c7";
      else if (isHovered) bgColor = "#f8fafc";

      return (
        <tr
          key={item._id}
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
            #{item._id.substring(0, 6)}
          </td>
          <td style={{ fontWeight: isSelected ? "700" : "600", color: "#0f172a" }}>
            {item.name}
          </td>
          <td style={{ color: "#334155", fontSize: "0.9rem" }}>{item.phone}</td>
          <td style={{ color: "#64748b", fontSize: "0.9rem" }}>{item.email}</td>
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

    // Render danh sách đơn hàng của khách
    const orders = orderList.map((item) => {
      const orderDate = item.createdAt || item.cdate;
      const totalAmount = item.totalPrice || item.total || 0;
      const customerName = item.user?.name || customer?.name || "Khách hàng";

      // Cấu hình Badge trạng thái đơn hàng
      const getStatusBadge = (status) => {
        let bg = "#f1f5f9", text = "#475569", border = "#e2e8f0";
        if (status === "PENDING" || status === "Pending") {
          bg = "#fff7ed"; text = "#c2410c"; border = "#ffedd5";
        } else if (status === "PROCESSING" || status === "Processing") {
          bg = "#f0f9ff"; text = "#0369a1"; border = "#e0f2fe";
        } else if (status === "SHIPPED" || status === "Shipped") {
          bg = "#eff6ff"; text = "#1d4ed8"; border = "#dbeafe";
        } else if (status === "COMPLETED" || status === "Completed") {
          bg = "#f0fdf4"; text = "#15803d"; border = "#dcfce7";
        } else if (status === "CANCELLED" || status === "Cancelled") {
          bg = "#fef2f2"; text = "#b91c1c"; border = "#fee2e2";
        }

        return {
          padding: "5px 12px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "700",
          backgroundColor: bg,
          color: text,
          border: `1px solid ${border}`,
        };
      };

      return (
        <tr
          key={item._id}
          style={{
            borderBottom: "1px solid #f1f5f9",
            textAlign: "center",
            height: "50px",
            fontSize: "0.9rem",
          }}
        >
          <td style={{ fontWeight: "600", color: "#64748b" }}>#{item._id.substring(0, 6)}</td>
          <td style={{ color: "#475569" }}>
            {orderDate ? new Date(orderDate).toLocaleString("vi-VN") : "N/A"}
          </td>
          <td style={{ fontWeight: "600", color: "#0f172a" }}>{customerName}</td>
          <td style={{ fontWeight: "700", color: "#ae7e17" }}>
            {totalAmount.toLocaleString("vi-VN")} VNĐ
          </td>
          <td>
            <span style={getStatusBadge(item.status)}>
              {item.status}
            </span>
          </td>
        </tr>
      );
    });

    return (
      <div style={{ padding: "35px 30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>

        {/* BẢNG KHÁCH HÀNG */}
        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            marginBottom: "35px",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Quản Lý Khách Hàng</span>
            <span style={{ fontSize: "0.85rem", backgroundColor: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", color: "#64748b" }}>
              Tổng: {custList.length} khách
            </span>
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
                {customers.length > 0 ? (
                  customers
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      Không có dữ liệu khách hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BẢNG ĐƠN HÀNG CỦA KHÁCH HÀNG ĐƯỢC CHỌN */}
        {customer && (
          <div
            style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
              borderTop: "5px solid #ae7e17",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Lịch sử đơn hàng:{" "}
              <span style={{ color: "#ae7e17" }}>
                {customer.name}
              </span>
            </h3>

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
                  {orders.length > 0 ? (
                    orders
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "35px", color: "#94a3b8", fontStyle: "italic" }}>
                        Khách hàng này chưa thực hiện đơn hàng nào.
                      </td>
                    </tr>
                  )}
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