import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Create order — decrease stock on purchase
export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Decrease stock for each product purchased
    for (const item of products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.qty } }, // decrease stock by qty purchased
        { new: true }
      );
    }

    const order = await Order.create({
      user: req.user.id,
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders — admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status — admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "Delivered") {
      order.isPaid = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Refund order — admin
// Restores stock + marks order as Cancelled + refunded
export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // Restore stock for each product
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.qty } }, // add stock back
        { new: true }
      );
    }

    // Mark order as cancelled and refunded
    order.status = "Cancelled";
    order.isRefunded = true;
    order.refundedAt = new Date();
    await order.save();

    res.json({ message: "Order refunded and stock restored", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};