"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Loader2,
  Trash2,
  ShieldCheck,
  Lock,
  Unlock,
  Search,
  Filter,
  X,
  Info,
} from "lucide-react";

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const q = query(collection(db, "cards"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCards(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter & Search
  useEffect(() => {
    let filteredList = cards;

    if (filterStatus !== "All") {
      filteredList = filteredList.filter(
        (c) => c.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      filteredList = filteredList.filter(
        (c) =>
          c.name?.toLowerCase().includes(s) ||
          c.cardNumber?.toLowerCase().includes(s) ||
          c.userEmail?.toLowerCase().includes(s)
      );
    }

    setFiltered(filteredList);
  }, [filterStatus, search, cards]);

  // 🔐 Block / Unblock card
  const toggleStatus = async (card) => {
    const newStatus = card.status === "Active" ? "Blocked" : "Active";
    await updateDoc(doc(db, "cards", card.id), { status: newStatus });
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, status: newStatus } : c))
    );
  };

  // ❌ Delete card
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    await deleteDoc(doc(db, "cards", id));
    setCards(cards.filter((c) => c.id !== id));
    setSelectedCard(null);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );

  return (
    <main className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-green-600" />
          Manage Cards
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-1/3 shadow-sm">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by user, card number..."
            className="flex-1 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option>All</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white text-xs uppercase">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Card Number</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Balance</th>
              <th className="py-3 px-4 text-left">Expiry</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No cards found.
                </td>
              </tr>
            ) : (
              filtered.map((card) => (
                <tr
                  key={card.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCard(card)}
                >
                  <td className="py-3 px-4">{card.name || card.userEmail}</td>
                  <td className="py-3 px-4 font-mono">
                    **** **** **** {card.cardNumber?.slice(-4)}
                  </td>
                  <td className="py-3 px-4">{card.cardType || "MasterCard"}</td>
                  <td className="py-3 px-4">${card.balance || 0}</td>
                  <td className="py-3 px-4">{card.expiry || "—"}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      card.status === "Active"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {card.status || "Unknown"}
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(card);
                      }}
                      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      {card.status === "Active" ? (
                        <Lock className="w-4 h-4 inline" />
                      ) : (
                        <Unlock className="w-4 h-4 inline" />
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(card.id);
                      }}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </motion.button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card Details Modal */}
      <AnimatePresence>
        {selectedCard && (
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
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                Card Details
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Holder:</strong> {selectedCard.name || selectedCard.userEmail}</p>
                <p><strong>Card Number:</strong> {selectedCard.cardNumber}</p>
                <p><strong>Type:</strong> {selectedCard.cardType || "MasterCard"}</p>
                <p><strong>Balance:</strong> ${selectedCard.balance || 0}</p>
                <p><strong>Status:</strong> {selectedCard.status}</p>
                <p><strong>Expiry:</strong> {selectedCard.expiry || "—"}</p>
                <p><strong>Date Created:</strong> 
                  {selectedCard.createdAt?.toDate
                    ? selectedCard.createdAt.toDate().toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(selectedCard.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </motion.button>
                <button
                  onClick={() => setSelectedCard(null)}
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
