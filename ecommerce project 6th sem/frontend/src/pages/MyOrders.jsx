import { useEffect, useState } from "react";
import api from "../api/axios";
import { Package } from "lucide-react";

const statusColors = {
  Pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shipped:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 flex items-center justify-center">
      <p className="text-zinc-400 animate-pulse">Loading your orders...</p>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 flex items-center justify-center">
      <div className="text-center">
        <Package size={64} className="text-zinc-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-zinc-400">You have not placed any orders yet.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-950 text-white min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold tracking-tight mb-10">My Orders</h1>

        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-zinc-900 rounded-3xl p-6 border border-white/10">

              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Order ID</p>
                  <p className="font-mono text-sm text-zinc-300">{order._id}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Date</p>
                  <p className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Payment</p>
                  <p className="text-sm">{order.paymentMethod}</p>
                </div>

                {/* Status + Refund Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                    statusColors[order.status] || statusColors.Pending
                  }`}>
                    {order.status}
                  </span>

                  {/* Refund badge — shows when admin has refunded */}
                  {order.isRefunded && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold border bg-orange-500/10 text-orange-400 border-orange-500/20">
                      💸 Refunded
                    </span>
                  )}
                </div>
              </div>

              {/* Refund Notice — shows refund date */}
              {order.isRefunded && order.refundedAt && (
                <div className="mb-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3">
                  <p className="text-xs text-orange-400 font-medium">
                    💸 Your order was refunded on{" "}
                    {new Date(order.refundedAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric"
                    })}. Your money will be returned within 3-5 business days.
                  </p>
                </div>
              )}

              {/* Order Tracking Timeline */}
              {order.status !== "Cancelled" && (
                <div className="mb-5 bg-zinc-800 rounded-2xl p-4">
                  <p className="text-xs text-zinc-400 mb-3 font-semibold uppercase tracking-wider">
                    Order Tracking
                  </p>
                  <div className="flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute left-0 right-0 top-3 h-0.5 bg-zinc-700 z-0" />
                    <div
                      className="absolute left-0 top-3 h-0.5 bg-emerald-500 z-0 transition-all duration-500"
                      style={{
                        width:
                          order.status === "Pending"    ? "0%"   :
                          order.status === "Processing" ? "33%"  :
                          order.status === "Shipped"    ? "66%"  :
                          order.status === "Delivered"  ? "100%" : "0%"
                      }}
                    />
                    {/* Steps */}
                    {[
                      { label: "Pending",    icon: "📋" },
                      { label: "Processing", icon: "⚙️" },
                      { label: "Shipped",    icon: "🚚" },
                      { label: "Delivered",  icon: "✅" },
                    ].map((step, i) => {
                      const stepOrder = ["Pending", "Processing", "Shipped", "Delivered"];
                      const currentIndex = stepOrder.indexOf(order.status);
                      const stepIndex = stepOrder.indexOf(step.label);
                      const isCompleted = stepIndex <= currentIndex;

                      return (
                        <div key={step.label} className="flex flex-col items-center z-10 relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-2 transition-all ${
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-700 text-zinc-500"
                          }`}>
                            {isCompleted ? "✓" : step.icon}
                          </div>
                          <p className={`text-[10px] font-medium ${
                            isCompleted ? "text-emerald-400" : "text-zinc-500"
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3 mb-5">
                {order.products.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-zinc-800 rounded-2xl p-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-700 shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-zinc-500">Shipping to</p>
                  <p className="text-sm">
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {order.shippingAddress?.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Total</p>
                  <p className="text-xl font-bold">
                    Rs. {order.totalAmount?.toLocaleString()}
                  </p>
                  {order.isRefunded && (
                    <p className="text-xs text-orange-400 mt-1">Refund Processed</p>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;