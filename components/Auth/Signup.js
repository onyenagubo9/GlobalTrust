"use client";

import { useState } from "react";
import { registerUser } from "@/utils/actions";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, MapPin, Globe, Lock, Briefcase } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    country: "",
    accountType: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await registerUser(formData);
      if (result.success) {
        setMessage("✅ Account created successfully! A welcome email has been sent.");
      } else {
        setError(`❌ ${result.message}`);
      }
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-green-50 via-white to-green-100 p-4 overflow-hidden">
      {/* Background Glow Animation */}
      <motion.div
        className="absolute w-150 h-150 bg-green-400/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-green-100 backdrop-blur-lg"
      >
        {/* === LOGO SPACE === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          {/* Replace `/logo.png` with your actual logo path */}
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
            Create Account
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Open your GlobalTrust Bank account in seconds
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.form
          onSubmit={submitForm}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col space-y-4"
        >
          {/* Input Fields */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-3.5 text-green-600 w-5 h-5" />
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            >
              <option value="">Select Account Type</option>
              <option value="Savings">Savings</option>
              <option value="Checking">Checking</option>
              <option value="Business">Business</option>
            </select>
          </div>

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
              className="absolute right-3 top-3.5 text-gray-500 hover:text-green-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

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
            {loading ? "Creating account..." : "Sign Up"}
          </motion.button>
        </motion.form>

        {/* Message Display */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 text-center text-green-700 font-medium text-sm"
          >
            {message}
          </motion.p>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 text-center text-red-600 font-medium text-sm"
          >
            {error}
          </motion.p>
        )}

        {/* Login Redirect */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <a
              href="/login"
              className="text-green-700 hover:underline font-medium"
            >
              Login here
            </a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
