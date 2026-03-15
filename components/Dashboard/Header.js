"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient"; // Make sure this points to your Firebase config file

export default function Header() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Listen for auth state changes (when a user logs in/out)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user details from Firestore
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("⚠️ No user data found in Firestore for:", user.uid);
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header
      className="
        sticky top-0 z-50
        flex justify-between items-center
        bg-white/90 backdrop-blur-md
        px-6 py-4 mb-8 shadow-sm border-b border-gray-100
      "
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Here’s your financial overview
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <img
          src={userData?.avatar || "/profile.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full border border-green-200 object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {userData?.name || "Loading..."}
          </p>
          <p className="text-xs text-gray-500">
            {userData?.accountType || "Personal"}
          </p>
        </div>
      </div>
    </header>
  );
}
