const express = require("express");
const router = express.Router();

// 1. Import các hàm từ adminController 
const {
  loginAdmin,
  getCustomers,
  getOrdersByCustomer,
  getTopCustomers,
  grantVoucher,
  getAllOrders,
  getVoucherStats
} = require("../controllers/adminController");

const { getSalesAnalytics } = require("../controllers/orderController");

// ================= CÁC TUYẾN ĐƯỜNG API =================

router.post("/login", loginAdmin);

// Lọc top khách hàng phải đặt TRƯỚC router.get("/customers/:id")
router.get("/customers/top-buyers", getTopCustomers);
router.post("/customers/grant-voucher", grantVoucher);

// TUYẾN ĐƯỜNG CHO TRANG QUẢN LÝ ĐƠN HÀNG (SỬA LỖI 403)
router.get("/orders", getAllOrders);

// TUYẾN ĐƯỜNG ĐỂ LẤY THỐNG KÊ VOUCHER 
router.get("/customers/:cid/vouchers/stats", getVoucherStats);

router.get("/customers", getCustomers);
router.get("/orders/customer/:cid", getOrdersByCustomer);
router.get("/analytics", getSalesAnalytics);

module.exports = router;