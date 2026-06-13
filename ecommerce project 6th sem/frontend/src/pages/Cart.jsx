// src/pages/Cart.jsx   (or src/components/Cart.jsx)
import { useContext } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartContext } from "../context/CartContext";

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart, total } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8">
            <ShoppingBag size={48} className="text-zinc-600" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
            Looks like you haven't added anything yet.
          </p>
          <Link 
            to="/"
            className="bg-white text-black px-10 py-4 rounded-3xl font-semibold text-lg hover:bg-zinc-200 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Your Cart</h1>
          
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 font-medium px-5 py-2 rounded-2xl hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={18} />
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-zinc-900 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center border border-white/10"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-2xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-xl">{item.name}</h3>
                <p className="text-emerald-400 font-medium mt-1">
                  Rs. {item.price?.toLocaleString()}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center bg-zinc-800 rounded-2xl p-2">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 font-semibold text-lg">{item.qty}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right min-w-[120px]">
                <p className="text-sm text-zinc-500">Subtotal</p>
                <p className="text-2xl font-bold">
                  Rs. {(item.price * item.qty).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                className="text-zinc-500 hover:text-red-500 p-2"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>

        {/* Total & Checkout */}
        <div className="mt-12 bg-zinc-900 rounded-3xl p-8 border border-white/10">
          <div className="flex justify-between text-3xl font-bold mb-8">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>

          <Link to="/checkout" className="block">
            <button className="w-full bg-white text-black py-5 rounded-3xl font-semibold text-xl hover:bg-zinc-200 transition-all active:scale-95">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;