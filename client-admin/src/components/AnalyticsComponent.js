import React, { Component } from "react";
import axios from "axios";
import { CONFIG } from "../config";

class AnalyticsComponent extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = {
            selectedMonth: today.getMonth() + 1,
            selectedYear: today.getFullYear(),
            totalRevenue: 0,
            monthRevenue: 0,
            totalItemsSold: 0,
            products: [],
            sortOrder: "desc", // 'desc': cao xuống thấp, 'asc': thấp lên cao
            sortBy: "quantitySold", // 'quantitySold' hoặc 'totalSalesAmount'
            loading: false,
        };
    }

    componentDidMount() {
        this.apiGetAnalytics();
    }

    apiGetAnalytics = () => {
        const { selectedMonth, selectedYear } = this.state;
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        this.setState({ loading: true });
        axios
            .get(
                `${CONFIG.BASE_URL}/api/admin/analytics?month=${selectedMonth}&year=${selectedYear}`,
                config
            )
            .then((res) => {
                this.setState({
                    totalRevenue: res.data.totalRevenue || 0,
                    monthRevenue: res.data.monthRevenue || 0,
                    totalItemsSold: res.data.totalItemsSold || 0,
                    products: res.data.products || [],
                    loading: false,
                });
            })
            .catch((err) => {
                console.error(err);
                this.setState({ loading: false });
            });
    };

    handleMonthChange = (e) => {
        this.setState({ selectedMonth: parseInt(e.target.value) }, this.apiGetAnalytics);
    };

    handleYearChange = (e) => {
        this.setState({ selectedYear: parseInt(e.target.value) }, this.apiGetAnalytics);
    };

    toggleSortOrder = (field) => {
        const { sortBy, sortOrder } = this.state;
        if (sortBy === field) {
            this.setState({ sortOrder: sortOrder === "desc" ? "asc" : "desc" });
        } else {
            this.setState({ sortBy: field, sortOrder: "desc" });
        }
    };

    render() {
        const {
            selectedMonth,
            selectedYear,
            totalRevenue,
            monthRevenue,
            totalItemsSold,
            products,
            sortOrder,
            sortBy,
            loading,
        } = this.state;

        // Sắp xếp danh sách sản phẩm
        const sortedProducts = [...products].sort((a, b) => {
            const valA = a[sortBy] || 0;
            const valB = b[sortBy] || 0;
            return sortOrder === "desc" ? valB - valA : valA - valB;
        });

        const cardStyle = {
            flex: 1,
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            textAlign: "center",
        };

        return (
            <div style={{ padding: "35px 30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>

                {/* TIÊU ĐỀ & BỘ LỌC BẰNG THÁNG/NĂM */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <div>
                        <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            THỐNG KÊ DOANH THU & SẢN PHẨM
                        </h2>
                        <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                            Xem báo cáo bán hàng chi tiết theo thời gian
                        </p>
                    </div>

                    {/* BỘ CHỌN THÁNG VÀ NĂM */}
                    <div style={{ display: "flex", gap: "12px", background: "#fff", padding: "8px 15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div>
                            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", marginRight: "6px" }}>Tháng:</label>
                            <select value={selectedMonth} onChange={this.handleMonthChange} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", cursor: "pointer" }}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>Tháng {m}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", marginRight: "6px" }}>Năm:</label>
                            <select value={selectedYear} onChange={this.handleYearChange} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", cursor: "pointer" }}>
                                {[2024, 2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3 THẺ TỔNG QUAN */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "35px" }}>
                    <div style={cardStyle}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                            TỔNG DOANH THU TOÀN BỘ
                        </span>
                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", marginTop: "10px" }}>
                            {totalRevenue.toLocaleString("vi-VN")}đ
                        </div>
                    </div>

                    <div style={{ ...cardStyle, borderTop: "4px solid #ae7e17" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#ae7e17", textTransform: "uppercase" }}>
                            DOANH THU THÁNG {selectedMonth}/{selectedYear}
                        </span>
                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ae7e17", marginTop: "10px" }}>
                            {monthRevenue.toLocaleString("vi-VN")}đ
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                            SẢN PHẨM BÁN RA THÁNG {selectedMonth}
                        </span>
                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#16a34a", marginTop: "10px" }}>
                            {totalItemsSold} cái
                        </div>
                    </div>
                </div>

                {/* BẢNG DANH SÁCH SẢN PHẨM VÀ SẮP XẾP */}
                <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                            CHI TIẾT SẢN PHẨM BÁN ĐƯỢC IN THÁNG {selectedMonth}/{selectedYear}
                        </h3>

                        {/* NÚT ĐỔI CHIỀU SẮP XẾP */}
                        <button
                            onClick={() => this.setState({ sortOrder: sortOrder === "desc" ? "asc" : "desc" })}
                            style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ae7e17", backgroundColor: "#fffbebe6", color: "#ae7e17", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                            Thứ tự: {sortOrder === "desc" ? "⬇ Từ Cao đến Thấp" : "⬆ Từ Thấp đến Cao"}
                        </button>
                    </div>

                    <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ backgroundColor: "#0f172a", color: "#fff", height: "45px" }}>
                                <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    <th style={{ padding: "12px 15px", textAlign: "left" }}>Tên Sản Phẩm</th>
                                    <th
                                        onClick={() => this.toggleSortOrder("quantitySold")}
                                        style={{ padding: "12px 15px", textAlign: "center", cursor: "pointer", backgroundColor: sortBy === "quantitySold" ? "#1e293b" : "transparent" }}
                                    >
                                        Số Lượng Bán {sortBy === "quantitySold" ? (sortOrder === "desc" ? "▼" : "▲") : ""}
                                    </th>
                                    <th
                                        onClick={() => this.toggleSortOrder("totalSalesAmount")}
                                        style={{ padding: "12px 15px", textAlign: "right", cursor: "pointer", backgroundColor: sortBy === "totalSalesAmount" ? "#1e293b" : "transparent" }}
                                    >
                                        Tổng Tiền Thu Về {sortBy === "totalSalesAmount" ? (sortOrder === "desc" ? "▼" : "▲") : ""}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Đang tải dữ liệu...</td>
                                    </tr>
                                ) : sortedProducts.length > 0 ? (
                                    sortedProducts.map((p, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", height: "48px" }}>
                                            <td style={{ padding: "12px 15px", fontWeight: "600", color: "#0f172a" }}>{p.name}</td>
                                            <td style={{ textAlign: "center", fontWeight: "700", color: "#16a34a" }}>{p.quantitySold}</td>
                                            <td style={{ textAlign: "right", paddingRight: "15px", fontWeight: "700", color: "#ae7e17" }}>
                                                {p.totalSalesAmount.toLocaleString("vi-VN")}đ
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "35px", color: "#94a3b8", fontStyle: "italic" }}>
                                            Không có sản phẩm nào bán ra trong tháng {selectedMonth}/{selectedYear}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default AnalyticsComponent;