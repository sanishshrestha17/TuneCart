import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const Checkout = () => {
  const { cart, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto-fill from user's saved address
  const [form, setForm] = useState({
    fullName: user?.address?.fullName || user?.name || "",
    street:   user?.address?.street   || "",
    city:     user?.address?.city     || "",
    phone:    user?.address?.phone    || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // eSewa hash
  const { transaction_uuid, hashInBase64 } = useMemo(() => {
    const txId = uuidv4();
    const message = `total_amount=${total},transaction_uuid=${txId},product_code=EPAYTEST`;
    const hash = CryptoJS.HmacSHA256(message, "8gBm/:&EnhH.1/q");
    return { transaction_uuid: txId, hashInBase64: CryptoJS.enc.Base64.stringify(hash) };
  }, [total]);

  // Save order to DB then handle payment
  const placeOrder = async () => {
    if (!form.fullName || !form.street || !form.city || !form.phone) {
      return setError("Please fill in all shipping fields");
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/orders", {
        products: cart.map(i => ({
          product: i._id,
          name:    i.name,
          image:   i.image,
          price:   i.price,
          qty:     i.qty,
        })),
        shippingAddress: form,
        paymentMethod: "COD",
        totalAmount: total,
      });
      clearCart();
      navigate("/payment-success");
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
      navigate("/payment-failure");
    } finally {
      setLoading(false);
    }
  };

  // Save order then submit eSewa form
  const saveOrderAndPayEsewa = async () => {
    if (!form.fullName || !form.street || !form.city || !form.phone) {
      return setError("Please fill in all shipping fields");
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/orders", {
        products: cart.map(i => ({
          product: i._id,
          name:    i.name,
          image:   i.image,
          price:   i.price,
          qty:     i.qty,
        })),
        shippingAddress: form,
        paymentMethod: "eSewa",
        totalAmount: total,
      });
      clearCart();
      // Submit eSewa form
      document.getElementById("esewa-form").submit();
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-serif font-bold mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — Shipping + Payment */}
          <div className="space-y-6">

            {/* Shipping */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-serif font-semibold mb-5">
                Delivery Address
              </h2>

              {/* Auto-fill notice */}
              {user?.address?.city && (
                <div className="mb-4 bg-teal-900/20 border border-teal-700/30 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-teal-400">
                    ✓ Address auto-filled from your account
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {[
                  { label: "Full Name",      key: "fullName", placeholder: "Your full name",    type: "text" },
                  { label: "Street Address", key: "street",   placeholder: "e.g. Thamel, KTM",  type: "text" },
                  { label: "City",           key: "city",     placeholder: "e.g. Kathmandu",     type: "text" },
                  { label: "Phone Number",   key: "phone",    placeholder: "98XXXXXXXX",         type: "tel"  },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-zinc-600 outline-none focus:border-teal-600/50 transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-serif font-semibold mb-5">Payment Method</h2>
              <div className="space-y-3">

                {/* COD */}
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-teal-600 bg-teal-900/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === "COD" ? "border-teal-500" : "border-zinc-600"
                  }`}>
                    {paymentMethod === "COD" && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">💵 Cash on Delivery</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>

                {/* eSewa */}
                <label
                  onClick={() => setPaymentMethod("eSewa")}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "eSewa"
                      ? "border-teal-600 bg-teal-900/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === "eSewa" ? "border-teal-500" : "border-zinc-600"
                  }`}>
                    {paymentMethod === "eSewa" && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">🟢 eSewa</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Pay online with eSewa wallet</p>
                  </div>
                </label>

              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 sticky top-28">
              <h2 className="text-lg font-serif font-semibold mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Delivery address preview */}
              {form.city && (
                <div className="mb-4 bg-zinc-800 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1">Delivering to:</p>
                  <p className="text-sm text-zinc-300">
                    {form.fullName && `${form.fullName}, `}
                    {form.street && `${form.street}, `}
                    {form.city}
                  </p>
                  {form.phone && (
                    <p className="text-xs text-zinc-500 mt-0.5">{form.phone}</p>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-teal-400">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              {/* COD Button */}
              {paymentMethod === "COD" && (
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-600 text-white py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Placing Order..." : `Place Order — Rs. ${total.toLocaleString()}`}
                </button>
              )}

              {/* eSewa Button */}
              {paymentMethod === "eSewa" && (
                <button
                  onClick={saveOrderAndPayEsewa}
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Processing..." : `Pay with eSewa — Rs. ${total.toLocaleString()}`}
                </button>
              )}

              <p className="text-center text-xs text-zinc-600 mt-3">
                {paymentMethod === "COD"
                  ? "💵 Pay cash when your order is delivered"
                  : "🟢 You will be redirected to eSewa"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden eSewa Form */}
      <form
        id="esewa-form"
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        method="POST"
        style={{ display: "none" }}
      >
        <input type="hidden" name="amount"                   value={total} />
        <input type="hidden" name="tax_amount"               value="0" />
        <input type="hidden" name="total_amount"             value={total} />
        <input type="hidden" name="transaction_uuid"         value={transaction_uuid} />
        <input type="hidden" name="product_code"             value="EPAYTEST" />
        <input type="hidden" name="product_service_charge"   value="0" />
        <input type="hidden" name="product_delivery_charge"  value="0" />
        <input type="hidden" name="success_url"              value="http://localhost:5173/payment-success" />
        <input type="hidden" name="failure_url"              value="http://localhost:5173/payment-failure" />
        <input type="hidden" name="signed_field_names"       value="total_amount,transaction_uuid,product_code" />
        <input type="hidden" name="signature"                value={hashInBase64} />
      </form>
    </div>
  );
};

export default Checkout;