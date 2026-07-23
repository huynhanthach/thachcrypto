const Admin = require("../models/Admin");
const User = require("../models/User");
const Order = require("../models/Order");
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
    const orders = await Order.find({ "customer._id": req.params.cid });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy đơn hàng của khách này" });
  }
};

module.exports = { loginAdmin, getCustomers, getOrdersByCustomer };
