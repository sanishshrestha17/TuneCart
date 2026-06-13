import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import image from "../assets/hero-image.png";

const CATEGORY_TABS = [
  { name: "String",     icon: "🎸", db: "String Instruments" },
  { name: "Wind",       icon: "🎷", db: "Wind Instruments" },
  { name: "Percussion", icon: "🥁", db: "Percussion Instruments" },
  { name: "Traditional", icon: "🪕", db: "Traditional Instruments" },
  { name: "Accessories", icon: "♫", db: "Accessories" }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Fetch trending
  useEffect(() => {
    api.get("/products/trending")
      .then(res => setTrendingProducts(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get(`/products?search=${encodeURIComponent(search)}`)
        .then(res => { setProducts(res.data || []); setLoading(false); })
        .catch(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== "All") {
      result = result.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    const min = parseFloat(priceMin) || 0;
    const max = parseFloat(priceMax) || Infinity;
    result = result.filter(p => {
      const price = parseFloat(p.price) || 0;
      return price >= min && price <= max;
    });
    if (sortOption === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "price-high") result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => (b._id || "").localeCompare(a._id || ""));
    return result;
  }, [products, selectedCategory, sortOption, priceMin, priceMax]);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
        <img
          src={image}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
          <p className="text-teal-500 font-medium tracking-[0.4em] mb-4 text-xs uppercase">
            New Collection
          </p>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6 text-white">
            Instruments That <br />
            <span className="italic">Define Your Sound</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mb-10 font-light">
            Premium quality instruments for musicians
          </p>
          <button
            onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-teal-700 hover:bg-teal-600 text-white px-10 py-3.5 rounded-md font-medium text-base transition-all"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* ── CATEGORY TABS ── */}
      <section className="bg-[#0c0c0c] py-20">
  <div className="max-w-7xl mx-auto px-6">

    {/* Section Title */}
    <div className="flex items-center gap-6 justify-center mb-14">
      <div className="h-px bg-zinc-800 flex-1 max-w-[100px]" />
      <h2 className="text-2xl font-serif italic text-white">
        Explore Categories
      </h2>
      <div className="h-px bg-zinc-800 flex-1 max-w-[100px]" />
    </div>

    {/* Category Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

      {CATEGORY_TABS.map(cat => (
        <button
          key={cat.name}
          onClick={() => {
            setSelectedCategory(
              selectedCategory === cat.db ? "All" : cat.db
            );
            document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
          }}

          className={`group flex flex-col items-center justify-center gap-4 p-8 rounded-xl border transition-all duration-300 ${
            selectedCategory === cat.db
              ? "bg-zinc-800 border-teal-600"
              : "bg-zinc-900/40 border-white/10 hover:border-white/30 hover:bg-zinc-800/60"
          }`}
        >
          {/* Icon */}
          <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
            {cat.icon}
          </span>

          {/* Name */}
          <p className="text-sm font-medium text-white tracking-wide">
            {cat.name}
          </p>
        </button>
      ))}

    </div>
  </div>
</section>

     {/* ── TRENDING INSTRUMENTS ── */}
{trendingProducts.length > 0 && (
  <section className="bg-[#0c0c0c] py-20">
    <div className="max-w-7xl mx-auto px-6">

      {/* Section Header */}
      <div className="flex items-center gap-6 justify-center mb-4">
        <div className="h-px bg-zinc-800 flex-1 max-w-[120px]" />
        <h2 className="text-3xl font-serif italic text-white tracking-tight">
          Trending Instruments
        </h2>
        <div className="h-px bg-zinc-800 flex-1 max-w-[120px]" />
      </div>

      {/* Subtitle */}
      <p className="text-center text-zinc-500 text-sm mb-14 font-light">
        Most popular instruments based on ratings and reviews
      </p>

      {/* Cards with rank badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product, index) => (
          <div key={product._id} className="relative">

            {/* Rank Badge */}
            <div className={`absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${
              index === 0 ? "bg-amber-400 text-black" :
              index === 1 ? "bg-zinc-300 text-black" :
              index === 2 ? "bg-amber-700 text-white" :
              "bg-zinc-700 text-white"
            }`}>
              #{index + 1}
            </div>
            <div className="absolute top-3 right-3 z-20">
  <div className="flex items-center gap-1.5 bg-teal-500 text-white px-3 py-1 rounded-sm shadow-lg backdrop-blur-sm">
    <span className="text-[10px] animate-pulse">🔥</span> 
    <span className="text-[10px] font-bold tracking-[0.15em] uppercase">
      Hot
    </span>
  </div>
</div>
           {/* Trending Score Badge — inside image bottom left
<div className="absolute bottom-[140px] left-3 z-10">
  <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-teal-700/40 px-2.5 py-1 rounded-full">
    <span className="text-[9px]">🔥</span>
    <span className="text-[10px] text-teal-400 font-bold">
      {product.trendingScore > 0
        ? product.trendingScore.toFixed(1)
        : "New"}
    </span>
  </div>
</div> */}

            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Algorithm explanation */}
      <div className="mt-10 text-center">
        <p className="text-zinc-700 text-xs font-light">
          Trending score = (avg rating × 0.6) + (log(reviews + 1) × 0.4)
        </p>
      </div>

    </div>
  </section>
)}

      {/* ── WHY TUNECART ── */}
      <section className="bg-[#111] border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 justify-center mb-12">
            <div className="h-px bg-zinc-800 flex-1 max-w-[80px]" />
            <h2 className="text-2xl font-serif italic text-white">Why Choose TuneCart?</h2>
            <div className="h-px bg-zinc-800 flex-1 max-w-[80px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🛡️", title: "Premium Quality Instruments", desc: "Every instrument is carefully selected for quality and durability" },
              { icon: "🚚", title: "Fast Delivery in Nepal", desc: "Quick and reliable delivery across Nepal" },
              { icon: "🎵", title: "Trusted by Musicians", desc: "Thousands of musicians trust TuneCart for their needs" },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-4 p-8 bg-zinc-900/30 rounded-md border border-white/5">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="font-serif text-lg text-white">{item.title}</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL PRODUCTS ── */}
      <section className="bg-[#0c0c0c] py-20" id="products-section">
        <div className="max-w-7xl mx-auto px-6">

          {/* Search + Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 border border-white/5 rounded-md p-5 mb-10">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="bg-[#161616] border border-white/10 focus:border-white/20 rounded-md py-2.5 pl-10 pr-5 text-sm outline-none w-56 text-zinc-300 placeholder-zinc-600"
                />
              </div>

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#161616] border border-white/10 rounded-md px-4 py-2.5 text-sm outline-none text-zinc-300 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORY_TABS.map(cat => (
                  <option key={cat.db} value={cat.db}>{cat.name} Instruments</option>
                ))}
              </select>

              {/* Price filter */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Rs."
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-md px-3 py-2.5 text-sm outline-none w-24 text-zinc-300 placeholder-zinc-600"
                />
                <span className="text-zinc-600 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max Rs."
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  className="bg-[#161616] border border-white/10 rounded-md px-3 py-2.5 text-sm outline-none w-24 text-zinc-300 placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Sort + count */}
            <div className="flex items-center gap-4">
              <span className="text-zinc-600 text-xs">{filteredProducts.length} products</span>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="bg-[#161616] border border-white/10 rounded-md px-4 py-2.5 text-sm outline-none text-zinc-300 cursor-pointer"
              >
                <option value="newest">Sort By: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* Reset */}
              {(selectedCategory !== "All" || priceMin || priceMax || search) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceMin(""); setPriceMax("");
                    setSearch(""); setSortOption("newest");
                  }}
                  className="text-xs text-zinc-500 hover:text-white border border-white/10 px-3 py-2.5 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-zinc-900 rounded-md overflow-hidden">
                  <div className="aspect-square bg-zinc-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-zinc-800 rounded w-4/5" />
                    <div className="h-4 bg-zinc-800 rounded w-2/5" />
                    <div className="h-9 bg-zinc-800 rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-xl text-zinc-500 font-serif italic">No instruments found</p>
              <button
                onClick={() => { setSelectedCategory("All"); setPriceMin(""); setPriceMax(""); setSearch(""); }}
                className="mt-6 text-sm text-zinc-500 hover:text-white border border-white/10 px-6 py-2.5 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;