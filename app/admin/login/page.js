"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Check Firestore for admin role
      const adminDoc = await getDoc(doc(db, "admins", uid));
      if (adminDoc.exists() && adminDoc.data().role === "admin") {
        router.push("/admin");
      } else {
        setError("Access denied: Not an admin");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or not an admin");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-3 w-72">
        <input
          type="email"
          placeholder="Admin Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </main>
  );
}
