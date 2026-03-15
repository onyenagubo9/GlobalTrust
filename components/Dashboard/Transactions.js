"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  X,
  ArrowLeft,
  Download,
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeTransactions;

    unsubscribeAuth = onAuthStateChanged(auth, async (loggedUser) => {
      if (!loggedUser) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", loggedUser.uid),
        orderBy("timestamp", "desc")
      );

      unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(txs);
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeTransactions) unsubscribeTransactions();
    };
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "Incoming") return tx.type.includes("Incoming");
    if (filter === "Outgoing") return tx.type.includes("Outgoing");
    return true;
  });

  // ✅ Generate Styled PDF with Tailwind-safe rendering
  const handleDownloadPDF = async () => {
    if (!selectedTransaction || !receiptRef.current) return;

    const receiptEl = receiptRef.current;
    receiptEl.querySelectorAll("*").forEach((el) => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const color = style.color;

      // Replace unsupported oklch colors
      if (bg && bg.includes("oklch")) el.style.backgroundColor = "#ffffff";
      if (color && color.includes("oklch")) el.style.color = "#000000";
    });

    const canvas = await html2canvas(receiptEl, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imageWidth = pageWidth - 60;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    // Add bank-style header
    pdf.setFillColor(16, 185, 129); // Green bar
    pdf.rect(0, 0, pageWidth, 60, "F");
    pdf.setTextColor("#ffffff");
    pdf.setFontSize(16);
    pdf.text("Firstcbu Bank - Transaction Receipt", 40, 38);

    // Add logo watermark
    const watermark = new Image();
    watermark.src = "/honstinger-logo.png";
    pdf.addImage(watermark, "PNG", pageWidth / 2 - 50, 300, 100, 100, "", "FAST");

    // Add the transaction image snapshot
    pdf.addImage(imgData, "PNG", 30, 80, imageWidth, imageHeight);

    // Add signature section
    pdf.setFontSize(12);
    pdf.setTextColor("#444");
    pdf.text("Authorized Signature: ____________________", 40, 780);
    pdf.text("Thank you for banking with Firstcbu.", 40, 800);

    pdf.save(`transaction_${selectedTransaction.id}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 relative">
        {/* 🔙 Back Button */}
        <Link
          href="/dashboard"
          className="flex items-center text-green-600 hover:text-green-700 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Transaction History
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <p className="text-gray-700 text-sm font-medium">
              Filter Transactions:
            </p>
          </div>

          <div className="flex space-x-2">
            {["All", "Incoming", "Outgoing"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  filter === type
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No {filter.toLowerCase()} transactions found.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTransaction(tx)}
                className={`flex justify-between items-center p-4 rounded-xl border shadow-sm cursor-pointer transition ${
                  tx.type.includes("Outgoing")
                    ? "border-red-100 bg-red-50 hover:bg-red-100"
                    : "border-green-100 bg-green-50 hover:bg-green-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      tx.type.includes("Outgoing")
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {tx.type.includes("Outgoing") ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">
                      {tx.type.includes("Outgoing")
                        ? `Sent to ${tx.to || "Unknown"}`
                        : `Received from ${tx.from || "Unknown"}`}
                    </p>
                    <p className="text-xs text-gray-500">{tx.note || "No note"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tx.timestamp
                        ? new Date(tx.timestamp.seconds * 1000).toLocaleString()
                        : "Pending..."}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      tx.type.includes("Outgoing")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {tx.type.includes("Outgoing") ? "-" : "+"}${" "}
                    {Number(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{tx.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 💬 Transaction Details Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 w-96 relative"
              ref={receiptRef}
              style={{ backgroundColor: "#fff", color: "#000" }}
            >
              <button
                onClick={() => setSelectedTransaction(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                <img
                  src="/honstinger-logo.png"
                  alt="Honstinger Logo"
                  className="w-12 h-12 mx-auto mb-2"
                />
                <h2 className="text-lg font-bold text-gray-800">
                  Transaction Receipt
                </h2>
                <p className="text-sm text-gray-500">FirstCBU Bank</p>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm border-t pt-3 border-gray-200">
                <p><strong>Type:</strong> {selectedTransaction.type}</p>
                <p><strong>Amount:</strong> ${Number(selectedTransaction.amount).toLocaleString()}</p>
                {selectedTransaction.type.includes("Outgoing") ? (
                  <p><strong>To:</strong> {selectedTransaction.to || "Unknown"}</p>
                ) : (
                  <p><strong>From:</strong> {selectedTransaction.from || "Unknown"}</p>
                )}
                <p><strong>Account Number:</strong> {selectedTransaction.accountNumber || "N/A"}</p>
                <p><strong>Note:</strong> {selectedTransaction.note || "No note provided"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      selectedTransaction.status === "Successful"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.status}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedTransaction.timestamp
                    ? new Date(selectedTransaction.timestamp.seconds * 1000).toLocaleString()
                    : "Pending..."}
                </p>
                <p><strong>Transaction ID:</strong> {selectedTransaction.id}</p>
              </div>

              {/* Footer */}
              <div className="mt-4 border-t pt-3 text-center text-xs text-gray-500">
                <p>“Secure • Fast • Reliable”</p>
              </div>

              {/* Download Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDownloadPDF}
                className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Receipt (PDF)</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
