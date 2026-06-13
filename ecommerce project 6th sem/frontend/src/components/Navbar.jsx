import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const auth = useContext(AuthContext);
  const { totalItems } = useContext(CartContext) || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!auth) return null;
  const { user, logout } = auth;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-serif font-semibold text-white tracking-wide">
          TuneCart
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-12 text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
          <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
          <button
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="hover:text-white transition-colors"
          >
            Shop
          </button>
          <Link to="/cart" className="hover:text-zinc-200 transition-colors relative">
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-white text-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors">
              Admin
            </Link>
          )}
          {user && (
            <Link to="/my-orders" className="hover:text-zinc-200transition-colors">
              My Orders
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-sm">
                Hi, {user.name?.split(" ")[0] || "User"}
              </span>
              <button
                onClick={logout}
                className="border border-zinc-700 px-6 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white hover:text-black transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-black px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0c0c0c] border-t border-white/5 px-6 py-8">
          <div className="flex flex-col gap-6 text-sm text-zinc-300">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-white">Home</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="hover:text-white">
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
            {user && (
              <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="hover:text-white">My Orders</Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-amber-400">Admin Panel</Link>
            )}
            {user ? (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-red-400 text-left">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-white">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;