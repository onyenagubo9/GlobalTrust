"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function KycVerificationPage() {
  const [user, setUser] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState({ front: null, back: null, selfie: null });
  const [status, setStatus] = useState("Pending");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Cloudinary details
  const CLOUD_NAME = "dn0hikijy";
  const UPLOAD_PRESET = "unsigned_avatar";

  // ✅ Load user and KYC
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (loggedUser) => {
      if (!loggedUser) return;

      const userRef = doc(db, "users", loggedUser.uid);
      const kycRef = doc(db, "kyc", loggedUser.uid);
      const userSnap = await getDoc(userRef);
      const kycSnap = await getDoc(kycRef);

      if (userSnap.exists()) setUser({ id: loggedUser.uid, ...userSnap.data() });
      if (kycSnap.exists()) {
        setKycData(kycSnap.data());
        setStatus(kycSnap.data().status || "Pending");
      }
    });

    return () => unsub();
  }, []);

  // ✅ Upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!idFront || !idBack || !selfie) {
      setMessage("❌ Please upload all required images.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Upload to Cloudinary
      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(idFront),
        uploadToCloudinary(idBack),
        uploadToCloudinary(selfie),
      ]);

      // Save to Firestore
      const kycRef = doc(db, "kyc", user.id);
      await setDoc(kycRef, {
        userId: user.id,
        idFront: frontUrl,
        idBack: backUrl,
        selfie: selfieUrl,
        status: "Under Review",
        submittedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", user.id), { kycStatus: "Under Review" });

      setStatus("Under Review");
      setMessage("✅ KYC submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ File input with preview
  const handleFileChange = (e, setFile, type) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview((prev) => ({ ...prev, [type]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            KYC Verification
          </h1>
        </div>

        {/* Status Display */}
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            status === "Approved"
              ? "bg-green-50 border border-green-200 text-green-700"
              : status === "Under Review"
              ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
              : "bg-gray-50 border border-gray-200 text-gray-700"
          }`}
        >
          <span className="font-medium">
            Status: {status === "Pending" ? "Not Submitted" : status}
          </span>
          {status === "Approved" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {status === "Under Review" && (
            <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
          )}
        </div>

        {/* If already verified */}
        {status === "Approved" ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-800">
              Your KYC has been verified!
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Thank you for completing verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-gray-700 font-semibold text-base mb-2">
              Upload Required Documents
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <UploadBox
                label="ID Front"
                preview={preview.front}
                onChange={(e) => handleFileChange(e, setIdFront, "front")}
              />
              <UploadBox
                label="ID Back"
                preview={preview.back}
                onChange={(e) => handleFileChange(e, setIdBack, "back")}
              />
              <UploadBox
                label="Selfie"
                preview={preview.selfie}
                onChange={(e) => handleFileChange(e, setSelfie, "selfie")}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={uploading}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                "Submit KYC for Review"
              )}
            </motion.button>
          </form>
        )}

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 text-sm text-center text-gray-600"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

function UploadBox({ label, preview, onChange }) {
  return (
    <label className="border-2 border-dashed border-gray-300 hover:border-green-500 transition rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer text-center text-sm text-gray-500 relative">
      {preview ? (
        <img
          src={preview}
          alt={label}
          className="w-full h-32 object-cover rounded-lg mb-2"
        />
      ) : (
        <>
          <UploadCloud className="w-6 h-6 mb-2 text-green-600" />
          <span className="font-medium">{label}</span>
        </>
      )}
      <input type="file" className="hidden" accept="image/*" onChange={onChange} />
    </label>
  );
}
