"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Download,
  Printer,
  ArrowLeft,
  Filter,
  Loader2,
  CreditCard,
  Building2,
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct usage

export default function StatementsPage() {
  const [user, setUser] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const printRef = useRef();

  // ✅ Fetch user info & transactions
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (loggedUser) => {
      if (!loggedUser) return;

      const userRef = doc(db, "users", loggedUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({ id: loggedUser.uid, ...userData });
        setAccountBalance(userData.accountBalance ?? 0);
      }

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", loggedUser.uid),
        orderBy("timestamp", "desc")
      );

      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ✅ Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "All" || t.type?.includes(filterType);
    const matchesDate =
      (!startDate || new Date(t.timestamp?.toDate()) >= new Date(startDate)) &&
      (!endDate || new Date(t.timestamp?.toDate()) <= new Date(endDate));
    return matchesType && matchesDate;
  });

  // ✅ Generate PDF with branding
  const downloadStatement = () => {
    if (typeof window === "undefined") return;

    const pdf = new jsPDF("p", "pt", "a4");
    const green = "#16a34a";

    // Header Branding
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(green);
    pdf.text("FirstCBU Bank", 40, 40);
    pdf.setFontSize(12);
    pdf.setTextColor("#333");
    pdf.text("Official Account Statement", 40, 60);

    pdf.setDrawColor(green);
    pdf.line(40, 70, 550, 70);

    // User Info
    pdf.setFontSize(10);
    pdf.text(`Account Holder: ${user?.name || "—"}`, 40, 95);
    pdf.text(`Account Number: ${user?.accountNumber || "—"}`, 40, 110);
    pdf.text(`Currency: ${user?.currency || "USD"}`, 40, 125);
    pdf.text(
      `Available Balance: ${user?.currency || "USD"} ${accountBalance.toLocaleString()}`,
      40,
      140
    );
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 155);

    // Transactions Table
    const tableData = filteredTransactions.map((t) => [
      new Date(t.timestamp?.toDate()).toLocaleDateString(),
      t.type,
      t.note || "-",
      `${user?.currency || "USD"} ${t.amount.toLocaleString()}`,
      t.status || "Pending",
    ]);

    autoTable(pdf, {
      startY: 180,
      head: [["Date", "Type", "Description", "Amount", "Status"]],
      body: tableData,
      styles: {
        fontSize: 9,
        textColor: "#333",
      },
      headStyles: {
        fillColor: green,
        textColor: "#fff",
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: "#f8f9fa" },
      margin: { left: 40, right: 40 },
    });

    pdf.setFontSize(9);
    pdf.setTextColor("#666");
    pdf.text(
      "This statement is auto-generated and verified by FirstCBU Bank.",
      40,
      pdf.lastAutoTable.finalY + 25
    );

    pdf.save(`FirstCBU_Statement_${user?.accountNumber || "Account"}.pdf`);
  };

  // ✅ Print Statement
  const printStatement = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=900,width=1000");
    printWindow.document.write(`
      <html>
        <head>
          <title>FirstCBU Account Statement</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            header { text-align: center; margin-bottom: 30px; }
            h1 { color: #16a34a; font-size: 24px; margin-bottom: 5px; }
            p { font-size: 13px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background-color: #16a34a; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            footer { margin-top: 30px; text-align: center; font-size: 11px; color: #777; }
          </style>
        </head>
        <body>
          <header>
            <h1>FirstCBU Bank</h1>
            <p>Official Account Statement</p>
            <hr style="border: none; height: 2px; background: #16a34a; width: 80px; margin: 10px auto;">
          </header>
          ${printContents}
          <footer>
            © ${new Date().getFullYear()} FirstCBU Bank. All rights reserved.
          </footer>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-lg p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <div className="flex space-x-3">
            <button
              onClick={printStatement}
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </button>
            <button
              onClick={downloadStatement}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div ref={printRef}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 mb-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <p className="text-lg font-bold text-green-700">FirstCBU Bank</p>
                </div>
                <p className="text-gray-500 text-sm">Account Holder</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.name || "N/A"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Account No: {user?.accountNumber || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Available Account Balance</p>
                <p className="text-2xl font-bold text-gray-800 flex items-center justify-end space-x-1">
                  <span>
                    {user?.currency || "USD"} {accountBalance.toLocaleString()}
                  </span>
                  <CreditCard className="w-5 h-5 text-green-600" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transactions Table */}
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">
              No transactions found.
            </p>
          ) : (
            <table className="w-full text-sm border-t border-gray-100">
              <thead className="bg-green-600 text-white text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-green-50 transition"
                  >
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(t.timestamp?.toDate()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{t.type}</td>
                    <td className="py-3 px-4 text-gray-600">{t.note || "—"}</td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        t.type?.includes("Outgoing") ||
                        t.type?.includes("Bill") ||
                        t.type?.includes("Withdraw")
                          ? "text-red-600"
                          : "text-green-700"
                      }`}
                    >
                      {user?.currency || "USD"} {t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === "Successful"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </main>
  );
}
