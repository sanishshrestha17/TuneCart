import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        price: Number,
        qty: Number,
      },
    ],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "eSewa"],
      default: "COD",
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    deliveredAt: Date,
    isRefunded: { type: Boolean, default: false },  // ← NEW
    refundedAt: Date,                                // ← NEW
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);