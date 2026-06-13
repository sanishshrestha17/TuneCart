import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#080808] border-t border-white/5 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-12 mb-16">

          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-serif font-bold text-white mb-5 block">
              TuneCart
            </Link>
            <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-xs">
              Premium quality instruments for musicians across Nepal.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {["f", "ig", "yt"].map(s => (
                <a key={s} href="#"
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all text-xs font-bold"
                >
                  {s === "f" ? "f" : s === "ig" ? "in" : "▶"}
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-serif italic text-lg mb-5">About Us</h4>
            <div className="flex flex-col gap-3 text-zinc-500 text-sm">
              <Link to="/" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/" className="hover:text-white transition-colors">Our Story</Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-serif italic text-lg mb-5">Customer Service</h4>
            <div className="flex flex-col gap-3 text-zinc-500 text-sm">
              <Link to="/" className="hover:text-white transition-colors">• Contact Us</Link>
              <Link to="/" className="hover:text-white transition-colors">• FAQ</Link>
              <Link to="/" className="hover:text-white transition-colors">• Shipping & Returns</Link>
              <Link to="/my-orders" className="hover:text-white transition-colors">• Order Tracking</Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif italic text-lg mb-5">Quick Links</h4>
            <div className="flex flex-col gap-3 text-zinc-500 text-sm">
              <Link to="/" className="hover:text-white transition-colors">• Guitars</Link>
              <Link to="/" className="hover:text-white transition-colors">• Keyboards</Link>
              <Link to="/" className="hover:text-white transition-colors">• Drums</Link>
              <Link to="/" className="hover:text-white transition-colors">• Accessories</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-xs font-light">
            © {new Date().getFullYear()} TuneCart. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-zinc-600 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;