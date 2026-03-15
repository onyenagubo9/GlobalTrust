"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function UserDetails() {
  const { id } = useParams(); // user UID
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch the user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Handle field changes during edit mode
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save edited info
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: user.name,
        phone: user.phone,
        address: user.address,
        country: user.country,
        accountType: user.accountType,
        accountStatus: user.accountStatus,
        accountBalance: parseFloat(user.accountBalance),
      });
      setEditMode(false);
      setMessage("✅ User details updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage("❌ Failed to update user details.");
    } finally {
      setSaving(false);
    }
  };

  // 🟡 Toggle account status (Suspend / Reactivate)
  const toggleAccountStatus = async () => {
    if (!user) return;

    const newStatus =
      user.accountStatus === "Active"
        ? "Frozen"
        : user.accountStatus === "Frozen"
        ? "Active"
        : "Closed";

    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { accountStatus: newStatus });
      setUser({ ...user, accountStatus: newStatus });

      setMessage(
        newStatus === "Active"
          ? "✅ Account reactivated successfully!"
          : "⚠️ Account has been suspended!"
      );
    } catch (err) {
      console.error("Error updating account status:", err);
      setMessage("❌ Failed to update account status.");
    }
  };

  if (loading) return <p className="p-6">Loading user details...</p>;
  if (!user) return <p className="p-6">User not found.</p>;

  return (
    <main className="p-6 font-sans">
      <button
        onClick={() => router.push("/admin")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Admin Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
      <p className="text-gray-600 mb-4">{user.email}</p>

      <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
        {/* Editable fields */}
        <div>
          <h3 className="font-semibold">Phone:</h3>
          {editMode ? (
            <input
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{user.phone}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Address:</h3>
          {editMode ? (
            <input
              name="address"
              value={user.address}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{user.address}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Country:</h3>
          {editMode ? (
            <input
              name="country"
              value={user.country}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{user.country}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Account Type:</h3>
          {editMode ? (
            <select
              name="accountType"
              value={user.accountType}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="Savings">Savings</option>
              <option value="Checking">Checking</option>
              <option value="Business">Business</option>
            </select>
          ) : (
            <p>{user.accountType}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Account Balance:</h3>
          {editMode ? (
            <input
              type="number"
              name="accountBalance"
              value={user.accountBalance}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{user.accountBalance}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Account Status:</h3>
          <p
            className={`font-semibold ${
              user.accountStatus === "Active"
                ? "text-green-600"
                : user.accountStatus === "Frozen"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {user.accountStatus}
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Account Number:</h3>
          <p>{user.accountNumber}</p>
        </div>

        <div>
          <h3 className="font-semibold">Date Created:</h3>
          <p>
            {user.dateCreated?.toDate
              ? user.dateCreated.toDate().toLocaleString()
              : "N/A"}
          </p>
        </div>
      </div>

      {/* 🔘 Edit and Suspend/Reactivate buttons */}
      <div className="mt-6 flex flex-wrap gap-4">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Details
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}

        {/* 🟡 Suspend/Reactivate button */}
        {user.accountStatus !== "Closed" && (
          <button
            onClick={toggleAccountStatus}
            className={`${
              user.accountStatus === "Active"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded`}
          >
            {user.accountStatus === "Active"
              ? "Suspend Account"
              : "Reactivate Account"}
          </button>
        )}
      </div>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}
