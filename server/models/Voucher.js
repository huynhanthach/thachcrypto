const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        //số tiền giảm (VNĐ)
        discountAmount: { type: Number, required: true },

        isUsed: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);