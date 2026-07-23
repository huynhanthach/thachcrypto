import React, { Component } from "react";
import axios from "axios";
import { CONFIG } from '../config';

class CategoryDetailComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtName: "",
      hoveredBtn: null, // Thêm state nhận biết nút đang hover
      isInputFocused: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item && this.props.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
      });
    }
  }

  btnAddTaskClick = (e) => {
    e.preventDefault();
    const { txtName } = this.state;
    if (txtName) {
      axios
        .post(`${CONFIG.BASE_URL}/api/categories`, {
          name: txtName,
        })
        .then((res) => {
          alert("Thêm danh mục thành công!");
          this.btnResetClick(e);
          this.props.updateCategories();
        })
        .catch((err) => alert(err.response?.data?.message || "Lỗi khi thêm"));
    } else {
      alert("Vui lòng nhập tên danh mục");
    }
  };

  btnUpdateClick = (e) => {
    e.preventDefault();
    const { txtID, txtName } = this.state;
    if (txtID && txtName) {
      axios
        .put(`${CONFIG.BASE_URL}/api/categories/${txtID}`, {
          name: txtName,
        })
        .then((res) => {
          alert("Cập nhật thành công");
          this.props.updateCategories();
        })
        .catch((err) => alert("Lỗi khi cập nhật"));
    }
  };

  btnDeleteClick = (e) => {
    e.preventDefault();
    if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
      axios
        .delete(`${CONFIG.BASE_URL}/api/categories/${this.state.txtID}`)
        .then((res) => {
          alert("Đã xóa");
          this.btnResetClick(e);
          this.props.updateCategories();
        })
        .catch((err) => alert("Lỗi khi xóa"));
    }
  };

  btnResetClick = (e) => {
    if (e) e.preventDefault();
    this.setState({ txtID: "", txtName: "" });
  };

  render() {
    const { txtID, txtName, hoveredBtn, isInputFocused } = this.state;

    // Style cơ bản cho ô input
    const getInputStyle = (isReadOnly = false) => ({
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: isReadOnly
        ? "1px solid #e2e8f0"
        : isInputFocused
          ? "1px solid #ae7e17"
          : "1px solid #cbd5e1",
      boxSizing: "border-box",
      marginTop: "6px",
      fontSize: "0.95rem",
      color: isReadOnly ? "#94a3b8" : "#0f172a",
      backgroundColor: isReadOnly ? "#f8fafc" : "#ffffff",
      outline: "none",
      boxShadow: !isReadOnly && isInputFocused ? "0 0 0 3px rgba(174, 126, 23, 0.15)" : "none",
      transition: "all 0.2s ease-in-out",
    });

    // Function tạo style linh hoạt cho Nút bấm + Hiệu ứng Hover
    const getBtnStyle = (btnType, bgNormal, bgHover) => {
      const isHovered = hoveredBtn === btnType;
      return {
        padding: "12px 20px",
        border: "none",
        borderRadius: "8px",
        fontWeight: "700",
        fontSize: "0.85rem",
        letterSpacing: "0.5px",
        cursor: "pointer",
        flex: 1,
        minWidth: "100px",
        color: "#ffffff",
        backgroundColor: isHovered ? bgHover : bgNormal,
        boxShadow: isHovered
          ? `0 6px 15px -3px ${bgNormal}66`
          : "0 2px 4px rgba(0,0,0,0.05)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    };

    return (
      <div
        style={{
          padding: "25px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
          borderTop: "5px solid #ae7e17", // Thanh điểm nhấn màu chủ đạo phía trên
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#0f172a",
            fontSize: "1.1rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {txtID ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
        </h3>

        <form>
          {/* FIELD MÃ ID */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Mã ID danh mục:
            </label>
            <input
              type="text"
              value={txtID ? `#${txtID}` : "Hệ thống tự động tạo"}
              readOnly
              style={getInputStyle(true)}
            />
          </div>

          {/* FIELD TÊN DANH MỤC */}
          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Tên danh mục <span style={{ color: "#ed1c24" }}>*</span>
            </label>
            <input
              type="text"
              value={txtName}
              onChange={(e) => this.setState({ txtName: e.target.value })}
              onFocus={() => this.setState({ isInputFocused: true })}
              onBlur={() => this.setState({ isInputFocused: false })}
              placeholder="Nhập tên danh mục linh kiện..."
              style={getInputStyle(false)}
            />
          </div>

          {/* NHÓM NÚT THAO TÁC (CÓ NỔI HOVER) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {!txtID ? (
              /* NÚT THÊM MỚI (MÀU CHỦ ĐẠO #ae7e17) */
              <button
                onClick={this.btnAddTaskClick}
                onMouseEnter={() => this.setState({ hoveredBtn: "add" })}
                onMouseLeave={() => this.setState({ hoveredBtn: null })}
                style={getBtnStyle("add", "#ae7e17", "#936813")}
              >
                THÊM MỚI
              </button>
            ) : (
              <>
                {/* NÚT CẬP NHẬT (MÀU CHỦ ĐẠO #ae7e17) */}
                <button
                  onClick={this.btnUpdateClick}
                  onMouseEnter={() => this.setState({ hoveredBtn: "update" })}
                  onMouseLeave={() => this.setState({ hoveredBtn: null })}
                  style={getBtnStyle("update", "#ae7e17", "#936813")}
                >
                  CẬP NHẬT
                </button>

                {/* NÚT XÓA (MÀU ĐỎ #dc2626) */}
                <button
                  onClick={this.btnDeleteClick}
                  onMouseEnter={() => this.setState({ hoveredBtn: "delete" })}
                  onMouseLeave={() => this.setState({ hoveredBtn: null })}
                  style={getBtnStyle("delete", "#dc2626", "#b91c1c")}
                >
                  XÓA
                </button>
              </>
            )}

            {/* NÚT LÀM MỚI (MÀU XÁM #64748b) */}
            <button
              onClick={this.btnResetClick}
              onMouseEnter={() => this.setState({ hoveredBtn: "reset" })}
              onMouseLeave={() => this.setState({ hoveredBtn: null })}
              style={getBtnStyle("reset", "#64748b", "#475569")}
            >
              LÀM MỚI
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default CategoryDetailComponent;