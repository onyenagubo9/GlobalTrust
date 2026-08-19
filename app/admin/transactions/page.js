"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Search,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  X,
} from "lucide-react";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // 👥 USERS LIST FOR DROPDOWN
  const [usersList, setUsersList] = useState([]);

  // ➕ NEW TRANSACTION MODAL STATE
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    userId: "",
    from: "",
    to: "",
    accountNumber: "",
    amount: "",
    type: "Deposit",
    status: "Successful",
    currency: "USD",
    note: "",
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const itemsPerPage = 8;

  // 🎨 STATUS COLOR HELPER
  const getStatusStyle = (status) => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-700 border-green-200";
      case "Failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // 🔥 REALTIME TRANSACTIONS FETCH & USERS FETCH
  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(data);
      setFiltered(data);
      setLoading(false);
    });

    // Fetch users collection (assuming your collection is named "users")
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsersList(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();

    return () => unsubscribe();
  }, []);

  // 👤 HANDLE USER SELECTION FROM DROPDOWN
  const handleUserSelect = (e) => {
    const selectedUserId = e.target.value;
    const foundUser = usersList.find((u) => u.id === selectedUserId);

    if (foundUser) {
      setAddData({
        ...addData,
        userId: foundUser.id,
        to: foundUser.fullName || foundUser.name || foundUser.email || "User",
        accountNumber: foundUser.accountNumber || foundUser.accNum || "",
      });
    } else {
      setAddData({
        ...addData,
        userId: "",
        to: "",
        accountNumber: "",
      });
    }
  };

  // 🔍 SEARCH LOGIC
  useEffect(() => {
    const safe = (val) => (val || "").toString().toLowerCase();
    const filteredList = transactions.filter((tx) =>
      safe(tx.from).includes(search.toLowerCase()) ||
      safe(tx.to).includes(search.toLowerCase()) ||
      safe(tx.accountNumber).includes(search.toLowerCase())
    );
    setFiltered(filteredList);
    setCurrentPage(1);
  }, [search, transactions]);

  // ➕ CREATE LOGIC
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: addData.userId || "",
        from: addData.from || "Admin",
        to: addData.to || "User",
        accountNumber: addData.accountNumber || "",
        amount: Number(addData.amount) || 0,
        type: addData.type || "Deposit",
        status: addData.status || "Successful",
        currency: addData.currency || "USD",
        note: addData.note || "",
        timestamp: addData.timestamp
          ? Timestamp.fromDate(new Date(addData.timestamp))
          : Timestamp.now(),
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "transactions"), payload);
      alert("Transaction created successfully ✅");
      setIsAddOpen(false);
      setAddData({
        userId: "",
        from: "",
        to: "",
        accountNumber: "",
        amount: "",
        type: "Deposit",
        status: "Successful",
        currency: "USD",
        note: "",
        timestamp: new Date().toISOString().slice(0, 16),
      });
    } catch (err) {
      console.error("Create Error:", err);
      alert("Failed to create transaction: " + err.message);
    }
  };

  // ❌ DELETE LOGIC
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
      setSelectedTx(null);
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  // ✅ SAVE / UPDATE LOGIC
  const handleUpdate = async () => {
    try {
      const ref = doc(db, "transactions", selectedTx.id);

      const payload = {
        amount: Number(editData.amount) || 0,
        status: editData.status || "Pending",
        type: editData.type || "Deposit",
        accountNumber: editData.accountNumber || "",
        from: editData.from || "",
        to: editData.to || "",
        note: editData.note || "",
        timestamp: editData.timestamp 
          ? Timestamp.fromDate(new Date(editData.timestamp)) 
          : selectedTx.timestamp,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(ref, payload);
      alert("Transaction updated successfully ✅");
      setIsEditing(false);
      setSelectedTx(null);
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update: " + err.message);
    }
  };

  // 📄 PAGINATION
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-green-600 w-10 h-10" />
        <p className="text-gray-500 font-medium">Loading ledger...</p>
      </div>
    );

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Activity className="text-green-600" />
          Transaction Management
        </h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search accounts or users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-green-100 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="p-4">User/Account</th>
              <th className="p-4">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-green-50/40 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedTx(tx);
                  setEditData({
                    ...tx,
                    timestamp: tx.timestamp?.toDate
                      ? tx.timestamp.toDate().toISOString().slice(0, 16)
                      : "",
                  });
                  setIsEditing(false);
                }}
              >
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{tx.from || tx.to}</div>
                  <div className="text-xs text-gray-500">{tx.accountNumber}</div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    {tx.type === "Deposit" ? (
                      <ArrowDownLeft className="text-green-600 w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="text-red-500 w-4 h-4" />
                    )}
                    {tx.type}
                  </span>
                </td>
                <td className={`p-4 font-bold ${tx.type === "Debit" ? "text-red-600" : "text-green-600"}`}>
                   {tx.amount?.toLocaleString()} {tx.currency || "USD"}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                  {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                currentPage === i + 1 ? "bg-green-600 text-white shadow-md" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ADD TRANSACTION MODAL WITH USER PICKER */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Add Transaction to User</h2>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {/* SELECT USER FROM FIREBASE USERS COLLECTION */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select User</label>
                  <select
                    required
                    value={addData.userId}
                    onChange={handleUserSelect}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">-- Choose a user --</option>
                    {usersList.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName || user.name || user.email} ({user.accountNumber || user.accNum || "No Account #"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target User Name</label>
                    <input
                      type="text"
                      readOnly
                      value={addData.to}
                      placeholder="Auto-filled from user selection"
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-gray-50 text-sm outline-none text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Number</label>
                    <input
                      type="text"
                      readOnly
                      value={addData.accountNumber}
                      placeholder="Auto-filled"
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-gray-50 text-sm outline-none text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sender / Source (From)</label>
                  <input
                    type="text"
                    placeholder="e.g. System / Bank Wire / External Source"
                    value={addData.from}
                    onChange={(e) => setAddData({ ...addData, from: e.target.value })}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={addData.amount}
                      onChange={(e) => setAddData({ ...addData, amount: e.target.value })}
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Currency</label>
                    <input
                      type="text"
                      value={addData.currency}
                      onChange={(e) => setAddData({ ...addData, currency: e.target.value })}
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
                    <select
                      value={addData.type}
                      onChange={(e) => setAddData({ ...addData, type: e.target.value })}
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-white text-sm"
                    >
                      <option value="Deposit">Deposit</option>
                      <option value="Debit">Debit</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                    <select
                      value={addData.status}
                      onChange={(e) => setAddData({ ...addData, status: e.target.value })}
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-white text-sm"
                    >
                      <option value="Successful">Successful</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={addData.timestamp}
                    onChange={(e) => setAddData({ ...addData, timestamp: e.target.value })}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Note / Description</label>
                  <input
                    type="text"
                    placeholder="Optional transaction remarks"
                    value={addData.note}
                    onChange={(e) => setAddData({ ...addData, note: e.target.value })}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-100"
                  >
                    Create Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Edit Transaction</h2>
                <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Number</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    value={editData.accountNumber || ""}
                    onChange={(e) => setEditData({ ...editData, accountNumber: e.target.value })}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                  <input
                    disabled={!isEditing}
                    type="number"
                    value={editData.amount || ""}
                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
                    <select
                      disabled={!isEditing}
                      value={editData.type || ""}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-white disabled:bg-gray-50"
                    >
                      <option value="Deposit">Deposit</option>
                      <option value="Debit">Debit</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                    <select
                      disabled={!isEditing}
                      value={editData.status || ""}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-white disabled:bg-gray-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Successful">Successful</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</label>
                  <input
                    type="datetime-local"
                    disabled={!isEditing}
                    value={editData.timestamp || ""}
                    onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })}
                    className="w-full mt-1 border border-gray-200 p-3 rounded-xl disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex items-center justify-between gap-4">
                {isEditing ? (
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-100"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-100"
                  >
                    Edit Record
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(selectedTx.id)}
                  className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}