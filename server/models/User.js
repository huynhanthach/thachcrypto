const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    active: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
