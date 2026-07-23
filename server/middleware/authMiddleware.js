const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      const targetId = decoded.id || decoded._id;

      // 1. Tìm trong bảng User
      let user = await User.findById(targetId).select("-password").lean();
      if (user) {
        req.user = user;
        return next();
      }

      // 2. Tìm trong bảng Admin
      let adminUser = await Admin.findById(targetId).select("-password").lean();
      if (adminUser) {
        adminUser.role = "admin";
        req.user = adminUser;
        return next();
      }

      // Nếu không tìm thấy ở cả 2 bảng
      return res
        .status(401)
        .json({ message: "Tài khoản không tồn tại trong DB" });
    } catch (error) {
      console.error("LỖI GIẢI MÃ TOKEN:", error.message);
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Không có quyền truy cập" });
  }
};

const admin = (req, res, next) => {
  // Kiểm tra quyền 
  if (req.user && req.user.role === "admin") {
    return next();
  }


  console.error("LỖI 403 - Dữ liệu user hiện tại là:", req.user);
  return res
    .status(403)
    .json({ message: "Truy cập bị từ chối, yêu cầu quyền Admin" });
};

module.exports = { protect, admin };
