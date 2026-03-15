"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
  User,
  Clock,
} from "lucide-react";

export default function AdminKYCPage() {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const q = query(collection(db, "kyc"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKycList(data);
      } catch (err) {
        console.error("Error fetching KYC:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "kyc", userId), { status: newStatus });
      await updateDoc(doc(db, "users", userId), { kycStatus: newStatus });
      setKycList((prev) =>
        prev.map((k) =>
          k.userId === userId ? { ...k, status: newStatus } : k
        )
      );
      alert(`✅ KYC ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update KYC status.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );

  return (
    <main className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-green-600" />
        KYC Verification Management
      </h1>

      <div className="overflow-x-auto border border-gray-100 bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white text-xs uppercase">
            <tr>
              <th className="py-3 px-4 text-left">User ID</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Submitted</th>
              <th className="py-3 px-4 text-center">View</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycList.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-gray-500 italic"
                >
                  No KYC submissions yet.
                </td>
              </tr>
            ) : (
              kycList.map((kyc) => (
                <tr
                  key={kyc.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{kyc.userId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        kyc.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : kyc.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {kyc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {kyc.submittedAt?.toDate
                      ? new Date(kyc.submittedAt.toDate()).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedUser(kyc)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      <Eye className="w-5 h-5 inline-block" />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => handleStatusChange(kyc.userId, "Approved")}
                      className="text-green-700 hover:text-green-800 font-semibold text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(kyc.userId, "Rejected")}
                      className="text-red-600 hover:text-red-700 font-semibold text-xs"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative"
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-green-600" /> User ID:{" "}
              {selectedUser.userId}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <KycImageCard title="Front ID" src={selectedUser.idFront} />
              <KycImageCard title="Back ID" src={selectedUser.idBack} />
              <KycImageCard title="Selfie" src={selectedUser.selfie} />
            </div>

            <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
              <p className="flex items-center gap-1">
                <Clock className="w-4 h-4" />{" "}
                {selectedUser.submittedAt?.toDate
                  ? new Date(
                      selectedUser.submittedAt.toDate()
                    ).toLocaleString()
                  : "Unknown"}
              </p>
              <span>
                Status:{" "}
                <strong className="text-gray-700">
                  {selectedUser.status || "Pending"}
                </strong>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

function KycImageCard({ title, src }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <p className="text-xs text-gray-500 p-2 bg-white border-b font-medium">
        {title}
      </p>
      {src ? (
        <img
          src={src}
          alt={title}
          className="w-full h-32 object-cover hover:scale-105 transition-transform"
        />
      ) : (
        <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
          No Image
        </div>
      )}
    </div>
  );
}
