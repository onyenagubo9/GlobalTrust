"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export default function EditProfilePage() {
  const [uid, setUid] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    country: "",
  });
  const [avatar, setAvatar] = useState("/profile.png");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch user data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            country: data.country || "",
          });
          setAvatar(data.avatar || "/profile.png");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Handle text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Upload image to Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("📤 Uploading image...");

    try {
      // Your Cloudinary account info
      const CLOUD_NAME =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your_cloud_name"; // fallback
      const UPLOAD_PRESET = "unsigned_avatar"; // preset must be unsigned in Cloudinary settings

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setAvatar(data.secure_url);
        setMessage("✅ Image uploaded successfully!");
      } else {
        console.error("Cloudinary upload failed:", data);
        setMessage(`❌ Upload failed: ${data.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setMessage("❌ Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save user updates
  const handleSave = async (e) => {
    e.preventDefault();
    if (!uid) return;

    setLoading(true);
    setMessage("💾 Saving changes...");

    try {
      await updateDoc(doc(db, "users", uid), {
        ...formData,
        avatar,
      });
      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <a
          href="/settings"
          className="text-sm text-green-600 hover:underline mb-3 inline-block"
        >
          ← Back to Settings
        </a>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Edit Profile
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Update your personal details and profile picture.
        </p>

        {/* 👤 Profile Avatar */}
        <div className="flex flex-col items-center space-y-3 mb-8">
          <div className="relative">
            <img
              src={avatar}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border border-green-200 shadow-sm"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-1 right-1 ${
                uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } p-2 rounded-full cursor-pointer shadow-md transition-all`}
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={uploading}
            />
          </div>
          <p className="text-sm text-gray-500">
            {uploading ? "Uploading..." : "Tap the camera to change photo"}
          </p>
        </div>

        {/* 📝 Form */}
        <form onSubmit={handleSave} className="space-y-4 text-sm sm:text-base">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="mt-6 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all shadow-sm"
          >
            {loading ? "Saving..." : "Save Changes"}
          </motion.button>

          {message && (
            <p
              className={`mt-3 text-sm ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("❌")
                  ? "text-red-500"
                  : "text-gray-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
