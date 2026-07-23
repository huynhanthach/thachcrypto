import React, { Component } from "react";
import axios from "axios";
import CategoryDetailComponent from "./CategoryDetailComponent";
import { CONFIG } from '../config';

class CategoryComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null,
      hoveredRowId: null, // Thêm state để nhận biết dòng đang được hover
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories = () => {
    axios
      .get(`${CONFIG.BASE_URL}/api/categories`)
      .then((res) => {
        this.setState({ categories: res.data });
      })
      .catch((err) => console.log(err));
  };

  trItemClick = (item) => {
    this.setState({ itemSelected: item });
  };

  render() {
    const { categories, itemSelected, hoveredRowId } = this.state;

    const cats = categories.map((item) => {
      const isSelected = itemSelected && itemSelected._id === item._id;
      const isHovered = hoveredRowId === item._id;

      // Xác định màu nền dựa trên trạng thái (Selected > Hovered > Default)
      let backgroundColor = "#ffffff";
      if (isSelected) {
        backgroundColor = "#fef3c7"; // Vàng nhạt nổi bật cho hàng được chọn
      } else if (isHovered) {
        backgroundColor = "#f8fafc"; // Xám nhẹ khi hover
      }

      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trItemClick(item)}
          onMouseEnter={() => this.setState({ hoveredRowId: item._id })}
          onMouseLeave={() => this.setState({ hoveredRowId: null })}
          style={{
            cursor: "pointer",
            backgroundColor: backgroundColor,
            borderLeft: isSelected ? "4px solid #ae7e17" : "4px solid transparent", // Vệt màu vàng ở đầu dòng được chọn
            transition: "all 0.2s ease-in-out",
          }}
        >
          <td
            style={{
              textAlign: "center",
              padding: "14px 10px",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: isSelected ? "#ae7e17" : "#64748b",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            #{item._id.substring(item._id.length - 5)}
          </td>
          <td
            style={{
              padding: "14px 15px",
              fontSize: "0.95rem",
              fontWeight: isSelected ? "700" : "500",
              color: isSelected ? "#0f172a" : "#334155",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {item.name}
          </td>
        </tr>
      );
    });

    return (
      <div
        style={{
          display: "flex",
          padding: "35px 30px",
          gap: "30px",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* KHỐI BÊN TRÁI: DANH SÁCH DANH MỤC */}
        <div
          style={{
            flex: 1.5,
            background: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Danh sách danh mục</span>
            <span
              style={{
                fontSize: "0.8rem",
                backgroundColor: "#f1f5f9",
                color: "#64748b",
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: "600",
              }}
            >
              Tổng: {categories.length}
            </span>
          </h3>

          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead
                style={{
                  background: "#f1f5f9",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "12px 10px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#475569",
                      textTransform: "uppercase",
                      textAlign: "center",
                      width: "80px",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#475569",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    Tên danh mục
                  </th>
                </tr>
              </thead>
              <tbody>
                {cats.length > 0 ? (
                  cats
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#94a3b8",
                      }}
                    >
                      Đang tải danh mục...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KHỐI BÊN PHẢI: CHI TIẾT/THÊM/SỬA DANH MỤC */}
        <div style={{ flex: 1 }}>
          <CategoryDetailComponent
            item={this.state.itemSelected}
            updateCategories={this.apiGetCategories}
          />
        </div>
      </div>
    );
  }
}

export default CategoryComponent;