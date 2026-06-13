import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";

const Stars = ({ value }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`text-xs ${s <= Math.round(value) ? "text-amber-400" : "text-zinc-700"}`}>★</span>
    ))}
  </div>
);

const rankColors = {
  1: "bg-amber-400 text-black",
  2: "bg-zinc-300 text-black",
  3: "bg-amber-700 text-white",
  4: "bg-zinc-700 text-white",
};

const ProductCard = ({ product, rank, trendingScore }) => {
  const { addToCart } = useContext(CartContext) || {};
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!addToCart) return;
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden group transition-all duration-300 hover:border-white/20 hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Container */}
<div 
className="aspect-square bg-zinc-900 overflow-hidden relative">
  {/* Product Image */}
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
  ) : (
    <span className="text-5xl text-zinc-700">🎵</span>
  )}

  {/* Out of Stock Overlay */}
  {product.stock === 0 && (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest border border-zinc-600 px-3 py-1.5 rounded-sm">
        Out of Stock
      </span>
    </div>
  )}

  {/* Rank Badge — top LEFT inside image */}
  {rank && (
    <div className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${rankColors[rank] || "bg-zinc-700 text-white"}`}>
      #{rank}
    </div>
  )}

  {/* Trending Score OR "New" — top RIGHT inside image */}
  {rank && (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-teal-700/40 px-2.5 py-1 rounded-full">
      <span className="text-[9px]">🔥</span>
      <span className="text-[10px] text-teal-400 font-bold">
        {trendingScore > 0 ? trendingScore.toFixed(1) : "New"}
      </span>
    </div>
  )}

</div>

      {/* Product Info */}
      <div className="p-6 space-y-2">
        {product.category && (
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-medium">
            {product.category}
          </p>
        )}

        <h3 className="text-white font-medium text-base group-hover:text-zinc-300 transition-colors leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Star Ratings */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Stars value={product.averageRating} />
            <span className="text-[10px] text-zinc-600">({product.numReviews})</span>
          </div>
        )}

        <p className="text-white font-semibold text-lg mb-4">
          Rs. {parseFloat(product.price).toLocaleString()}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;