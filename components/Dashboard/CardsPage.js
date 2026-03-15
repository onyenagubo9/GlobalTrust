"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  CreditCard,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function CardsPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const CARD_PRICE = 50;

  // ✅ Load user & card
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        const userRef = doc(db, "users", loggedUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          await fetchUserCard(loggedUser.uid);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchUserCard = async (userId) => {
    const q = query(collection(db, "cards"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setCard({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
    }
  };

  // ✅ Buy card
  const handlePurchaseCard = async () => {
    if (!user || !userData) return;
    if (card) {
      setMessage("❌ You already have a card.");
      return;
    }
    const balance = userData.accountBalance || 0;
    if (balance < CARD_PRICE) {
      setMessage("❌ Insufficient balance to purchase a card.");
      return;
    }

    setProcessing(true);
    try {
      const newBalance = balance - CARD_PRICE;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { accountBalance: newBalance });

      const cardNumber = `5123 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(
        1000 + Math.random() * 9000
      )} ${Math.floor(1000 + Math.random() * 9000)}`;
      const expiry = "12/28";
      const cvv = Math.floor(100 + Math.random() * 900);

      const cardData = {
        userId: user.uid,
        cardNumber,
        expiry,
        cvv,
        cardType: "Virtual USD Card",
        status: "Active",
        balance: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(collection(db, "cards")), cardData);

      await setDoc(doc(collection(db, "transactions")), {
        userId: user.uid,
        type: "Card Purchase",
        amount: CARD_PRICE,
        note: "Virtual USD card purchase",
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      setUserData({ ...userData, accountBalance: newBalance });
      setCard(cardData);
      setMessage("✅ Card purchased successfully!");
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Freeze/unfreeze
  const handleFreezeToggle = async () => {
    if (!card) return;
    try {
      const newStatus = card.status === "Active" ? "Frozen" : "Active";
      await updateDoc(doc(db, "cards", card.id), { status: newStatus });
      setCard({ ...card, status: newStatus });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update card status.");
    }
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <Link
          href="/dashboard"
          className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="flex items-center mb-6">
          <CreditCard className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Your Card</h1>
        </div>

        {/* ✅ Card Display */}
        {card ? (
          <motion.div
            className="relative w-full h-56 perspective mb-6"
            onClick={() => setFlipped(!flipped)}
          >
            <motion.div
              className={`absolute w-full h-full rounded-2xl text-white cursor-pointer shadow-xl transition-transform duration-500 transform-gpu ${
                flipped ? "rotate-y-180" : ""
              }`}
              style={{
                background:
                  card.status === "Frozen"
                    ? "gray"
                    : "linear-gradient(135deg, #059669, #10b981)",
              }}
            >
              {/* Front Side */}
              <div
                className={`absolute inset-0 backface-hidden p-6 flex flex-col justify-between`}
              >
                <div className="flex justify-between">
                  <p className="text-sm">{card.cardType}</p>
                  <RotateCcw className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-2xl font-mono tracking-widest mt-4">
                  {showDetails ? card.cardNumber : "**** **** **** ****"}
                </p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-xs uppercase opacity-70">Expiry</p>
                    <p>{showDetails ? card.expiry : "**/**"}</p>
                  </div>
                  <p className="text-lg font-semibold tracking-wider">
                    GlobalTrust Bank
                  </p>
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 bg-black/80 rounded-2xl flex flex-col justify-between">
                <div className="bg-gray-700 h-10 rounded mt-4"></div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">CVV</p>
                  <p className="font-semibold">{showDetails ? card.cvv : "***"}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl">
            <CreditCard className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 mb-3">
              You don’t have any active cards yet.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={processing}
              onClick={handlePurchaseCard}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-sm font-medium transition"
            >
              {processing ? "Processing..." : "Buy Virtual Card for $50"}
            </motion.button>
          </div>
        )}

        {/* ✅ Controls */}
        {card && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-gray-700 text-sm font-medium hover:text-green-600 transition"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" /> Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" /> Show Details
                </>
              )}
            </button>

            <button
              onClick={handleFreezeToggle}
              className={`flex items-center text-sm font-medium px-3 py-1 rounded-lg shadow-sm transition ${
                card.status === "Active"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {card.status === "Active" ? (
                <>
                  <Lock className="w-4 h-4 mr-1" /> Freeze
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-1" /> Unfreeze
                </>
              )}
            </button>
          </div>
        )}

        {/* ✅ Balance */}
        {userData && (
          <div className="mt-6 text-sm text-gray-600">
            <p>
              <strong>Available Balance:</strong>{" "}
              <span className="font-semibold text-gray-800">
                USD {userData.accountBalance?.toLocaleString() || 0}
              </span>
            </p>
          </div>
        )}

        {/* ✅ Message */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 flex items-center justify-center space-x-2 text-green-600"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Card purchased successfully!</span>
          </motion.div>
        )}
      </div>
    </main>
  );
}
