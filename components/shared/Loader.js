"use client";

import { motion } from "framer-motion";

export default function Loader() {
  // Square movement path (logo moves along a square)
  const squarePath = {
    x: [0, 100, 100, 0, 0],
    y: [0, 0, 100, 100, 0],
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md z-50">
      {/* Square container */}
      <div className="relative w-40 h-40">
        {/* Moving logo */}
        <motion.img
          src="/globaltrust.jpg"
          alt="Honstinger Logo"
          animate={squarePath}
          transition={{
            duration: 5, // ⏳ smoother, longer duration
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-14 h-14 object-contain rounded-full shadow-lg"
        />
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.2 }}
        className="mt-10 text-green-700 text-sm font-medium tracking-wide"
      >
        
      </motion.p>
    </div>
  );
}
