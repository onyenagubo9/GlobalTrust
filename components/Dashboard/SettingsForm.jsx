"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { motion } from "framer-motion";
import {
  User,
  FileCheck2,
  Lock,
  Shield,
  Banknote,
  GaugeCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsForm() {
  const [userData, setUserData] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  // 🧩 Fetch user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ⚙️ Settings Options
  const settingsOptions = [
    {
      title: "Edit Profile",
      icon: <User className="w-5 h-5 text-green-600" />,
      desc: "Update your personal details and contact info",
      link: "/settings/edit-profile",
    },
    {
      title: "KYC Verification",
      icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />,
      desc: "Submit your ID documents for account verification",
      link: "/settings/kyc",
    },
    {
      title: "Change Password",
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      desc: "Reset or update your account password",
      link: "/settings/change-password",
    },
    {
      title: "Privacy Policy",
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      desc: "View our privacy and data protection policy",
      link: "/settings/privacy",
    },
    {
      title: "Bank Account",
      icon: <Banknote className="w-5 h-5 text-yellow-600" />,
      desc: "Manage your linked bank accounts",
      link: "/settings/bank-account",
    },
    {
      title: "Account Limit",
      icon: <GaugeCircle className="w-5 h-5 text-orange-600" />,
      desc: "Check your transaction and withdrawal limits",
      link: "/settings/account-limit",
    },
  ];

  // 🚪 Logout Handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("❌ Failed to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 🧍 User Info */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <img
          src={userData?.avatar || "/profile.jpg"}
          alt="User Avatar"
          className="w-14 h-14 rounded-full border border-green-300 object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {userData?.name || "User Name"}
          </h2>
          <p className="text-gray-500 text-sm">
            {userData?.email || "Email not available"}
          </p>
          <p className="text-xs text-gray-400">
            {userData?.accountType || "Personal"} Account
          </p>
        </div>
      </div>

      {/* ⚙️ Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsOptions.map((option, index) => (
          <motion.a
            key={index}
            href={option.link}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-start space-x-3 p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 rounded-xl transition-all"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">{option.icon}</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {option.title}
              </h3>
              <p className="text-xs text-gray-500">{option.desc}</p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* 🚪 Logout Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-6 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-medium transition shadow-sm"
      >
        {loggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Logging out...</span>
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
