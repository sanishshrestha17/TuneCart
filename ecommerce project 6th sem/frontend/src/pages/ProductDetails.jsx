import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react";
import api from "../api/axios";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; 


const Stars = ({ value, interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => interactive && onChange(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-colors ${interactive ? "cursor-pointer text-2xl" : "text-lg"} ${
            s <= (hovered || value) ? "text-amber-400" : "text-zinc-600"
          }`}
        >★</span>
      ))}
    </div>
  );
};

const ReviewSection = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/${productId}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.averageRating || 0);
      setNumReviews(res.data.numReviews || 0);
    } catch {}
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const hasReviewed = user && reviews.some(r => r.user === user._id);

  const submitReview = async () => {
    if (!rating) return setError("Please select a star rating");
    if (!comment.trim()) return setError("Please write a comment");
    setError(""); setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      setSuccess("Review submitted!"); setRating(0); setComment("");
      fetchReviews();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    } finally { setSubmitting(false); }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      fetchReviews();
      toast.success("Review deleted");
    } catch {}
  };

  return (
    <div className="mt-16 border-t border-white/10 pt-12">
      <h2 className="text-3xl font-bold tracking-tight mb-8">
        Reviews {numReviews > 0 && <span className="text-zinc-500 text-xl font-normal">({numReviews})</span>}
      </h2>

      {numReviews > 0 && (
        <div className="flex items-center gap-8 bg-zinc-900 rounded-2xl p-6 mb-8 border border-white/10">
          <div className="text-center">
            <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
            <Stars value={Math.round(avgRating)} />
            <div className="text-sm text-zinc-500 mt-1">{numReviews} reviews</div>
          </div>
          <div className="flex-1">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              return (
                <div key={star} className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-zinc-500 w-2">{star}</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: numReviews ? `${(count/numReviews)*100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-600 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4 mb-10">
        {reviews.length === 0 ? (
          <p className="text-zinc-500 text-center py-10">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white">{r.name}</p>
                  <Stars value={r.rating} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  {(user?._id === r.user || user?.role === "admin") && (
                    <button onClick={() => deleteReview(r._id)} className="text-xs text-red-500 hover:text-red-400">
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-zinc-400 mt-3 leading-relaxed">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {!user ? (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 text-center">
          <p className="text-zinc-400">
            Please{" "}
            <a href="/login" className="text-white underline underline-offset-4">log in</a>
            {" "}to leave a review.
          </p>
        </div>
      ) : hasReviewed ? (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 text-center text-zinc-400">
          You have already reviewed this product.
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-5">Write a Review</h3>
          <div className="mb-4">
            <p className="text-sm text-zinc-400 mb-2">Your Rating</p>
            <Stars value={rating} interactive onChange={setRating} />
          </div>
          <div className="mb-4">
            <p className="text-sm text-zinc-400 mb-2">Your Comment</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full bg-zinc-800 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 resize-none h-28 outline-none focus:border-white/30 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          {success && <p className="text-emerald-400 text-sm mb-3 font-medium">✓ {success}</p>}
          <button
            onClick={submitReview}
            disabled={submitting}
            className="bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-zinc-100 transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── NEW: Recommendation Card ─────────────────────────────────────────────────
const RecommendationCard = ({ product, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-1"
  >
    <div className="aspect-square overflow-hidden bg-zinc-800">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl">👕</div>
      )}
    </div>
    <div className="p-4">
      {product.category && (
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{product.category}</p>
      )}
      <h3 className="font-semibold text-white leading-tight line-clamp-2 mb-2">{product.name}</h3>

      {product.numReviews > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-xs ${s <= Math.round(product.averageRating) ? "text-amber-400" : "text-zinc-700"}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-zinc-500">({product.numReviews})</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-white">Rs. {product.price?.toLocaleString()}</p>
        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
          product.stock > 0
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {product.stock > 0 ? "In Stock" : "Sold Out"}
        </span>
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]); // ← NEW

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        // ── NEW: fetch recommendations ──────────────────────────────────────
        const recRes = await api.get(`/products/${id}/recommendations`);
        setRecommendations(recRes.data);
        // ───────────────────────────────────────────────────────────────────

      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center text-zinc-400">
        Product not found
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-zinc-400 hover:text-white mb-10 group transition-colors"
        >
          <div className="p-3 bg-zinc-900 rounded-2xl group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={22} />
          </div>
          <span className="text-lg font-medium">Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Image */}
          <div className="relative">
            <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button className="p-4 bg-zinc-900/90 backdrop-blur-xl rounded-2xl hover:bg-zinc-800 transition-all border border-white/10">
                <Heart size={22} className="text-white" />
              </button>
              <button className="p-4 bg-zinc-900/90 backdrop-blur-xl rounded-2xl hover:bg-zinc-800 transition-all border border-white/10">
                <Share2 size={22} className="text-white" />
              </button>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-10">
            {product.category && (
              <p className="uppercase text-xs tracking-[2px] text-emerald-400 font-medium">
                {product.category}
              </p>
            )}
            <h1 className="text-5xl font-bold tracking-tighter leading-none">{product.name}</h1>
            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-bold">Rs. {product.price?.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-2xl text-zinc-500 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
            <div className={`inline-flex items-center px-5 py-2 rounded-2xl text-sm font-medium ${
              product.stock > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}>
              {product.stock > 0 ? `In Stock — ${product.stock} remaining` : "Out of Stock"}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-zinc-400 leading-relaxed text-[17px]">
                {product.description || "No description available."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-white hover:bg-zinc-100 text-black py-5 rounded-3xl font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-5 rounded-3xl font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
            <div className="pt-10 border-t border-white/10 text-xs text-zinc-500 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>✓ Free Shipping (Orders above Rs. 5000)</div>
              <div>✓ 30-Day Easy Returns</div>
              <div>✓ Secure Payment</div>
            </div>
          </div>
        </div>

        {/* ── NEW: Recommendations Section ───────────────────────────────── */}
        {recommendations.length > 0 && (
          <div className="mt-20">
            <div className="border-t border-white/10 pt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs text-emerald-400 uppercase tracking-[2px] font-medium mb-1">
                    You May Also Like
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight">Similar Products</h2>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-zinc-400 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-xl hover:border-white/20"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map(rec => (
                  <RecommendationCard
                    key={rec._id}
                    product={rec}
                    onClick={() => navigate(`/products/${rec._id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {/* ───────────────────────────────────────────────────────────────── */}

        {/* Reviews */}
        <ReviewSection productId={id} />

      </div>
    </div>
  );
};

export default ProductDetails;