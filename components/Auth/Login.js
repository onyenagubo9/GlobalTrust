"use client";

import { useState } from "react";
import { loginUser } from "@/utils/loginActions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await loginUser(formData);

    if (res.success) {
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setMessage(`❌ ${res.message}`);
    }

    setLoading(false);
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-green-50 via-white to-green-100 p-4 overflow-hidden">
      {/* Background Glow Animation */}
      <motion.div
        className="absolute w-150 h-150 bg-green-400/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-green-100 backdrop-blur-lg"
      >
        {/* === LOGO SECTION === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          {/* Replace `/logo.png` with your logo path */}
          <img
            src="/globaltrust.jpg"
            alt="Honstinger Bank Logo"
            className="w-20 h-20 object-contain rounded-full shadow-md"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-extrabold text-green-700 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Sign in to your GlobalTrust Bank account
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col space-y-4"
        >
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-green-600 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Login Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`mt-2 w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-green-200"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </motion.form>

        {/* Message feedback */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-5 text-center font-medium text-sm ${
              message.includes("✅") ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </motion.p>
        )}

        {/* Links */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Forgot password?{" "}
            <a
              href="/reset-password"
              className="text-green-700 hover:underline font-medium"
            >
              Reset here
            </a>
          </p>
          <p className="mt-2">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-green-700 hover:underline font-medium"
            >
              Create one
            </a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
