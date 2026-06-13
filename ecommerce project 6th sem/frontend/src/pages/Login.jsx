import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", formData);
      login(res.data.user, res.data.token); // ← passes user and token separately
      toast.success("Welcome back!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 outline-none focus:border-white/30 transition-colors"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 outline-none focus:border-white/30 transition-colors"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-sm text-zinc-400 text-center mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-white font-semibold underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;