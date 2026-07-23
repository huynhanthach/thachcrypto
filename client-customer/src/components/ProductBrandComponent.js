import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CONFIG } from '../config';
const ProductBrandComponent = () => {
  const { brand, cid } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (brand) params.append("brand", brand);
    if (cid) params.append("category", cid);

    const query = params.toString() ? `?${params.toString()}` : "";
    const url = `${CONFIG.BASE_URL}/api/products${query}`;

    axios.get(url).then((res) => setProducts(res.data));

    axios
      .get(`${CONFIG.BASE_URL}/api/categories`)
      .then((res) => setCategories(res.data));
    axios
      .get(`${CONFIG.BASE_URL}/api/products/brands`)
      .then((res) => setBrands(res.data));
  }, [brand, cid]);

  return (
    <div className="home-container">
      <div className="home-content-layout">
        <aside className="home-sidebar">
          <h3 className="sidebar-title">DANH MỤC</h3>
          <ul className="category-list">
            {categories.map((item) => (
              <li key={item._id}>
                <Link
                  to={`/product/category/${item._id}`}
                  className={`category-item ${cid === item._id ? "active-filter" : ""}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="sidebar-title" style={{ marginTop: "30px" }}>
            THƯƠNG HIỆU
          </h3>
          <ul className="category-list">
            {brands.map((b, index) => (
              <li key={index}>
                <Link
                  to={`/product/brand/${b}`}
                  className={`category-item ${brand === b ? "active-filter" : ""}`}
                >
                  {b}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="home-main-content">
          <h2 className="section-title-left">
            {brand
              ? `THƯƠNG HIỆU: ${brand}`
              : cid
                ? "DANH MỤC SẢN PHẨM"
                : "DANH SÁCH SẢN PHẨM"}
          </h2>
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((item) => (
                <div key={item._id} className="product-card">
                  <Link to={"/product/" + item._id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="product-img"
                    />
                  </Link>
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-price">
                    {item.price.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <Link to={"/product/" + item._id} className="btn-detail">
                    XEM CHI TIẾT
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", padding: "20px" }}>
                Không tìm thấy sản phẩm nào.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductBrandComponent;
