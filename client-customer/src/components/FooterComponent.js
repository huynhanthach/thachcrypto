import React, { Component } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from '../config';
class FooterComponent extends Component {
  render() {
    return (
      <footer className="main-footer">
        <div className="footer-container">
          {/* CỘT 1: GIỚI THIỆU & MẠNG XÃ HỘI */}
          <div className="footer-section">
            <h3 className="footer-logo">Thach Crypto</h3>
            <p className="footer-intro">
              Hệ thống bán lẻ ví lạnh chất lượng ở Việt Nam.
            </p>
            <div className="social-links">
              <span className="social-icon">FB</span>
              <span className="social-icon">YT</span>
              <span className="social-icon">INS</span>
              <span className="social-icon">Zalo</span>
            </div>
          </div>

          {/* CỘT 2: HỆ THỐNG CỬA HÀNG */}
          <div className="footer-section">
            <h4>HỆ THỐNG CỬA HÀNG</h4>
            <div className="contact-info">
              <p>
                <strong>Địa chí (TP.HCM):</strong>
              </p>
              <p>454 Võ Chí Công , P. Phú Hữu, Quận 9</p>
            </div>
          </div>

          {/* CỘT 3: TỔNG ĐÀI HỖ TRỢ (Nội dung mới) */}
          <div className="footer-section">
            <h4>TỔNG ĐÀI HỖ TRỢ</h4>
            <div className="contact-info">
              <p>
                <strong>SĐT Mua hàng:</strong> 0899548549 (8:00 - 21:00)
              </p>
              <p>
                <strong>SĐT Bảo hành:</strong> 0899548549 (8:30 - 17:30)
              </p>
              <p>
                <strong>Email:</strong> huynhnanthach12a2@gmail.com
              </p>
            </div>
          </div>

          {/* CỘT 4: CHÍNH SÁCH CHUNG */}
          <div className="footer-section">
            <h4>CHÍNH SÁCH CHUNG</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Chính sách bảo hành</Link>
              </li>
              <li>
                <Link to="/">Chính sách đổi trả 1-1</Link>
              </li>
              <li>
                <Link to="/">Chính sách bảo mật thông tin</Link>
              </li>
              <li>
                <Link to="/">Chính sách vận chuyển toàn quốc</Link>
              </li>
              <li>
                <Link to="/">Phương thức thanh toán</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* PHẦN THÔNG TIN DOANH NGHIỆP DƯỚI CÙNG */}
        <div className="footer-bottom">
          <div className="company-info">
            <p>
              <strong>CÔNG TY TNHH  CÔNG NGHỆ ANTHACH</strong>
            </p>
            <p>
              Giấy chứng nhận đăng ký doanh nghiệp số: 010123xxxx do Sở KH&ĐT
              TP.HCM cấp ngày 04/04/2026
            </p>
            <p>
              Địa chỉ đăng ký kinh doanh: 456 Võ Ch Công, Phú Hữu, Quận 9, Thành phố Hồ Chí Minh
            </p>
            <p className="copyright">
              Copyright © 2026 Thach Crypto. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }
}

export default FooterComponent;
