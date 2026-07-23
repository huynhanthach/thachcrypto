const express = require("express");
const router = express.Router();
const {
  addOrderItems,
  confirmBankTransfer,
  getSalesAnalytics,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Product = require("../models/Product");
const sendOrderEmail = require("../utils/sendEmail");
const Voucher = require("../models/Voucher");


router.get("/vouchers/mine", protect, async (req, res) => {
  try {
    console.log("=== ĐANG TÌM VOUCHER CHO USER ID ===", req.user._id);

    // Tìm voucher chưa sử dụng và còn hạn
    const vouchers = await Voucher.find({
      user: req.user._id,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    console.log("=== SỐ VOUCHER TÌM THẤY TRONG DATABASE ===", vouchers.length);
    res.json(vouchers);
  } catch (error) {
    console.error("Lỗi lấy voucher:", error);
    res.status(500).json({ message: error.message });
  }
});

// ================= CÁC ROUTE CÒN LẠI =================

router.get("/analytics", getSalesAnalytics);

router.post("/", protect, addOrderItems);

router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    const fixedOrders = orders.map((order) => ({
      ...order,
      status: order.status || "PENDING",
      user: order.user ? order.user : { name: "Khách vãng lai" },
    }));

    res.json(fixedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LẤY TẤT CẢ ĐƠN HÀNG CỦA 1 KHÁCH HÀNG BẤT KỲ
router.get("/customer/:cid", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.cid })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (let i = 0; i < order.orderItems.length; i++) {
        const item = order.orderItems[i];
        const productInDb = await Product.findById(item.product);
        if (productInDb) {
          productInDb.countInStock += item.qty || item.quantity;
          await productInDb.save();
        }
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    const emailTo = order.user ? order.user.email : order.email;
    const nameTo = order.user ? order.user.name : "Quý khách";

    sendOrderEmail(emailTo, updatedOrder, nameTo, status).catch((err) =>
      console.error("Lỗi gửi mail trạng thái:", err.message),
    );

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id/pay-confirm", protect, confirmBankTransfer);

module.exports = router;