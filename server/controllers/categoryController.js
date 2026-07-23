const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await Category.create({ name });

    res
      .status(201)
      .json({ message: "Tạo danh mục thành công!", data: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi!", error });
  }
};

module.exports = { createCategory };
