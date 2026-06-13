import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    street: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Name, email and password are required");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/register", formData);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name",        name: "name",     type: "text",     placeholder: "Your full name",      required: true  },
    { label: "Email",            name: "email",    type: "email",    placeholder: "you@example.com",     required: true  },
    { label: "Password",         name: "password", type: "password", placeholder: "••••••••",            required: true  },
    { label: "Street Address",   name: "street",   type: "text",     placeholder: "e.g. Thamel, KTM",   required: false },
    { label: "City",             name: "city",     type: "text",     placeholder: "e.g. Kathmandu",      required: false },
    { label: "Phone Number",     name: "phone",    type: "tel",      placeholder: "98XXXXXXXX",          required: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-serif font-bold text-white text-center mb-2">
          Create Account
        </h2>
        <p className="text-zinc-500 text-sm text-center mb-8">
          Join TuneCart — fill in your details below
        </p>

        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block mb-2">
                {field.label}
                {!field.required && (
                  <span className="text-zinc-600 normal-case tracking-normal ml-1">(optional)</span>
                )}
              </label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-zinc-600 outline-none focus:border-teal-600/50 transition-colors text-sm"
                value={formData[field.name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {/* Divider hint */}
        <p className="text-xs text-zinc-600 mt-4 text-center">
          Address fields are used to auto-fill your shipping details at checkout
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-teal-700 hover:bg-teal-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-zinc-500 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;