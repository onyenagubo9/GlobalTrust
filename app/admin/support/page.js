"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { MessageCircle, Send, Loader2, Bell } from "lucide-react";

export default function AdminSupportPanel() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  // 🔥 Listen for all chat messages
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
      setLoading(false);

      // Notify admin when new user message arrives
      const latestMsg = data[data.length - 1];
      if (latestMsg && latestMsg.sender === "user") {
        setNotification(`📨 New message from ${latestMsg.userName}`);
        setTimeout(() => setNotification(""), 4000);
      }
    });
    return () => unsub();
  }, []);

  const users = [...new Set(messages.map((msg) => msg.userName))];
  const userMessages = messages.filter((msg) => msg.userName === selectedUser);

  // ✅ Send Reply
  const sendReply = async (e) => {
    e.preventDefault();
    if (!selectedUser || !reply.trim()) return;

    const messageToSend = reply.trim();
    setReply(""); // Clear instantly

    await addDoc(collection(db, "chats"), {
      userId: messages.find((m) => m.userName === selectedUser)?.userId || "",
      userName: selectedUser,
      message: messageToSend,
      sender: "admin",
      timestamp: serverTimestamp(),
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
              Active Users
            </h2>
            {notification && (
              <div className="flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-lg animate-bounce">
                <Bell className="w-4 h-4 mr-1" /> {notification}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-sm">No active chats.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((name, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedUser(name)}
                  className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedUser === name
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
          {selectedUser ? (
            <>
              <h2 className="font-semibold text-gray-800 border-b pb-2 mb-4">
                Chat with {selectedUser}
              </h2>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4 h-[60vh]">
                {userMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg text-sm max-w-[70%] ${
                        msg.sender === "admin"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p>{msg.message}</p>
                      {msg.timestamp?.toDate && (
                        <span className="block text-[10px] opacity-70 mt-1 text-right">
                          {msg.timestamp.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={sendReply} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-20">
              Select a user to start chatting 💬
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
