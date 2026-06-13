import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";

const CATEGORIES = ["String Instruments", "Percussion Instruments", "Wind Instruments", "Traditional Instruments","Accessories"];

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
    category: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const fileInputRef = useRef();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch {
      showToast("Failed to load orders", "error");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      showToast("Order status updated");
      fetchOrders();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  // ← CORRECT POSITION — outside return()
  const refundOrder = async (orderId) => {
    if (!window.confirm("Refund this order? Stock will be restored.")) return;
    try {
      await api.put(`/orders/${orderId}/refund`);
      showToast("Order refunded and stock restored");
      fetchOrders();
      fetchProducts();
    } catch {
      showToast("Failed to refund order", "error");
    }
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const submitHandler = async () => {
    if (!form.name || !form.price) {
      showToast("Name and price are required", "error");
      return;
    }
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
        showToast("Product updated successfully");
      } else {
        await api.post("/products", form);
        showToast("Product added successfully");
      }
      resetForm();
      fetchProducts();
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", description: "", image: "", stock: "", category: "" });
    setEditingId(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const editHandler = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      image: product.image || "",
      stock: product.stock || "",
      category: product.category || "",
    });
    setImagePreview(product.image || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteHandler = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      showToast("Product deleted");
      fetchProducts();
    } catch {
      showToast("Failed to delete product", "error");
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-zinc-500 font-sans mt-20">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 text-white px-5 py-3 rounded-xl text-sm font-semibold z-[999] shadow-lg animate-bounce ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>
          {toast.type === "error" ? "✕" : "✓"} {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-[220px] bg-zinc-900 flex flex-col py-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-2.5 px-6 pb-7 border-b border-slate-800">
          <span className="text-2xl text-indigo-500">⬡</span>
          <span className="text-base font-bold text-slate-50 tracking-tight">AdminPanel</span>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <div
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
              activeTab === "products" ? "bg-slate-800 text-slate-50" : "text-slate-400 hover:text-slate-50"
            }`}
          >
            <span className="text-sm">▦</span>
            <span>Products</span>
          </div>
          <div
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
              activeTab === "orders" ? "bg-slate-800 text-slate-50" : "text-slate-400 hover:text-slate-50"
            }`}
          >
            <span className="text-sm">◈</span>
            <span>Orders {orders.length > 0 && `(${orders.length})`}</span>
          </div>
        </nav>
        <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">A</div>
          <div className="overflow-hidden">
            <div className="text-[13px] font-semibold text-slate-50 truncate">Admin</div>
            <div className="text-[11px] text-slate-400 truncate">admin@tunecart.com</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 min-w-0">

        {/* Header */}
        <header className="flex justify-between items-start mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === "products" ? "Products" : "Orders"}
            </h1>
            <p className="text-[13px] text-gray-300 mt-1">
              {activeTab === "products"
                ? `${products.length} items in your store`
                : `${orders.length} total orders`}
            </p>
          </div>
          {activeTab === "products" && (
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
              onClick={() => { resetForm(); setShowForm(true); }}
            >
              + Add Product
            </button>
          )}
        </header>

        {/* ═══════════════ PRODUCTS TAB ═══════════════ */}
        {activeTab === "products" && (
          <>
            {/* Form Panel */}
            {showForm && (
              <div className="bg-white rounded-2xl p-7 shadow-md mb-7 border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId ? "Edit Product" : "New Product"}
                  </h2>
                  <button
                    className="bg-transparent border-none cursor-pointer text-base text-slate-400 hover:text-slate-600"
                    onClick={resetForm}
                  >✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-7">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Product Image</label>
                    <div
                      className={`border-2 border-dashed rounded-xl min-h-[200px] flex items-center justify-center cursor-pointer transition-all bg-slate-50 overflow-hidden ${
                        dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
                      }`}
                      onClick={() => fileInputRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full min-h-[200px]">
                          <img src={imagePreview} alt="preview" className="w-full h-[200px] object-cover block" />
                          <button
                            className="absolute top-2 right-2 bg-black/50 border-none text-white rounded-full w-6 h-6 cursor-pointer text-xs flex items-center justify-center hover:bg-black/70"
                            onClick={(e) => { e.stopPropagation(); setImagePreview(null); setForm(f => ({ ...f, image: "" })); }}
                          >✕</button>
                        </div>
                      ) : (
                        <div className="text-center p-5">
                          <div className="text-3xl text-slate-400 mb-2">↑</div>
                          <p className="text-sm text-slate-600 m-0">Drop image here or <span className="text-indigo-600 font-semibold">browse</span></p>
                          <p className="text-[11px] text-slate-400 m-0">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e.target.files[0])}
                    />
                  </div>

                  {/* Fields */}
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Product Name", key: "name", placeholder: "e.g. Yamaha Acoustic Guitar", type: "text" },
                      { label: "Price (Rs.)", key: "price", placeholder: "0.00", type: "number" },
                      { label: "Stock", key: "stock", placeholder: "0", type: "number" },
                    ].map(({ label, key, placeholder, type }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">{label}</label>
                        <input
                          className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          type={type}
                          placeholder={placeholder}
                          value={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        />
                      </div>
                    ))}

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Category</label>
                      <select
                        className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="">Select a category...</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Description</label>
                      <textarea
                        className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-[90px] resize-y"
                        placeholder="Short product description..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 mt-6">
                  <button
                    className="bg-transparent border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all"
                    onClick={resetForm}
                  >Cancel</button>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg px-6 py-2.5 text-sm font-semibold cursor-pointer transition-all shadow-sm"
                    onClick={submitHandler}
                  >
                    {editingId ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            )}

            {/* Stats Row */}
            {!showForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Products", value: products.length, color: "bg-indigo-500" },
                  { label: "In Stock", value: products.filter(p => p.stock > 0).length, color: "bg-emerald-500" },
                  { label: "Out of Stock", value: products.filter(p => p.stock == 0).length, color: "bg-red-500" },
                  { label: "Avg Price", value: products.length ? `Rs. ${Math.round(products.reduce((a, b) => a + Number(b.price), 0) / products.length)}` : "—", color: "bg-amber-500" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className={`w-2 h-2 rounded-full mb-3 ${s.color}`} />
                    <div className="text-2xl font-bold text-slate-900 leading-none">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <input
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full max-w-[300px] bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                placeholder="🔍  Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {loading ? (
                <div className="text-center py-14 text-slate-400 text-sm italic">Loading products...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-14 text-slate-400 text-sm">No products found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                                {p.image
                                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  : <span className="text-lg text-slate-300">◈</span>}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{p.name}</div>
                                <div className="text-xs text-slate-400 truncate max-w-[180px]">{p.description || "No description"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            {p.category ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600">
                                {p.category}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 align-middle font-semibold text-slate-900 text-sm">
                            Rs. {Number(p.price).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 align-middle text-slate-500 text-sm">{p.stock}</td>
                          <td className="px-5 py-3.5 align-middle">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              p.stock > 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                            }`}>
                              {p.stock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <div className="flex gap-2">
                              <button
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                                onClick={() => editHandler(p)}
                              >Edit</button>
                              <button
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-none rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                                onClick={() => deleteHandler(p._id)}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {activeTab === "orders" && (
          <>
            {/* Order Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total Orders", value: orders.length, color: "bg-indigo-500" },
                { label: "Pending", value: orders.filter(o => o.status === "Pending").length, color: "bg-yellow-500" },
                { label: "Processing", value: orders.filter(o => o.status === "Processing").length, color: "bg-blue-500" },
                { label: "Shipped", value: orders.filter(o => o.status === "Shipped").length, color: "bg-purple-500" },
                { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, color: "bg-emerald-500" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className={`w-2 h-2 rounded-full mb-3 ${s.color}`} />
                  <div className="text-2xl font-bold text-slate-900 leading-none">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {orders.length === 0 ? (
                <div className="text-center py-14 text-slate-400 text-sm">No orders yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Customer", "Items", "Total", "Payment", "Status", "Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">

                          {/* Customer */}
                          <td className="px-5 py-4 align-middle">
                            <p className="font-semibold text-sm text-slate-900">{order.user?.name || "User"}</p>
                            <p className="text-xs text-slate-400">{order.user?.email}</p>
                            <p className="text-xs text-slate-400">{order.shippingAddress?.city}</p>
                            <p className="text-xs text-slate-400">{order.shippingAddress?.phone}</p>
                          </td>

                          {/* Items */}
                          <td className="px-5 py-4 align-middle">
                            <div className="space-y-1">
                              {order.products?.map((p, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  {p.image && (
                                    <img src={p.image} alt={p.name} className="w-7 h-7 rounded-md object-cover shrink-0" />
                                  )}
                                  <p className="text-xs text-slate-600">{p.name} × {p.qty}</p>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4 align-middle font-bold text-slate-900 text-sm">
                            Rs. {order.totalAmount?.toLocaleString()}
                          </td>

                          {/* Payment */}
                          <td className="px-5 py-4 align-middle">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              order.paymentMethod === "eSewa"
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}>
                              {order.paymentMethod}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 align-middle">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                order.status === "Delivered"  ? "bg-emerald-100 text-emerald-600" :
                                order.status === "Shipped"    ? "bg-purple-100 text-purple-600"  :
                                order.status === "Processing" ? "bg-blue-100 text-blue-600"      :
                                order.status === "Cancelled"  ? "bg-red-100 text-red-600"        :
                                "bg-yellow-100 text-yellow-600"
                              }`}>
                                {order.status}
                              </span>
                              {order.isRefunded && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-600">
                                  💸 Refunded
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 align-middle">
                            <div className="flex flex-col gap-2">
                              {/* Status dropdown */}
                              {order.status !== "Cancelled" && (
                                <select
                                  value={order.status}
                                  onChange={e => updateOrderStatus(order._id, e.target.value)}
                                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-white outline-none cursor-pointer focus:border-indigo-400"
                                >
                                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              )}

                              {/* Refund button */}
                              {!order.isRefunded && order.status !== "Delivered" && (
                                <button
                                  onClick={() => refundOrder(order._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                                >
                                  💸 Refund
                                </button>
                              )}

                              {/* Refund date */}
                              {order.isRefunded && order.refundedAt && (
                                <p className="text-[10px] text-orange-500">
                                  Refunded on {new Date(order.refundedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;