const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { name, image, brand, category, description, price, countInStock, discountPercent } = req.body;

    let basePrice = Math.round(Number(price) || 0);
    // Nếu admin nhập dạng 25 -> tự đổi thành 25000
    if (basePrice > 0 && basePrice < 1000) basePrice = basePrice * 1000;

    const discount = Number(discountPercent) || 0; // % giảm giá

    // Tính GIÁ BÁN SAU KHI GIẢM (Ví dụ: gốc 25k, giảm 30% -> còn 17.5k)
    const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;

    const product = await Product.create({
      name, image, brand, category, description, countInStock,
      originalPrice: basePrice, // 25.000đ (Giá gốc)
      discountPercent: discount, // 30%
      price: finalPrice,        // 17.500đ (Giá bán thực tế)

    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// HÀM CẬP NHẬT SẢN PHẨM
const updateProduct = async (req, res) => {
  try {
    const { name, image, brand, category, description, price, countInStock, discountPercent } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const basePrice = Math.round(Number(price) || 0);
      const discount = Number(discountPercent) || 0;

      const finalPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;

      product.name = name;
      product.image = image;
      product.brand = brand;
      product.category = category;
      product.description = description;
      product.countInStock = countInStock;

      product.originalPrice = basePrice;
      product.discountPercent = discount;
      product.price = finalPrice;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 8,
    } = req.query;

    let query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(50, Number(limit) || 8));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments(query);

    let mongooseQuery = Product.find(query).populate("category", "name");

    if (sort) {
      const sortOrder = sort === "asc" ? 1 : -1;
      mongooseQuery = mongooseQuery.sort({ price: sortOrder });
    } else {
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    const products = await mongooseQuery.skip(skip).limit(limitNumber);
    const totalPages = Math.max(1, Math.ceil(total / limitNumber));

    if (req.query.page || req.query.limit) {
      return res.status(200).json({
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages,
        },
      });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getNewProducts = async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(50, Number(limit) || 8));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.max(1, Math.ceil(total / limitNumber));

    if (req.query.page || req.query.limit) {
      return res.status(200).json({
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages,
        },
      });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm này!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const rawBrands = await Product.distinct("brand");

    const formattedBrands = [
      ...new Set(
        rawBrands.map((b) =>
          b ? b.charAt(0).toUpperCase() + b.slice(1).toLowerCase() : "",
        ),
      ),
    ].filter(Boolean);

    res.status(200).json(formattedBrands);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

const getDynamicPriceRanges = async (req, res) => {
  try {
    const { category } = req.query;
    let matchStage = {};

    if (category) {
      const mongoose = require("mongoose");
      matchStage.category = new mongoose.Types.ObjectId(category);
    }

    const stats = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    if (stats.length === 0 || stats[0].minPrice === stats[0].maxPrice) {
      return res.status(200).json([]);
    }

    const min = stats[0].minPrice;
    const max = stats[0].maxPrice;

    const step = Math.ceil((max - min) / 4 / 500000) * 500000;

    const ranges = [
      {
        label: `Dưới ${(min + step).toLocaleString("vi-VN")}đ`,
        min: null,
        max: min + step,
      },
      {
        label: `Từ ${(min + step).toLocaleString("vi-VN")}đ - ${(min + step * 2).toLocaleString("vi-VN")}đ`,
        min: min + step,
        max: min + step * 2,
      },
      {
        label: `Từ ${(min + step * 2).toLocaleString("vi-VN")}đ - ${(min + step * 3).toLocaleString("vi-VN")}đ`,
        min: min + step * 2,
        max: min + step * 3,
      },
      {
        label: `Trên ${(min + step * 3).toLocaleString("vi-VN")}đ`,
        min: min + step * 3,
        max: null,
      },
    ];

    res.status(200).json(ranges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getNewProducts,
  getProductById,
  getAllBrands,
  getDynamicPriceRanges,
};
