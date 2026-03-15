"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, SendHorizonal } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <main className="bg-linear-to-b from-white via-green-50 to-white min-h-screen text-gray-800 overflow-hidden">
      {/* 🌿 Hero Section */}
      <section className="text-center py-20 px-6 relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-green-700 mb-4"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Our team is here to help you. Whether you have a question, feedback, or need support — 
          we’d love to hear from you.
        </motion.p>

        <motion.div
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-125 h-125 bg-green-200/30 rounded-full blur-3xl -z-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* 📬 Contact Form Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            We’d Love to Hear From You
          </h2>
          <p className="text-gray-700 mb-8">
            Have questions about our services or need support? Reach out via the form or 
            use one of the contact details below. Our customer success team typically replies 
            within 24 hours.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-green-600 w-6 h-6" />
              <span>admin@globaltrustbank.org</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-green-600 w-6 h-6" />
              <span>+1 (800) 555-0134</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-green-600 w-6 h-6" />
              <span>123 Finance Street, Silicon Valley, CA</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg border border-green-100 p-8"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="mt-6 w-full py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <SendHorizonal className="w-5 h-5" />
            {sent ? "Message Sent ✅" : "Send Message"}
          </motion.button>
        </motion.form>
      </section>

      {/* 🌍 Footer / Map Illustration */}
      <section className="relative bg-linear-to-r from-green-600 to-emerald-500 text-white py-20 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          Visit Our Global Offices
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-green-100 mb-8"
        >
          We’re growing around the world to serve you better. Let’s connect in person or online.
        </motion.p>

        {/* Optional background pattern or map */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/world-map.png')] bg-cover bg-center -z-10" />
      </section>
    </main>
  );
}
