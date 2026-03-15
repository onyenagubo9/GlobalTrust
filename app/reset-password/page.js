"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      setMessage("A password reset link has been sent to your email.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset link. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border border-gray-100 shadow-lg rounded-2xl p-8"
      >
        {/* Back Button */}
        <Link
          href="/login"
          className="flex items-center text-green-600 hover:text-green-700 text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Reset Your Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your registered email and we’ll send you a password reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-600 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </form>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-5 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg p-3"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Footer */}
        {sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Didn’t get the email?{" "}
            <button
              onClick={handleResetPassword}
              className="text-green-600 font-medium hover:underline"
            >
              Resend
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
