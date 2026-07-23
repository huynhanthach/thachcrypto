import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MousePointer2, ShoppingCart } from "lucide-react";
import MyContext from "../contexts/MyContext";
import Swal from "sweetalert2";
import { CONFIG } from '../config';

class HomeComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      brands: [],
      dynamicRanges: [],
      banners: [
        "/images/Banner_01.jpg",
        "/images/Banner_02.jpg",
        "/images/Banner_03.jpg",
      ],
      currentBannerIndex: 0,
      filterCid: null,
      filterBrand: null,
      filterMinPrice: null,
      filterMaxPrice: null,
      isFiltering: false,
      pageSize: 8,
      currentPage: 1,
      totalPages: 1,
    };
    this.bannerTimer = null;
  }

  componentDidMount() {
    this.apiGetCategories();
    this.apiGetBrands();
    this.apiGetDynamicRanges(null);
    this.startBannerTimer();

    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("keyword");

    if (keyword) {
      this.apiSearchProducts(keyword);
    } else {
      this.apiGetNewProducts();
    }
  }

  componentWillUnmount() {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
  }

  startBannerTimer() {
    this.bannerTimer = setInterval(() => {
      this.setState({
        currentBannerIndex:
          (this.state.currentBannerIndex + 1) % this.state.banners.length,
      });
    }, 4000);
  }

  setCurrentBanner = (index) => {
    this.setState({ currentBannerIndex: index });
    clearInterval(this.bannerTimer);
    this.startBannerTimer();
  };

  apiGetDynamicRanges(cid) {
    let url = `${CONFIG.BASE_URL}/api/products/dynamic-ranges`;
    if (cid) url += `?category=${cid}`;
    axios
      .get(url)
      .then((res) => {
        this.setState({ dynamicRanges: res.data });
      })
      .catch((err) => console.log(err.message));
  }

  apiSearchProducts(keyword, page = 1) {
    const limit = this.state.pageSize;
    axios
      .get(
        `${CONFIG.BASE_URL}/api/products?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`,
      )
      .then((res) => {
        const payload = res.data?.products ? res.data : { products: Array.isArray(res.data) ? res.data : [], pagination: { page: 1, limit, totalPages: 1 } };
        const products = payload.products || [];
        const pagination = payload.pagination || { page: 1, limit, totalPages: 1 };
        this.setState({
          products,
          isFiltering: true,
          currentPage: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
        });
        window.scrollTo({ top: 650, behavior: "smooth" });
      })
      .catch((err) => console.log(err.message));
  }

  apiGetNewProducts(page = 1) {
    const limit = this.state.pageSize;
    axios
      .get(`${CONFIG.BASE_URL}/api/products/new?page=${page}&limit=${limit}`)
      .then((res) => {
        const payload = res.data?.products ? res.data : { products: Array.isArray(res.data) ? res.data : [], pagination: { page: 1, limit, totalPages: 1 } };
        const products = payload.products || [];
        const pagination = payload.pagination || { page: 1, limit, totalPages: 1 };
        this.setState({
          products,
          isFiltering: false,
          filterCid: null,
          filterBrand: null,
          filterMinPrice: null,
          filterMaxPrice: null,
          currentPage: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
        });
      })
      .catch((err) => console.log(err.message));
  }

  apiGetCategories() {
    axios
      .get(`${CONFIG.BASE_URL}/api/categories`)
      .then((res) => this.setState({ categories: res.data }))
      .catch((err) => console.log(err.message));
  }

  apiGetBrands() {
    axios
      .get(`${CONFIG.BASE_URL}/api/products/brands`)
      .then((res) => this.setState({ brands: res.data }))
      .catch((err) => console.log(err.message));
  }

  applyFilters = (cid, brand, minPrice, maxPrice, page = 1) => {
    const params = new URLSearchParams();
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword");

    if (keyword) params.append("keyword", keyword);
    if (cid) params.append("category", cid);
    if (brand) params.append("brand", brand);
    if (minPrice !== null && minPrice !== undefined && minPrice !== "") {
      params.append("minPrice", minPrice);
    }
    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== "") {
      params.append("maxPrice", maxPrice);
    }
    params.append("page", page);
    params.append("limit", this.state.pageSize);

    if (cid !== this.state.filterCid) {
      this.apiGetDynamicRanges(cid);
    }

    axios
      .get(`${CONFIG.BASE_URL}/api/products?${params.toString()}`)
      .then((res) => {
        const payload = res.data?.products ? res.data : { products: Array.isArray(res.data) ? res.data : [], pagination: { page: 1, limit: this.state.pageSize, totalPages: 1 } };
        const products = payload.products || [];
        const pagination = payload.pagination || { page: 1, limit: this.state.pageSize, totalPages: 1 };
        this.setState({
          products,
          filterCid: cid || null,
          filterBrand: brand || null,
          filterMinPrice: minPrice ?? null,
          filterMaxPrice: maxPrice ?? null,
          isFiltering: true,
          currentPage: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
        });
        window.scrollTo({ top: 650, behavior: "smooth" });
      })
      .catch((err) => {
        console.error(err);
        alert("Có lỗi khi lọc dữ liệu!");
      });
  };

  goToPage = (page) => {
    const totalPages = Math.max(1, this.state.totalPages);
    const nextPage = Math.min(Math.max(1, page), totalPages);
    const {
      filterCid,
      filterBrand,
      filterMinPrice,
      filterMaxPrice,
      isFiltering,
    } = this.state;
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("keyword");
    const hasActiveFilter = Boolean(
      filterCid || filterBrand || filterMinPrice !== null || filterMaxPrice !== null,
    );

    if (keyword) {
      this.apiSearchProducts(keyword, nextPage);
    } else if (hasActiveFilter || isFiltering) {
      this.applyFilters(
        filterCid,
        filterBrand,
        filterMinPrice,
        filterMaxPrice,
        nextPage,
      );
    } else {
      this.apiGetNewProducts(nextPage);
    }
  };

  addToCart = (e, item) => {
    e.preventDefault();
    const { user } = this.context;

    if (!user) {
      Swal.fire({
        title: "Thach Crypto",
        text: "Vui lòng ĐĂNG NHẬP để mua linh kiện!",
        icon: "warning",
        confirmButtonColor: "#ed1c24",
        confirmButtonText: "ĐĂNG NHẬP NGAY",
        showCancelButton: true,
        cancelButtonText: "HỦY",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return;
    }

    if (item.countInStock > 0) {
      this.context.add2Cart(item, 1);
      Swal.fire({
        title: "THÀNH CÔNG",
        text: `Đã thêm ${item.name} vào giỏ hàng!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  render() {
    const {
      banners,
      currentBannerIndex,
      products,
      categories,
      brands,
      dynamicRanges,
      filterCid,
      filterBrand,
      filterMinPrice,
      filterMaxPrice,
      isFiltering,
      currentPage,
      totalPages,
      pageSize,
    } = this.state;

    const isPriceActive = (min, max) =>
      filterMinPrice === min && filterMaxPrice === max;

    return (
      <div className="home-container">
        {!isFiltering && (
          <>
            {/* TẠO MỚI: HERO SECTION */}
            <div
              className="hero-section"
              style={{
                backgroundColor: "#111",
                color: "#fff",
                padding: "60px 20px",
                textAlign: "center",
                borderRadius: "8px",
                marginBottom: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                backgroundImage: "linear-gradient(135deg, #838e07 0%, #2a2a2a 100%)"
              }}
            >
              <h1 style={{
                fontSize: "3rem",
                fontWeight: "800",
                marginBottom: "15px",
                color: "#ae7e17",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Chào mừng đến với THACH CRYPTO
              </h1>
              <p style={{
                fontSize: "1.2rem",
                color: "#ccc",
                maxWidth: "700px",
                margin: "0 auto 30px",
                lineHeight: "1.6"
              }}>
                Nền tảng cung cấp linh kiện máy tính, ví lạnh và các thiết bị phần cứng Crypto hàng đầu. Cam kết chính hãng 100%, bảo hành uy tín và hỗ trợ kỹ thuật trọn đời.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
                style={{
                  backgroundColor: "#ae7e17",
                  color: "#fff",
                  border: "none",
                  padding: "12px 35px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: "50px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(235, 223, 134, 0.4)",
                  textTransform: "uppercase"
                }}
                onMouseOver={(e) => e.target.style.transform = "translateY(-3px)"}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Khám phá ngay
              </button>
            </div>
            {/* KẾT THÚC: HERO SECTION */}

            <div className="slider-container">
              <div
                className="slider-track"
                style={{
                  transform: `translateX(-${currentBannerIndex * 100}%)`,
                }}
              >
                {banners.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="Banner"
                    className="banner-img"
                  />
                ))}
              </div>
              <div className="slider-dots">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => this.setCurrentBanner(index)}
                    className={`dot ${currentBannerIndex === index ? "active" : ""
                      }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="home-content-layout">
          <aside className="home-sidebar">
            <h3 className="sidebar-title">DANH MỤC</h3>
            <ul className="category-list">
              <li>
                <div
                  onClick={() => {
                    window.history.pushState({}, "", "/home");
                    this.setState({
                      filterCid: null,
                      filterBrand: null,
                      filterMinPrice: null,
                      filterMaxPrice: null,
                      isFiltering: false,
                    });
                    this.apiGetDynamicRanges(null);
                    this.apiGetNewProducts();
                  }}
                  className={`category-item ${!isFiltering ? "active-filter" : ""}`}
                >
                  Tất cả sản phẩm
                </div>
              </li>
              {categories.map((item) => (
                <li key={item._id}>
                  <div
                    onClick={() => {
                      const nextCid = filterCid === item._id ? null : item._id;
                      if (nextCid === null) {
                        this.applyFilters(null, filterBrand, filterMinPrice, filterMaxPrice);
                      } else {
                        this.applyFilters(nextCid, filterBrand, null, null);
                      }
                    }}
                    className={`category-item ${filterCid === item._id ? "active-filter" : ""}`}
                  >
                    {item.name}
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="sidebar-title" style={{ marginTop: "30px" }}>
              THƯƠNG HIỆU
            </h3>
            <ul className="category-list">
              {brands.map((b, index) => (
                <li key={index}>
                  <div
                    onClick={() => {
                      const nextBrand = filterBrand === b ? null : b;
                      this.applyFilters(
                        filterCid,
                        nextBrand,
                        filterMinPrice,
                        filterMaxPrice,
                      );
                    }}
                    className={`category-item ${filterBrand === b ? "active-filter" : ""}`}
                  >
                    {b}
                  </div>
                </li>
              ))}
            </ul>

            {dynamicRanges.length > 0 && (
              <>
                <h3 className="sidebar-title" style={{ marginTop: "30px" }}>
                  MỨC GIÁ
                </h3>
                <ul className="category-list">
                  {dynamicRanges.map((range, index) => (
                    <li key={index}>
                      <div
                        onClick={() =>
                          this.applyFilters(
                            filterCid,
                            filterBrand,
                            range.min,
                            range.max,
                          )
                        }
                        className={`category-item ${isPriceActive(range.min, range.max) ? "active-filter" : ""}`}
                      >
                        {range.label}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          <main className="home-main-content">
            <h2 className="section-title-left">
              {isFiltering ? "KẾT QUẢ TÌM KIẾM & LỌC" : "SẢN PHẨM MỚI NHẤT"}
            </h2>
            <div className="product-grid">
              {products.length > 0 ? (
                products.map((item) => {
                  const currentStock = item.countInStock ?? 0;
                  const isOutOfStock = currentStock <= 0;

                  const discountPercent = item.discountPercent || item.discount || 0;

                  // 1. GIÁ GỐC: Ưu tiên originalPrice, nếu không có thì dùng item.price (Admin nhập)
                  const basePrice = item.originalPrice && item.originalPrice > 0 ? item.originalPrice : item.price;

                  // 2. GIÁ BÁN THỰC TẾ: Lấy giá gốc NÂNH VỚI phần trăm còn lại (Ví dụ: 300k * (1 - 0.4) = 180k)
                  const finalPrice = discountPercent > 0
                    ? Math.round(basePrice * (1 - discountPercent / 100))
                    : basePrice;

                  return (
                    <div key={item._id} className="pro-product-card">
                      <Link to={"/product/" + item._id} className="pro-img-wrapper">
                        <img src={item.image} alt={item.name} />

                        {discountPercent > 0 && (
                          <span className="pro-discount-badge">
                            -{discountPercent}%
                          </span>
                        )}
                      </Link>

                      <div className="pro-card-body">
                        <Link to={"/product/" + item._id} className="pro-product-name">
                          {item.name}
                        </Link>

                        {/* NHÓM GIÁ ĐÃ SỬA */}
                        <div className="pro-price-group">
                          {/* Giá bán đỏ (đã giảm) */}
                          <span className="pro-price-new">
                            {finalPrice.toLocaleString("vi-VN")}đ
                          </span>

                          {/* Giá gốc gạch ngang (chỉ hiện khi có giảm giá) */}
                          {discountPercent > 0 && (
                            <span className="pro-price-old">
                              {basePrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>

                        <div className="pro-card-footer">
                          <button
                            className="pro-btn-cart"
                            disabled={isOutOfStock}
                            style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                            onClick={(e) => this.addToCart(e, item)}
                          >
                            <ShoppingCart size={16} strokeWidth={2} />
                            THÊM VÀO GIỎ
                          </button>

                          {!isOutOfStock ? (
                            <span className="pro-status-badge">Còn hàng</span>
                          ) : (
                            <span
                              className="pro-status-badge"
                              style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                            >
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: "center", width: "100%", padding: "50px" }}>
                  Không tìm thấy sản phẩm nào.
                </p>
              )}

            </div>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "24px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => this.goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: currentPage === 1 ? "#f5f5f5" : "#fff",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => this.goToPage(page)}
                    style={{
                      padding: "8px 12px",
                      border: page === currentPage ? "1px solid #ed1c24" : "1px solid #ddd",
                      borderRadius: "4px",
                      background: page === currentPage ? "#ed1c24" : "#fff",
                      color: page === currentPage ? "#fff" : "#333",
                      cursor: "pointer",
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => this.goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: currentPage === totalPages ? "#f5f5f5" : "#fff",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Sau
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
}

export default HomeComponent;