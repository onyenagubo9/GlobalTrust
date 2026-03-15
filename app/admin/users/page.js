"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Trash,
  Edit,
  Loader2,
  Save,
  X,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    accountStatus: "",
    accountBalance: "",
  });

  const [saving, setSaving] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    const usersList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setUsers(usersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    await deleteDoc(doc(db, "users", id));
    setUsers(users.filter((u) => u.id !== id));
    alert("❌ User deleted");
  };

  // Open modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      accountStatus: user.accountStatus || "Active",
      accountBalance: user.accountBalance || 0,
    });
  };

  // Save updates
  const handleSave = async () => {
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        accountStatus: formData.accountStatus,
        accountBalance: Number(formData.accountBalance),
      });

      alert("✅ User updated successfully!");
      setSaving(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  // Suspend / Unsuspend User
  const toggleSuspend = async (user) => {
    try {
      const newState = !user.suspended;
      await updateDoc(doc(db, "users", user.id), {
        suspended: newState,
        accountStatus: newState ? "Suspended" : "Active",
      });

      alert(
        newState
          ? "⛔ User suspended successfully"
          : "✅ User reactivated successfully"
      );

      fetchUsers();
    } catch (err) {
      console.error("Suspend error:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Users</h1>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-100 rounded-xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white text-xs uppercase">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left hidden sm:table-cell">
                Email
              </th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">
                Balance
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 font-medium text-gray-700">
                  <div className="flex flex-col">
                    {user.name || "—"}
                    <span className="text-xs text-gray-500 sm:hidden">
                      {user.email}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 hidden sm:table-cell text-gray-700">
                  {user.email}
                </td>

                <td
                  className={`py-3 px-4 font-semibold ${
                    user.suspended
                      ? "text-red-600"
                      : user.accountStatus === "Active"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {user.suspended ? "Suspended" : user.accountStatus || "Active"}
                </td>

                <td className="py-3 px-4 hidden md:table-cell font-semibold">
                  ${user.accountBalance?.toLocaleString() || 0}
                </td>

                <td className="py-3 px-4 flex justify-center space-x-2">
                  {/* Edit Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditModal(user)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  {/* Suspend Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSuspend(user)}
                    className={`px-2 py-1 rounded text-xs text-white ${
                      user.suspended
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {user.suspended ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <ShieldBan className="w-4 h-4" />
                    )}
                  </motion.button>

                  {/* Delete Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(user.id)}
                    className="bg-black hover:bg-gray-900 text-white px-2 py-1 rounded text-xs"
                  >
                    <Trash className="w-4 h-4" />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Edit User
              </h2>
              <button onClick={() => setEditingUser(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm text-gray-600">
                  Account Status
                </label>
                <select
                  value={formData.accountStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, accountStatus: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option>Active</option>
                  <option>Suspended</option>
                  <option>Closed</option>
                </select>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-sm text-gray-600">
                  Account Balance
                </label>
                <input
                  type="number"
                  value={formData.accountBalance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountBalance: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
