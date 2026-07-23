const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const {
  getNewProducts,
  getProducts,
  getProductById,
  getAllBrands,
  getDynamicPriceRanges,
} = require("../controllers/productController");

router.get("/brands", getAllBrands);

router.get("/new", getNewProducts);

router.get("/dynamic-ranges", getDynamicPriceRanges);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: "Lỗi thêm mới" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi xóa" });
  }
});

module.exports = router;
