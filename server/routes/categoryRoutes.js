const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// [GET] /api/categories - Lấy toàn bộ danh sách
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// [POST] /api/categories - Thêm mới
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = new Category({ name });
    const savedCategory = await newCategory.save();
    res.json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
});

// [PUT] /api/categories/:id - Cập nhật
router.put("/:id", async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true },
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: "Không thể cập nhật" });
  }
});

// [DELETE] /api/categories/:id - Xóa
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi xóa" });
  }
});

module.exports = router;
