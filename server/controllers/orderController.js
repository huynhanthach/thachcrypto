const Order = require("../models/Order");
const Product = require("../models/Product");
const sendOrderEmail = require("../utils/sendEmail");

// 1. Tạo đơn hàng mới
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      totalPrice,
      total,
      paymentMethod,
      email,
      customerName,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng đang trống" });
    }

    // Kiểm tra tồn kho
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const productInDb = await Product.findById(item.product);

      if (!productInDb || productInDb.countInStock < item.qty) {
        return res.status(400).json({
          message: `Sản phẩm "${productInDb?.name || 'Linh kiện'}" không đủ số lượng trong kho!`,
        });
      }
    }

    // Trừ tồn kho
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const productInDb = await Product.findById(item.product);
      productInDb.countInStock -= item.qty;
      await productInDb.save();
    }

    // Tạo đơn hàng
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalPrice: totalPrice || total || 0,
      status: "PENDING",
    });

    const createdOrder = await order.save();

    // Gửi mail cho khách
    const recipientEmail = email || req.user?.email;
    const recipientName = customerName || req.user?.name || "Quý khách";

    if (recipientEmail) {
      sendOrderEmail(
        recipientEmail,
        createdOrder,
        recipientName,
        paymentMethod === "VietQR" ? "processing" : "new"
      ).catch((err) => console.error("Lỗi gửi mail tạo đơn:", err.message));
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      order.status = req.body.status;
      const updatedOrder = await order.save();

      const emailKhach = order.user?.email || order.email || "khachhang@gmail.com";
      const tenKhach = order.user?.name || order.customerName || "Quý khách";

      sendOrderEmail(
        emailKhach,
        updatedOrder,
        tenKhach,
        req.body.status
      ).catch((err) =>
        console.error("Lỗi gửi mail cập nhật trạng thái:", err.message)
      );

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Xác nhận chuyển khoản VietQR
const confirmBankTransfer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentMethod = "VietQR";
      order.status = "PROCESSING";

      const updatedOrder = await order.save();

      const emailKhach = order.user?.email || order.email || "khachhang@gmail.com";
      const tenKhach = order.user?.name || order.customerName || "Quý khách";

      sendOrderEmail(emailKhach, updatedOrder, tenKhach, "processing").catch(
        (err) => console.error("Lỗi gửi mail xác nhận VietQR:", err.message)
      );

      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Báo cáo & Thống kê doanh thu 
const getSalesAnalytics = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // 1. Lấy tất cả đơn hàng từ Mongo
    const orders = await Order.find({}).lean();

    let totalRevenue = 0;
    let monthRevenue = 0;
    let totalItemsSold = 0;
    const productSalesMap = {};

    // 2. Duyệt qua từng đơn hàng bằng JS thuần
    orders.forEach((order) => {
      // Chỉ tính các đơn đã hoàn thành (hoặc tính hết nếu status trùng)
      const isCompleted =
        !order.status ||
        order.status === "COMPLETED" ||
        order.status === "Completed" ||
        order.status === "PROCESSING" ||
        order.status === "SHIPPED";

      if (isCompleted) {
        const orderPrice = Number(order.totalPrice || order.total || 0);
        totalRevenue += orderPrice;

        // Kiểm tra ngày tạo đơn
        const orderDate = new Date(order.createdAt || order.cdate || Date.now());
        const orderMonth = orderDate.getMonth() + 1;
        const orderYear = orderDate.getFullYear();

        // Lọc đúng Tháng & Năm người dùng chọn
        if (orderMonth === month && orderYear === year) {
          monthRevenue += orderPrice;

          const items = order.orderItems || order.items || [];
          if (Array.isArray(items)) {
            items.forEach((item) => {
              const pId = item.product?._id || item.product || item._id || "SP_KHAC";
              const pName = item.product?.name || item.name || "Sản phẩm Crypto";
              const qty = Number(item.qty || item.quantity || 1);
              const price = Number(item.price || 0);

              if (!productSalesMap[pId]) {
                productSalesMap[pId] = {
                  _id: pId,
                  name: pName,
                  quantitySold: 0,
                  totalSalesAmount: 0,
                };
              }

              productSalesMap[pId].quantitySold += qty;
              productSalesMap[pId].totalSalesAmount += qty * (price || (orderPrice / qty));
              totalItemsSold += qty;
            });
          }
        }
      }
    });

    // 3. Trả về JSON cho Frontend
    return res.status(200).json({
      totalRevenue,
      monthRevenue,
      totalItemsSold,
      products: Object.values(productSalesMap),
    });
  } catch (err) {
    console.error("LỖI ANALYTICS:", err);
    return res.status(200).json({
      totalRevenue: 0,
      monthRevenue: 0,
      totalItemsSold: 0,
      products: [],
      error: err.message,
    });
  }
};
// EXPORT TOÀN BỘ CÁC HÀM
module.exports = {
  addOrderItems,
  updateOrderStatus,
  confirmBankTransfer,
  getSalesAnalytics,
};