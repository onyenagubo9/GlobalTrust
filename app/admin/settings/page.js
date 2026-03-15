"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  Loader2,
  Moon,
  Sun,
  Shield,
  Globe,
  Bell,
  Lock,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "FirstCBU Bank",
    defaultCurrency: "USD",
    maintenanceMode: false,
    transactionLimit: 5000,
    notifications: true,
  });

  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    password: "",
  });

  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load current settings from Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settingsRef = doc(db, "config", "adminSettings");
        const snap = await getDoc(settingsRef);
        if (snap.exists()) setSettings(snap.data());
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Save updated settings
  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage("");
    try {
      const settingsRef = doc(db, "config", "adminSettings");
      await updateDoc(settingsRef, settings);
      setMessage("✅ Settings updated successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage("❌ Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-green-600" />
            Admin Settings
          </h1>
          <button
            onClick={handleThemeToggle}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 rounded-full p-2 hover:scale-105 transition"
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
        </div>

        {/* App Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-green-600" /> Application Settings
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 mb-1 text-sm font-medium">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 mb-1 text-sm font-medium">
                  Default Currency
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCurrency: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>NGN</option>
                  <option>GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 mb-1 text-sm font-medium">
                  Transaction Limit ($)
                </label>
                <input
                  type="number"
                  value={settings.transactionLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transactionLimit: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Maintenance Mode
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-green-600"
                />
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={saving}
            onClick={handleSaveSettings}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            ) : (
              <Save className="w-4 h-4 inline mr-2" />
            )}
            Save Settings
          </motion.button>

          {message && (
            <p className="text-sm mt-3 text-green-600 dark:text-green-400">
              {message}
            </p>
          )}
        </motion.div>

        {/* Admin Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-green-600" /> Admin Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={adminProfile.name}
              onChange={(e) =>
                setAdminProfile({ ...adminProfile, name: e.target.value })
              }
              placeholder="Admin Name"
              className="border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
            <input
              type="email"
              value={adminProfile.email}
              onChange={(e) =>
                setAdminProfile({ ...adminProfile, email: e.target.value })
              }
              placeholder="Admin Email"
              className="border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
            <input
              type="password"
              value={adminProfile.password}
              onChange={(e) =>
                setAdminProfile({ ...adminProfile, password: e.target.value })
              }
              placeholder="Change Password"
              className="border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 col-span-2"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Update Profile
          </motion.button>
        </motion.div>

        {/* Notification Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-green-600" /> Notifications
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              Enable admin email notifications
            </span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) =>
                setSettings({ ...settings, notifications: e.target.checked })
              }
              className="w-5 h-5 accent-green-600"
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
