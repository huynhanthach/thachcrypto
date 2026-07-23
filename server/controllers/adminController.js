const Admin = require("../models/Admin");
const User = require("../models/User");
const Order = require("../models/Order");
const Voucher = require("../models/Voucher");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
    }

    const passwordMatches =
      admin.password === password ||
      (typeof admin.password === "string" &&
        admin.password.startsWith("$2") &&
        (await bcrypt.compare(password, admin.password)));

    if (passwordMatches) {
      return res.json({
        success: true,
        message: "Welcome back!",
        token: generateToken(admin._id),
        user: {
          _id: admin._id,
          username: admin.username,
          name: admin.name,
          role: "admin",
        },
      });
    }

    return res
      .status(401)
      .json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi kết nối DB" });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await User.find().select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách khách hàng" });
  }
};


const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.cid })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy đơn hàng của khách này" });
  }
};

// 2. THÊM HÀM MỚI NÀY: Để lấy toàn bộ đơn hàng cho trang OrderComponent, né lỗi 403)
const getAllOrders = async (req, res) => {
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
};



// 1. API Lọc Top Khách Hàng theo Tháng / Năm
const getTopCustomers = async (req, res) => {
  try {
    const { year, month } = req.query;
    let dateMatch = {};

    if (year) {
      const y = parseInt(year);
      if (month && month !== "all") {
        const m = parseInt(month) - 1;
        const startDate = new Date(y, m, 1);
        const endDate = new Date(y, m + 1, 0, 23, 59, 59);

        dateMatch.createdAt = { $gte: startDate, $lte: endDate };
      } else {
        const startDate = new Date(y, 0, 1);
        const endDate = new Date(y, 11, 31, 23, 59, 59);
        dateMatch.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const topBuyers = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          // Dùng "$user"  để khớp với DB 
          _id: "$user",
          totalSpent: { $sum: { $ifNull: ["$totalPrice", "$total"] } }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    const populatedCustomers = [];
    for (let buyer of topBuyers) {
      if (buyer._id) {
        const user = await User.findById(buyer._id).select("-password").lean();
        if (user) {
          populatedCustomers.push({ ...user, totalSpent: buyer.totalSpent });
        }
      }
    }

    res.json(populatedCustomers);
  } catch (error) {
    console.error("Lỗi getTopCustomers:", error);
    res.status(500).json({ message: "Lỗi khi lọc top khách hàng" });
  }
};

// 2. API Cấp Voucher Khuyến Mãi
// API Cấp Voucher Khuyến Mãi (Giảm tiền)
const grantVoucher = async (req, res) => {
  try {
    // Nhận 'amount' (số tiền) thay vì 'percent'
    const { customerId, amount, quantity } = req.body;

    if (!customerId || !amount || !quantity) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    const vouchers = [];
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Hết hạn sau 30 ngày

    for (let i = 0; i < quantity; i++) {
      const randomCode = "KM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      vouchers.push({
        code: randomCode,
        user: customerId,
        discountAmount: amount, // Lưu số tiền vào DB
        expiresAt: expirationDate
      });
    }

    await Voucher.insertMany(vouchers);

    res.json({ success: true, message: `Đã cấp ${quantity} vé giảm ${amount}đ` });
  } catch (error) {
    console.error("Lỗi grantVoucher:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi cấp voucher" });
  }
};
// API: Lấy thống kê voucher (Số lượng & Tổng tiền) của 1 khách hàng
const getVoucherStats = async (req, res) => {
  try {
    const { cid } = req.params;

    // Lấy toàn bộ voucher của khách hàng này
    const vouchers = await Voucher.find({ user: cid });

    // Khởi tạo các biến chứa kết quả
    let totalQty = 0, usedQty = 0, unusedQty = 0;
    let totalAmount = 0, usedAmount = 0, unusedAmount = 0;

    // Chạy vòng lặp để đếm số lượng và cộng dồn tiền
    vouchers.forEach((v) => {
      const amount = v.discountAmount || 0;

      totalQty += 1;
      totalAmount += amount;

      if (v.isUsed) {
        usedQty += 1;
        usedAmount += amount;
      } else {
        unusedQty += 1;
        unusedAmount += amount;
      }
    });

    // Trả về cả số lượng (qty) và số tiền (amount)
    res.json({
      qty: { total: totalQty, used: usedQty, unused: unusedQty },
      amount: { total: totalAmount, used: usedAmount, unused: unusedAmount }
    });
  } catch (error) {
    console.error("Lỗi getVoucherStats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê voucher" });
  }
};

module.exports = {
  loginAdmin,
  getCustomers,
  getOrdersByCustomer,
  getTopCustomers,
  grantVoucher,
  getAllOrders,
  getVoucherStats,
};