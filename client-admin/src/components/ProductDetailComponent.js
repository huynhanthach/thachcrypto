import React, { Component } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CONFIG } from '../config';

class ProductDetailComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtName: "",
      txtPrice: 0,
      txtBrand: "",
      txtCategory: "",
      txtImage: "",
      txtStock: 0,
      txtDesc: "",
      txtDiscountPercent: 0,
      hoveredBtn: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item && this.props.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name || "",
        txtPrice: this.props.item.originalPrice || this.props.item.price || 0,
        txtBrand: this.props.item.brand || "",
        txtCategory: this.props.item.category?._id || this.props.item.category || "",
        txtImage: this.props.item.image || "",
        txtStock: this.props.item.countInStock || 0,
        txtDesc: this.props.item.description || "",
        txtDiscountPercent: Number(this.props.item.discountPercent || 0),
      });
    }
  }

  captureFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => this.setState({ txtImage: reader.result });
    }
  };

  btnUpdateClick = (e) => {
    e.preventDefault();

    const {
      txtID,
      txtName,
      txtPrice,
      txtBrand,
      txtCategory,
      txtImage,
      txtStock,
      txtDesc,
      txtDiscountPercent,
    } = this.state;

    // 1. Kiểm tra validation các trường bắt buộc
    if (!txtName.trim() || !txtBrand || !txtCategory) {
      Swal.fire({
        title: "THIẾU THÔNG TIN",
        text: "Vui lòng nhập đầy đủ Tên, Hãng và Danh mục sản phẩm!",
        icon: "warning",
        confirmButtonColor: "#ae7e17",
      });
      return;
    }

    if (Number(txtPrice) <= 0) {
      Swal.fire({
        title: "GIÁ KHÔNG HỢP LỆ",
        text: "Vui lòng nhập giá gốc lớn hơn 0!",
        icon: "warning",
        confirmButtonColor: "#ae7e17",
      });
      return;
    }

    // 2. Chuẩn bị payload gửi lên Server
    const product = {
      name: txtName.trim(),
      price: Number(txtPrice) || 0,
      brand: txtBrand,
      category: txtCategory,
      image: txtImage,
      countInStock: Number(txtStock) || 0,
      description: txtDesc.trim(),
      discountPercent: Number(txtDiscountPercent) || 0,
    };

    // 3. Lấy Token xác thực của Admin (CỰC KỲ QUAN TRỌNG)
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    // 4. Gọi API Cập nhật hoặc Thêm mới
    if (txtID) {
      axios
        .put(`${CONFIG.BASE_URL}/api/products/${txtID}`, product, config)
        .then(() => {
          Swal.fire({
            title: "THÀNH CÔNG",
            text: "Cập nhật thông tin sản phẩm thành công!",
            icon: "success",
            confirmButtonColor: "#ae7e17",
          });
          this.props.updateProducts();
        })
        .catch((err) => {
          console.error(err);
          const msg = err.response?.data?.message || "Lỗi khi cập nhật sản phẩm!";
          Swal.fire("LỖI HỆ THỐNG", msg, "error");
        });
    } else {
      axios
        .post(`${CONFIG.BASE_URL}/api/products`, product, config)
        .then(() => {
          Swal.fire({
            title: "THÀNH CÔNG",
            text: "Đã thêm sản phẩm mới vào hệ thống!",
            icon: "success",
            confirmButtonColor: "#ae7e17",
          });
          this.props.updateProducts();
          this.clearForm();
        })
        .catch((err) => {
          console.error(err);
          const msg = err.response?.data?.message || "Lỗi khi thêm sản phẩm mới!";
          Swal.fire("LỖI HỆ THỐNG", msg, "error");
        });
    }
  };

  btnDeleteClick = (e) => {
    e.preventDefault();
    if (!this.state.txtID) return;

    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Sản phẩm này sẽ bị xóa vĩnh viễn khỏi danh mục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        axios
          .delete(`${CONFIG.BASE_URL}/api/products/${this.state.txtID}`, config)
          .then(() => {
            Swal.fire({
              title: "ĐÃ XÓA",
              text: "Sản phẩm đã được gỡ bỏ!",
              icon: "success",
              confirmButtonColor: "#ae7e17",
            });
            this.props.updateProducts();
            this.clearForm();
          })
          .catch((err) => {
            const msg = err.response?.data?.message || "Lỗi khi xóa sản phẩm!";
            Swal.fire("LỖI HỆ THỐNG", msg, "error");
          });
      }
    });
  };

  clearForm = (e) => {
    if (e) e.preventDefault();
    this.setState({
      txtID: "",
      txtName: "",
      txtPrice: 0,
      txtBrand: "",
      txtCategory: "",
      txtImage: "",
      txtStock: 0,
      txtDesc: "",
      txtDiscountPercent: 0,
    });
  };

  render() {
    const {
      txtID,
      txtName,
      txtPrice,
      txtBrand,
      txtCategory,
      txtImage,
      txtStock,
      txtDesc,
      txtDiscountPercent,
      hoveredBtn,
    } = this.state;

    const inputStyle = {
      width: "100%",
      padding: "10px 12px",
      marginBottom: "12px",
      boxSizing: "border-box",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "0.9rem",
      outline: "none",
      backgroundColor: "#ffffff",
    };

    const defaultBrands = ["LEDGER", "TREZOR", "SAFEPAL", "TANGEM", "KHÁC"];
    const combinedBrands = [
      ...new Set([...defaultBrands, ...(this.props.brands || [])]),
    ];

    const getBtnStyle = (btnKey, bgNormal, bgHover) => {
      const isHovered = hoveredBtn === btnKey;
      return {
        flex: 1,
        padding: "12px",
        background: isHovered ? bgHover : bgNormal,
        color: "#ffffff",
        border: "none",
        fontWeight: "700",
        fontSize: "0.85rem",
        cursor: "pointer",
        borderRadius: "8px",
        boxShadow: isHovered ? `0 6px 15px -3px ${bgNormal}66` : "0 2px 4px rgba(0,0,0,0.05)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    };

    return (
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          borderTop: "5px solid #ae7e17",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "12px",
            color: "#0f172a",
            fontSize: "1.1rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {txtID ? "CẬP NHẬT SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
        </h3>

        {/* HÌNH ANH PREVIEW */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {txtImage ? (
            <img
              src={txtImage}
              width="140"
              height="140"
              alt="Preview"
              style={{
                objectFit: "contain",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "5px",
                backgroundColor: "#fff",
              }}
            />
          ) : (
            <div
              style={{
                width: "140px",
                height: "140px",
                margin: "0 auto",
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              CHƯA CÓ ẢNH
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={this.captureFile}
            style={{
              marginTop: "12px",
              display: "block",
              width: "100%",
              fontSize: "12px",
              color: "#64748b",
            }}
          />
        </div>

        {/* TÊN SẢN PHẨM */}
        <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase" }}>
          TÊN SẢN PHẨM <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          style={inputStyle}
          value={txtName}
          onChange={(e) => this.setState({ txtName: e.target.value })}
          placeholder="Nhập tên sản phẩm..."
        />

        {/* GIÁ GỐC VÀ TỒN KHO */}
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase" }}>
              GIÁ GỐC (VNĐ) <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="number"
              style={inputStyle}
              value={txtPrice}
              onChange={(e) => this.setState({ txtPrice: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase" }}>
              TỒN KHO
            </label>
            <input
              type="number"
              style={inputStyle}
              value={txtStock}
              onChange={(e) => this.setState({ txtStock: e.target.value })}
            />
          </div>
        </div>

        {/* GIẢM GIÁ (%) */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            GIẢM GIÁ (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            style={inputStyle}
            value={txtDiscountPercent}
            onChange={(e) => this.setState({ txtDiscountPercent: e.target.value })}
            placeholder="Nhập % giảm giá (ví dụ: 20)"
          />
        </div>

        {/* HÃNG VÀ DANH MỤC */}
        <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase" }}>
          HÃNG & DANH MỤC <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: "15px" }}>
          <select
            style={inputStyle}
            value={txtBrand}
            onChange={(e) => this.setState({ txtBrand: e.target.value })}
          >
            <option value="">-- Chọn Hãng --</option>
            {combinedBrands.map((brand, index) => (
              <option key={index} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={txtCategory}
            onChange={(e) => this.setState({ txtCategory: e.target.value })}
          >
            <option value="">-- Danh Mục --</option>
            {(this.props.categories || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* MÔ TẢ KĨ THUẬT */}
        <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase" }}>
          MÔ TẢ KĨ THUẬT
        </label>
        <textarea
          style={{ ...inputStyle, height: "90px", resize: "vertical" }}
          value={txtDesc}
          onChange={(e) => this.setState({ txtDesc: e.target.value })}
          placeholder="Nhập thông số kỹ thuật (Cấu hình, kích thước, tính năng...)"
        />

        {/* NHÓM NÚT BẤM THAO TÁC */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button
            onClick={this.btnUpdateClick}
            onMouseEnter={() => this.setState({ hoveredBtn: "save" })}
            onMouseLeave={() => this.setState({ hoveredBtn: null })}
            style={getBtnStyle("save", "#ae7e17", "#936813")}
          >
            {txtID ? "CẬP NHẬT SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
          </button>

          {txtID && (
            <button
              onClick={this.btnDeleteClick}
              onMouseEnter={() => this.setState({ hoveredBtn: "delete" })}
              onMouseLeave={() => this.setState({ hoveredBtn: null })}
              style={getBtnStyle("delete", "#dc2626", "#b91c1c")}
            >
              XÓA
            </button>
          )}

          <button
            onClick={this.clearForm}
            onMouseEnter={() => this.setState({ hoveredBtn: "reset" })}
            onMouseLeave={() => this.setState({ hoveredBtn: null })}
            style={getBtnStyle("reset", "#64748b", "#475569")}
          >
            LÀM MỚI
          </button>
        </div>
      </div>
    );
  }
}

export default ProductDetailComponent;