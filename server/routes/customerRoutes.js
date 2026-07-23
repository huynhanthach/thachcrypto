const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// [GET] /api/customers - Lấy toàn bộ danh sách khách hàng
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy khách hàng" });
  }
});

module.exports = router;
