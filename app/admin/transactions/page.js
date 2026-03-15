"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Trash2,
  Search,
  Filter,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  X,
  Info,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter + Search logic
  useEffect(() => {
    let filteredList = transactions;

    if (filterType !== "All") {
      filteredList = filteredList.filter((tx) => tx.type === filterType);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      filteredList = filteredList.filter(
        (tx) =>
          tx.to?.toLowerCase().includes(s) ||
          tx.from?.toLowerCase().includes(s) ||
          tx.accountNumber?.toLowerCase().includes(s)
      );
    }

    setFiltered(filteredList);
    setCurrentPage(1);
  }, [filterType, search, transactions]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    await deleteDoc(doc(db, "transactions", id));
    setTransactions(transactions.filter((t) => t.id !== id));
    setSelectedTx(null);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = () => {
    const csvRows = [
      ["User", "Type", "Amount", "Account Number", "Status", "Date"],
      ...filtered.map((tx) => [
        tx.from || tx.to || "Unknown",
        tx.type,
        `$${tx.amount?.toLocaleString() || 0}`,
        tx.accountNumber || "—",
        tx.status || "Pending",
        tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() : "—",
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    link.click();
  };

  const exportPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text("Transactions Report", 14, 15);
    const tableData = filtered.map((tx) => [
      tx.from || tx.to || "Unknown",
      tx.type,
      `$${tx.amount?.toLocaleString() || 0}`,
      tx.accountNumber || "—",
      tx.status || "Pending",
      tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() : "—",
    ]);

    docPDF.autoTable({
      head: [["User", "Type", "Amount", "Account", "Status", "Date"]],
      body: tableData,
      startY: 25,
    });

    docPDF.save("transactions.pdf");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );

  return (
    <main className="relative pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-600" />
          Transactions Management
        </h1>

        <div className="flex space-x-2 mt-3 sm:mt-0">
          <button
            onClick={exportCSV}
            className="flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1 text-green-600" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-1 text-green-600" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-1/3 shadow-sm">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name or account..."
            className="flex-1 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option>All</option>
            <option>Deposit</option>
            <option>Transfer - Outgoing</option>
            <option>Transfer - Incoming</option>
            <option>Card Purchase</option>
            <option>Card Payment</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white text-xs uppercase">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Account</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              currentItems.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-100 hover:bg-gray-50 text-gray-700 cursor-pointer"
                  onClick={() => setSelectedTx(tx)}
                >
                  <td className="py-3 px-4">{tx.from || tx.to || "Unknown"}</td>
                  <td className="py-3 px-4 flex items-center space-x-2">
                    {tx.type?.includes("Deposit") ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    ) : tx.type?.includes("Transfer") ? (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    ) : tx.type?.includes("Card") ? (
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Wallet className="w-4 h-4 text-gray-500" />
                    )}
                    <span>{tx.type}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    ${tx.amount?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-4">{tx.accountNumber || "—"}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      tx.status === "Successful"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {tx.status || "Pending"}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {tx.timestamp?.toDate
                      ? tx.timestamp.toDate().toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Info className="w-4 h-4 text-green-600 inline-block" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 text-sm rounded-md border ${
              currentPage === i + 1
                ? "bg-green-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg w-[95%] max-w-md p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setSelectedTx(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 text-green-600 mr-2" />
                Transaction Details
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Type:</strong> {selectedTx.type}</p>
                <p><strong>From:</strong> {selectedTx.from || "—"}</p>
                <p><strong>To:</strong> {selectedTx.to || "—"}</p>
                <p><strong>Account Number:</strong> {selectedTx.accountNumber || "—"}</p>
                <p><strong>Amount:</strong> ${selectedTx.amount?.toLocaleString() || 0}</p>
                <p><strong>Status:</strong> {selectedTx.status}</p>
                <p><strong>Date:</strong> 
                  {selectedTx.timestamp?.toDate ? selectedTx.timestamp.toDate().toLocaleString() : "—"}
                </p>
                <p><strong>Note:</strong> {selectedTx.note || "—"}</p>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(selectedTx.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </motion.button>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
