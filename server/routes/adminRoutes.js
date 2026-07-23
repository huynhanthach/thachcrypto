const express = require("express");
const router = express.Router();

// 1. Import các hàm từ adminController
const {
  loginAdmin,
  getCustomers,
  getOrdersByCustomer,
} = require("../controllers/adminController");


const { getSalesAnalytics } = require("../controllers/orderController");

// Các tuyến đường API
router.post("/login", loginAdmin);
router.get("/customers", getCustomers);
router.get("/orders/customer/:cid", getOrdersByCustomer);
router.get("/analytics", getSalesAnalytics);

module.exports = router;