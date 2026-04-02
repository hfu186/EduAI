const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coursesId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }],
  status: { type: String, default: "PENDING" },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);