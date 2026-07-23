const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    description: { type: String },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },

    // XỬ LÝ SALE
    // Các trường phục vụ giá tiền và khuyến mãi:
    originalPrice: { type: Number, default: 0 }, // Giá gốc Admin nhập
    discountPercent: { type: Number, default: 0 }, // % giảm giá (0 đến 100)
    price: { type: Number, required: true, default: 0 }, // Giá cuối cùng sau khi trừ %
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);