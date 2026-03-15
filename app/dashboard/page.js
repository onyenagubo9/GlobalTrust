"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import Header from "@/components/Dashboard/Header";
import SummaryCards from "@/components/Dashboard/SummaryCards";
import QuickActions from "@/components/Dashboard/QuickActions";
import DashboardExtras from "@/components/Dashboard/DashboardExtras";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch realtime user + transaction data
  useEffect(() => {
    let unsubUser = null;
    let unsubTransactions = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Listen for user document updates
        const userRef = doc(db, "users", user.uid);
        unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
          else console.warn("⚠️ No user data found");
        });

        // Listen for transactions (optional if you plan to add them later)
        const txRef = collection(db, "users", user.uid, "transactions");
        const q = query(txRef, orderBy("date", "desc"));
        unsubTransactions = onSnapshot(q, (snapshot) => {
          setTransactions(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        });
      } else {
        setUserData(null);
        setTransactions([]);
      }
      setLoading(false);
    });

    return () => {
      if (unsubUser) unsubUser();
      if (unsubTransactions) unsubTransactions();
      unsubAuth();
    };
  }, []);

  // 🧩 Loading screen
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6"
      >
        {/* Header with live data */}
        <Header user={userData} />

        {/* Live balance + info cards */}
        <SummaryCards />

        {/* Quick Actions */}
        <QuickActions />

         {/* Quick Actions */}
         <DashboardExtras />

      
      </motion.div>
    </DashboardLayout>
  );
}
